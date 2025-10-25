import { z } from "zod";

export const TeacherNodeSchema = z.object({
  id: z.string(),
  legacyId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  department: z.string(),
});

export const TeacherSearchResponseSchema = z.object({
  search: z.object({
    teachers: z.object({
      edges: z.array(
        z.object({
          node: TeacherNodeSchema,
        })
      ),
    }),
  }),
});

export type TeacherNode = z.infer<typeof TeacherNodeSchema>;
export type TeacherSearchResponse = z.infer<typeof TeacherSearchResponseSchema>;
