import { scraper } from "../services/acadia";
import { prisma } from "../services/db";
import { inngest } from "./client";

export const populateCourses = inngest.createFunction(
  {
    id: "populate-courses",
    concurrency: {
      limit: 1,
    },
  },
  { event: "courses/populate" },
  async ({ step }) => {
    // Step 1: Fetch all courses from scraper
    const { courses } = await step.run("fetch-courses", async () => {
      return await scraper.getAllCourses();
    });

    // Step 2: Format courses for insertion
    const coursesToInsert = await step.run("format-courses", () => {
      return courses.map((course) => ({
        id: course.Id,
        code: course.SubjectCode + course.Number,
        title: course.Title,
        description: course.Description,
        departmentPrefix: course.SubjectCode,
        metadata: {
          matchingSectionIds: course.MatchingSectionIds,
        },
      }));
    });

    // Step 3: Insert courses into database
    await step.run("insert-courses", async () => {
      return await prisma.course.createMany({
        data: coursesToInsert,
        skipDuplicates: true,
      });
    });
  }
);
