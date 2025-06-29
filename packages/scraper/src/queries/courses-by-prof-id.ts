import { gql } from "graphql-request";

const COURSES_BY_PROFESSOR_QUERY = gql`
  query CoursesByProfessor($professorId: ID!) {
    node(id: $professorId) {
      ... on Teacher {
        id
        firstName
        lastName
        courseCodes {
          courseName
          courseCount
        }
      }
    }
  }
`;

export { COURSES_BY_PROFESSOR_QUERY };
