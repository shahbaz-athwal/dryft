import { z } from "zod";

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const schemas = {
  hello: {
    input: z.void(),
    output: z.string(),
  },
  users: {
    input: z.void(),
    output: z.array(userSchema),
  },
  user: {
    input: z.object({ id: z.number() }),
    output: userSchema,
  },
  acadiaImporter: {
    importAllDepartments: {
      input: z.void(),
      output: z.void(),
    },
  },
};
