import { gql } from "graphql-request";
import { z } from "zod";

const SCHOOL_DEPARTMENTS_QUERY = gql`
 query SchoolDepartments($schoolId: ID!) {
  search: newSearch {
    teachers(
      query: { schoolID: $schoolId, fallback: false }
      first: 1
    ) {
      filters {
        field
        options {
          id
          value
        }
      }
    }
  }
}
`;

const SchoolDepartmentsResponseSchema = z.object({
  search: z.object({
    teachers: z.object({
      filters: z.array(
        z.object({
          field: z.string(),
          options: z.array(
            z.object({
              id: z.string(),
              value: z.string(),
            })
          ),
        })
      ),
    }),
  }),
});

export { SCHOOL_DEPARTMENTS_QUERY, SchoolDepartmentsResponseSchema };
