import { scraper } from "../services/acadia";
import { prisma } from "../services/db";
import { inngest } from "./client";

export const processCourse = inngest.createFunction(
  {
    id: "process-course",
    concurrency: {
      limit: 1,
    },
    rateLimit: {
      limit: 30,
      period: "1m",
    },
  },
  { event: "course/process" },
  async ({ event, step }) => {
    const { courseId, sectionIds, departmentPrefix } = event.data;

    // Step 1: Fetch section details
    const sectionDetails = await step.run("fetch-section-details", async () => {
      return await scraper.getSectionDetails(courseId, sectionIds);
    });

    // Step 2: Save sections and instructors to database
    await step.run("save-sections-to-db", async () => {
      // Collect all unique instructors across all terms and sections
      const allInstructors = new Set<string>();
      const instructorNames = new Map<string, string>();

      for (const term of sectionDetails) {
        for (const section of term.sections) {
          for (const instructor of section.instructors) {
            allInstructors.add(instructor.id);
            instructorNames.set(instructor.id, instructor.name);
          }
        }
      }

      // Upsert all professors
      await Promise.all(
        Array.from(allInstructors).map((instructorId) =>
          prisma.professor.upsert({
            where: { id: instructorId },
            update: {
              name: instructorNames.get(instructorId) ?? "",
            },
            create: {
              id: instructorId,
              name: instructorNames.get(instructorId) ?? "",
              departmentPrefix,
            },
          })
        )
      );

      // Link all instructors to the course
      await Promise.all(
        Array.from(allInstructors).map((instructorId) =>
          prisma.courseProfessor.upsert({
            where: {
              courseId_professorId: {
                courseId,
                professorId: instructorId,
              },
            },
            update: {},
            create: {
              courseId,
              professorId: instructorId,
            },
          })
        )
      );

      // Upsert all sections
      for (const term of sectionDetails) {
        await Promise.all(
          term.sections.map((section) => {
            // Use first instructor as the section's professor
            const primaryInstructor = section.instructors[0];
            if (!primaryInstructor) {
              return Promise.resolve();
            }

            // Format meeting times
            const meetingTime = section.meetingTimes[0];
            const classTime = meetingTime
              ? `${meetingTime.startTime} - ${meetingTime.endTime}`
              : "TBD";
            const room = meetingTime
              ? `${meetingTime.building} ${meetingTime.room}`
              : "TBD";
            const days = meetingTime?.days ?? [];

            return prisma.section.upsert({
              where: { id: section.id },
              update: {
                code: section.id,
                description: section.courseName,
                startDate: new Date(term.startDate),
                endDate: new Date(term.endDate),
                classTime,
                room,
                days,
              },
              create: {
                id: section.id,
                code: section.id,
                description: section.courseName,
                courseId,
                professorId: primaryInstructor.id,
                startDate: new Date(term.startDate),
                endDate: new Date(term.endDate),
                classTime,
                room,
                days,
              },
            });
          })
        );
      }

      return {
        professorsUpserted: allInstructors.size,
        sectionsUpserted: sectionDetails.reduce(
          (acc, term) => acc + term.sections.length,
          0
        ),
      };
    });
  }
);
