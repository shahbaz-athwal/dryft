import { EventSchemas, Inngest } from "inngest";
import { z } from "zod";
import { processCourse } from "./process-course";

export const inngest = new Inngest({
  id: "dryft",
  schemas: new EventSchemas().fromSchema({
    "course/process": z.object({
      courseId: z.string(),
      sectionIds: z.array(z.string()),
      departmentPrefix: z.string(),
    }),
  }),
});

export const functions = [processCourse];
