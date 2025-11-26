import { scraper } from "../services/acadia";
import { db } from "../services/db";
import { inngest } from "./client";

export const processCourse = inngest.createFunction(
  {
    id: "process-course",
    description:
      "Pull and populates sections and instructors for a course.\n" +
      "- Triggered by the `courses/trigger-processing` event\n" +
      "- Fetches section details from Acadia\n" +
      "- Collects all unique instructors across all terms and sections\n" +
      "- Upserts all professors\n" +
      "- Links all instructors to the course\n" +
      "- Upserts all sections",
    concurrency: {
      limit: 1,
    },
  },
  { event: "course/process" },
  async ({ event, step }) => {
    const { courseId, sectionIds, departmentPrefix } = event.data;

    // Step 1: Fetch section details
    const sectionDetails = await step.run("fetch-section-details", async () => {
      return await scraper.getSectionDetails(courseId, sectionIds);
    });

    // Step 2: Collect all unique instructors
    const instructorData = await step.run("collect-instructors", () => {
      const allInstructors = new Set<string>();
      const instructorNames: Record<string, string> = {};

      for (const term of sectionDetails) {
        for (const section of term.sections) {
          for (const instructor of section.instructors) {
            allInstructors.add(instructor.id);
            instructorNames[instructor.id] = instructor.name;
          }
        }
      }

      return {
        instructorIds: Array.from(allInstructors),
        instructorNames,
      };
    });

    // Step 3: Upsert all professors
    await step.run("upsert-professors", async () => {
      await Promise.all(
        instructorData.instructorIds.map((instructorId) =>
          db.professor.upsert({
            where: { id: instructorId },
            update: {
              name: instructorData.instructorNames[instructorId] ?? "",
            },
            create: {
              id: instructorId,
              name: instructorData.instructorNames[instructorId] ?? "",
              departmentPrefix,
            },
          })
        )
      );
    });

    // Step 4: Link all instructors to the course
    await step.run("link-instructors-to-course", async () => {
      await Promise.all(
        instructorData.instructorIds.map((instructorId) =>
          db.courseProfessor.upsert({
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
    });

    // Step 5: Upsert all sections
    const createdSectionIds = await step.run("upsert-sections", async () => {
      const processedSectionIds: string[] = [];

      for (const term of sectionDetails) {
        const sections = await Promise.all(
          term.sections.map((section) => {
            // Use first instructor as the section's professor
            const primaryInstructor = section.instructors[0];
            if (!primaryInstructor) {
              return Promise.resolve(null);
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

            return db.section.upsert({
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

        for (const section of sections) {
          if (section) {
            processedSectionIds.push(section.id);
          }
        }
      }

      return processedSectionIds;
    });

    // Step 6: Update course metadata
    await step.run("update-course-metadata", async () => {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { metadata: true },
      });

      // biome-ignore lint: no-non-null-assertion
      const existingMetadata = course!.metadata as unknown as {
        matchingSectionIds: string[];
        processed: { sectionIds: string[]; timestamp: Date };
      };

      await db.course.update({
        where: { id: courseId },
        data: {
          metadata: {
            matchingSectionIds: existingMetadata.matchingSectionIds,
            processed: {
              ...(existingMetadata.processed ?? {}),
              sectionIds: createdSectionIds,
              timestamp: new Date(),
            },
          },
        },
      });
    });
  }
);
