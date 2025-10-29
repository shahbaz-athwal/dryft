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
  }
);
