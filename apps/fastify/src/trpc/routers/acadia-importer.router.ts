import { AcadiaScraper } from "@repo/scraper";
import { publicProcedure, router } from "../trpc";

export const acadiaImporterRouter = router({
  importAllDepartments: publicProcedure.mutation(async () => {
    const username = process.env.ACADIA_USERNAME;
    const password = process.env.ACADIA_PASSWORD;

    if (!username || !password) {
      throw new Error("ACADIA_USERNAME and ACADIA_PASSWORD must be set");
    }

    const scraper = new AcadiaScraper({ username, password });

    const departments = await scraper.postSearchCriteria();
    return departments.Subjects.map((s) => s.Value);
  }),
});
