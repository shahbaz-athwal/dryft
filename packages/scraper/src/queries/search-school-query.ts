import { gql } from "graphql-request";

const SEARCH_SCHOOL_QUERY = gql`
  query NewSearchSchoolsQuery(
    $query: SchoolSearchQuery
  ) {
    newSearch {
      schools(query: $query) {
        edges {
          cursor
          node {
            id
            legacyId
            name
            city
            state
            country
            numRatings
            avgRatingRounded
            departments {
              id
              name
            }
            summary {
              campusCondition
              campusLocation
              careerOpportunities
              clubAndEventActivities
              foodQuality
              internetSpeed
              libraryCondition
              schoolReputation
              schoolSafety
              schoolSatisfaction
              socialActivities
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export { SEARCH_SCHOOL_QUERY };
