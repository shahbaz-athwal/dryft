import { gql } from "graphql-request";

const COURSES_BY_PROFESSOR_QUERY = gql`
  query CoursesByProfessorId($professorId: ID!) {
    node(id: $professorId) {
      __typename
      ... on Teacher {
        id
        legacyId
        firstName
        lastName
        school {
          name
          id
          legacyId
        }
        department
        courseCodes {
          courseName
          courseCount
        }
      }
    }
  }
`;

export { COURSES_BY_PROFESSOR_QUERY };
