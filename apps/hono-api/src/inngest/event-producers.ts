import { db } from "../services/db";
import { inngest } from "./client";

export const triggerCourseProcessing = inngest.createFunction(
  {
    id: "trigger-course-processing",
    concurrency: {
      limit: 1,
      key: "event.name",
    },
  },
  { event: "courses/trigger-processing" },
  async ({ step, runId }) => {
    // biome-ignore lint/suspicious/noConsole: Debug logging
    console.log(
      `[Start] Beginning course processing trigger - Run ID: ${runId}`
    );

    const BATCH_SIZE = 100;
    let skip = 0;
    let totalProcessed = 0;

    for (;;) {
      // Step: Fetch batch of unprocessed courses
      const courses = await step.run(
        `fetch-courses-batch-${skip}`,
        async () => {
          const result = await db.course.findMany({
            select: {
              id: true,
              departmentPrefix: true,
              metadata: true,
            },
            skip,
            take: BATCH_SIZE,
          });

          // biome-ignore lint/suspicious/noConsole: Debug logging
          console.log(
            `[Batch ${skip / BATCH_SIZE}] Fetched ${result.length} courses (skip: ${skip})`
          );
          return result;
        }
      );

      skip += BATCH_SIZE;

      // Step: Prepare events for this batch
      const courseEvents = await step.run(
        `prepare-events-batch-${skip}`,
        () => {
          const events = courses
            .map((course) => {
              const metadata = course.metadata as unknown as {
                matchingSectionIds?: string[];
              };

              const sectionIds = metadata.matchingSectionIds ?? [];

              // Skip courses without section IDs
              if (sectionIds.length === 0) {
                return null;
              }

              return {
                name: "course/process" as const,
                data: {
                  courseId: course.id,
                  sectionIds,
                  departmentPrefix: course.departmentPrefix,
                },
              };
            })
            .filter((ev): ev is NonNullable<typeof ev> => ev !== null);

          // biome-ignore lint/suspicious/noConsole: Debug logging
          console.log(
            `[Batch ${skip / BATCH_SIZE}] Created ${events.length} events (${courses.length - events.length} skipped)`
          );

          return events;
        }
      );

      // Step: Send events (must be separate from step.run to avoid nesting)
      let eventsCount = 0;
      if (courseEvents.length > 0) {
        await step.sendEvent(`send-events-${skip}`, courseEvents);
        eventsCount = courseEvents.length;
      }

      totalProcessed += courseEvents.length;

      // biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        `[Progress] Total processed so far: ${totalProcessed}, Events sent: ${eventsCount}`
      );

      // Break if no more courses in this batch
      if (courses.length < BATCH_SIZE) {
        // biome-ignore lint/suspicious/noConsole: Debug logging
        console.log(
          `[Loop End] Fetched ${courses.length} courses, less than batch size ${BATCH_SIZE}. Stopping.`
        );
        break;
      }

      // biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        `[Loop Continue] Will fetch next batch starting at skip=${skip}`
      );
    }

    const result = {
      totalCoursesProcessed: totalProcessed,
      message: `Triggered processing for ${totalProcessed} courses`,
    };

    // biome-ignore lint/suspicious/noConsole: Debug logging
    console.log("[Complete]", result);
    return result;
  }
);
