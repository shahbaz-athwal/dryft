import { scraper } from "../services/acadia";
import { db } from "../services/db";
import { inngest } from "./client";

export const populateCourses = inngest.createFunction(
  {
    id: "populate-courses",
  },
  { event: "courses/populate" },
  async ({ step }) => {
    // Step 1: Fetch all courses from scraper
    const courses = await step.run("fetch-courses", async () => {
      return await scraper.getAllCourses();
    });

    // Step 2: Insert courses into database
    const createdCourses = await step.run("insert-courses", async () => {
      return await db.course.createMany({
        data: courses.map((course) => ({
          id: course.id,
          code: course.code,
          title: course.title,
          description: course.description || "",
          departmentPrefix: course.subjectCode,
          matchingSectionIds: course.matchingSectionIds,
          credits: course.credits,
          requisites: course.courseRequisites,
        })),
        skipDuplicates: true,
      });
    });

    return `${createdCourses.count} courses created`;
  }
);
