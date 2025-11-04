import { NonRetriableError } from "inngest";
import { prisma } from "../services/db";
import { scraper } from "../services/rmp";
import { matchProfessorsWithRMP } from "../utils/ai-matcher";
import { RMP_ACADIA_ID } from "../utils/constants";
import { inngest } from "./client";

export const linkProfessorsWithRmp = inngest.createFunction(
  {
    id: "link-professors-with-rmp",
    singleton: {
      key: "link-professors-with-rmp",
      mode: "skip",
    },
  },
  { event: "sync/link-professors-with-rmp" },
  async ({ step }) => {
    // Step 1: Fetch professors without RMP ID
    const professors = await step.run("fetch-professors", async () => {
      return await prisma.professor.findMany({
        where: { rmpId: null },
        select: {
          id: true,
          name: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    if (professors.length === 0) {
      throw new NonRetriableError("No professors to link");
    }

    // Step 2: Format professors for matching
    const formattedProfessors = await step.run("format-professors", () => {
      return professors.map((professor) => ({
        id: professor.id,
        name: professor.name,
        department: professor.department.name,
      }));
    });

    // Step 3: Fetch RMP professors
    const rmpProfessors = await step.run("fetch-rmp-professors", async () => {
      return await scraper.searchTeachersBySchoolId(RMP_ACADIA_ID);
    });

    // Step 4: Match professors with RMP
    const matches = await step.run("match-professors", async () => {
      return await matchProfessorsWithRMP(formattedProfessors, rmpProfessors);
    });

    const matchesWithRmpId = matches.filter((match) => match.rmpId !== null);

    // Step 5: Update professors with RMP IDs
    const totalUpdated = await step.run("update-professors", async () => {
      let count = 0;
      for (const match of matchesWithRmpId) {
        await prisma.professor.update({
          where: { id: match.professorId },
          data: { rmpId: match.rmpId },
        });
        count++;
      }
      return count;
    });

    return {
      success: true,
      totalProcessed: professors.length,
      totalMatched: matchesWithRmpId.length,
      totalUpdated,
    };
  }
);
