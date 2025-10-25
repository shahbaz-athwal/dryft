import { z } from "zod";

export const TEACHER_SEARCH_QUERY = `
query TeacherSearchPaginationQuery(
  $count: Int!
  $cursor: String
  $query: TeacherSearchQuery!
) {
  search: newSearch {
    teachers(query: $query, first: $count, after: $cursor) {
      edges {
        node {
          id
          legacyId
          firstName
          lastName
          department
        }
      }
    }
  }
}
`;

const TeacherNodeSchema = z.object({
  id: z.string(),
  legacyId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  department: z.string(),
});

const TeacherSearchResponseSchema = z.object({
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

export { TeacherSearchResponseSchema, TeacherNodeSchema };
