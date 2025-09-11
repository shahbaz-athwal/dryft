import { prisma } from "@repo/db/client";
import { AcadiaScraper } from "@repo/scraper/acadia";
import { publicProcedure, router } from "../trpc";

export const acadiaImporterRouter = router({
  // Import all departments from acadia
  importAllDepartments: publicProcedure.mutation(async () => {
    const username = process.env.ACADIA_USERNAME;
    const password = process.env.ACADIA_PASSWORD;

    if (!(username && password)) {
      throw new Error("ACADIA_USERNAME and ACADIA_PASSWORD must be set");
    }

    const scraper = new AcadiaScraper({ username, password });
    const allDepartments = (await scraper.postSearchCriteria()).Subjects.map(
      (dept) => ({
        name: dept.Value,
        description: dept.Description,
      })
    );

    await prisma.department.createMany({
      data: allDepartments.map((dept) => ({
        prefix: dept.name,
        name: dept.description,
      })),
    });
  }),
});
