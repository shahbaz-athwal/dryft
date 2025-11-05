import { EventSchemas, Inngest } from "inngest";
import { z } from "zod";

export const inngest = new Inngest({
  id: "dryft",
  schemas: new EventSchemas().fromSchema({
    "course/process": z.object({
      courseId: z.string(),
      sectionIds: z.array(z.string()),
      departmentPrefix: z.string(),
    }),
    "populate/acadia-department-professors": z.object({
      waitTimeSeconds: z.number().min(0).max(10).default(1),
      onlyUnsyncedDepartments: z.boolean().default(false),
    }),
    "sync/link-professors-with-rmp": z.object({}),
    "courses/populate": z.object({}),
  }),
});
