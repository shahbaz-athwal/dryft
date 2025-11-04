import { scraper } from "../services/acadia";
import { prisma } from "../services/db";
import { inngest } from "./client";

export const syncProfessors = inngest.createFunction(
  {
    id: "sync-professors",
    concurrency: {
      limit: 1,
    },
    rateLimit: {
      limit: 60,
      period: "1m",
    },
  },
  { event: "professors/sync" },
  async ({ event, step }) => {
    const { waitTimeSeconds, onlyUnsyncedDepartments } = event.data;

    // Step 1: Fetch departments to process
    const departments = await step.run("fetch-departments", async () => {
      return await prisma.department.findMany({
        where: onlyUnsyncedDepartments
          ? {
              lastSync: null,
            }
          : undefined,
      });
    });

    let totalProfessorsCreated = 0;
    let totalProfessorsUpdated = 0;
    const errors: Array<{ departmentPrefix: string; error: string }> = [];

    // Step 2: Process each department
    for (const department of departments) {
      await step.run(`process-department-${department.prefix}`, async () => {
        try {
          const faculties = await scraper.getFacultiesByDepartment(
            department.prefix
          );

          for (const faculty of faculties) {
            const result = await prisma.professor.upsert({
              where: { id: faculty.id },
              update: {
                name: faculty.name,
              },
              create: {
                id: faculty.id,
                name: faculty.name,
                departmentPrefix: department.prefix,
              },
            });

            const wasCreated =
              result.createdAt.getTime() === result.updatedAt.getTime();
            if (wasCreated) {
              totalProfessorsCreated++;
            } else {
              totalProfessorsUpdated++;
            }
          }

          await prisma.department.update({
            where: { prefix: department.prefix },
            data: { lastSync: new Date() },
          });

          // Wait before processing next department (rate limiting)
          await new Promise((resolve) =>
            setTimeout(resolve, waitTimeSeconds * 1000)
          );
        } catch (error) {
          errors.push({
            departmentPrefix: department.prefix,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });
    }

    return {
      success: true,
      departmentsProcessed: departments.length,
      professorsCreated: totalProfessorsCreated,
      professorsUpdated: totalProfessorsUpdated,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
);
