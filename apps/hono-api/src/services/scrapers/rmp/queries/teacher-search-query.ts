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
