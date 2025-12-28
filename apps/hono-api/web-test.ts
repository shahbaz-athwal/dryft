import { inngestAgent } from "./src/inngest/client";
import { db } from "./src/services/db";

async function main() {
  // Get all professors from the COMP department
  const professors = await db.professor.findMany({
    where: {
      departmentPrefix: "COMP",
    },
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
    // biome-ignore lint/suspicious/noConsole: logging
    console.log("No professors found in COMP department");
    return;
  }

  const departmentName = professors[0].department.name;

  // Fire the enrich professors event
  await inngestAgent.send({
    name: "enrich/professors-by-department",
    data: {
      departmentName,
      departmentPrefix: "COMP",
      professors: professors.map((p) => ({
        id: p.id,
        name: p.name,
      })),
    },
  });

  // biome-ignore lint/suspicious/noConsole: logging
  console.log(
    `Fired enrich event for ${professors.length} professors in ${departmentName}`
  );
}

main();
