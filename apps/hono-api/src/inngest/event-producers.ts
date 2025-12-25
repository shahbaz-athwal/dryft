import { db } from "../services/db";
import { inngest } from "./client";

export const triggerCourseProcessing = inngest.createFunction(
  {
    id: "trigger-course-processing",
    singleton: {
      key: "trigger-course-processing",
      mode: "skip",
    },
  },
  { event: "courses/trigger-processing" },
  async ({ step }) => {
    const courses = await step.run("fetch-courses-with-sections", async () => {
      return await db.course.findMany({
        where: {
          matchingSectionIds: { isEmpty: false },
        },
        select: {
          id: true,
          matchingSectionIds: true,
          departmentPrefix: true,
        },
      });
    });

    await step.sendEvent(
      "send-process-events",
      courses.map((course) => ({
        name: "course/process",
        data: {
          courseId: course.id,
          sectionIds: course.matchingSectionIds,
          departmentPrefix: course.departmentPrefix,
        },
      }))
    );

    const message = `Triggered processing for ${courses.length} courses`;
    await step.run("insert-log", async () => {
      return await db.log.create({
        data: {
          message,
        },
      });
    });

    return message;
  }
);
