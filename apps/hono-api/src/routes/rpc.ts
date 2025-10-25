import { os } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { z } from "zod";
import { scraper } from "../services/scrapers/acadia";
import { prisma } from "../utils/db";

export const syncProfessors = os
  .input(
    z.object({
      waitTimeSeconds: z.number().min(0).max(10).default(1),
      onlyUnsyncedDepartments: z.boolean().default(false),
    })
  )
  .handler(async ({ input }) => {
    const departments = await prisma.department.findMany({
      where: input.onlyUnsyncedDepartments
        ? {
            lastSync: null,
          }
        : undefined,
    });

    let totalProfessorsCreated = 0;
    let totalProfessorsUpdated = 0;
    const errors: Array<{ departmentPrefix: string; error: string }> = [];

    for (const department of departments) {
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
          setTimeout(resolve, input.waitTimeSeconds * 1000)
        );
      } catch (error) {
        // biome-ignore lint: console.error is allowed
        console.error(error);
      }
    }

    return {
      success: true,
      departmentsProcessed: departments.length,
      professorsCreated: totalProfessorsCreated,
      professorsUpdated: totalProfessorsUpdated,
      errors: errors.length > 0 ? errors : undefined,
    };
  });

export const linkProfessorsWithRmp = os.handler(async () => {
  const professors = await prisma.professor.findMany({
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

  if (professors.length === 0) {
    return {
      success: true,
      message: "No professors to link",
      totalProcessed: 0,
      totalMatched: 0,
      totalUpdated: 0,
    };
  }

  const formattedProfessors = professors.map((professor) => ({
    id: professor.id,
    name: professor.name,
    department: professor.department.name,
  }));

  const { scraper: rmpScraper } = await import("../services/scrapers/rmp");
  const { RMP_ACADIA_ID } = await import("../utils/constants");
  const rmpProfessors =
    await rmpScraper.searchTeachersBySchoolId(RMP_ACADIA_ID);

  const { matchProfessorsWithRMP } = await import("../utils/ai-matcher");
  const matches = await matchProfessorsWithRMP(
    formattedProfessors,
    rmpProfessors
  );

  const matchesWithRmpId = matches.filter((match) => match.rmpId !== null);

  let totalUpdated = 0;
  for (const match of matchesWithRmpId) {
    await prisma.professor.update({
      where: { id: match.professorId },
      data: { rmpId: match.rmpId },
    });
    totalUpdated++;
  }

  return {
    success: true,
    totalProcessed: professors.length,
    totalMatched: matchesWithRmpId.length,
    totalUpdated,
  };
});

export const router = {
  internal: {
    syncProfessors,
    linkProfessorsWithRmp,
  },
};

export const handler = new RPCHandler(router);
