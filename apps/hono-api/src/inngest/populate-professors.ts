import { scraper } from "../services/acadia";
import { db } from "../services/db";
import { inngest } from "./client";

export const populateProfessors = inngest.createFunction(
  {
    id: "populate-professors",
    singleton: {
      key: "populate-professors",
      mode: "skip",
    },
  },
  { event: "populate/acadia-department-professors" },
  async ({ event, step }) => {
    const { waitTimeSeconds, onlyUnsyncedDepartments } = event.data;

    // Step 1: Fetch departments to process
    const departments = await step.run("fetch-departments", async () => {
      return await db.department.findMany({
        where: onlyUnsyncedDepartments
          ? {
              lastSync: null,
            }
          : undefined,
      });
    });

    // Step 2: Fetch all faculties from all departments
    const facultiesByDepartment = new Map<
      string,
      { id: string; name: string }[]
    >();

    for (const department of departments) {
      const faculties = await step.run(
        `fetch-faculties-${department.prefix}`,
        async () => {
          return await scraper.getFacultiesByDepartment(department.prefix);
        }
      );

      facultiesByDepartment.set(department.prefix, faculties);

      await step.sleep("throttle", `${waitTimeSeconds}s`);
    }

    // Step 3: Upsert all professors concurrently
    await step.run("upsert-all-professors", async () => {
      const upsertPromises: Promise<unknown>[] = [];

      for (const [departmentPrefix, faculties] of facultiesByDepartment) {
        for (const faculty of faculties) {
          upsertPromises.push(
            db.professor.upsert({
              where: { id: faculty.id },
              update: {
                name: faculty.name,
              },
              create: {
                id: faculty.id,
                name: faculty.name,
                departmentPrefix,
              },
            })
          );
        }
      }

      await Promise.all(upsertPromises);
    });

    // Step 4: Update all department sync timestamps concurrently
    await step.run("update-all-sync-timestamps", async () => {
      const updatePromises = departments.map((department) =>
        db.department.update({
          where: { prefix: department.prefix },
          data: { lastSync: new Date() },
        })
      );

      await Promise.all(updatePromises);
    });
  }
);
