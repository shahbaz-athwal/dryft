import { gql } from "graphql-request";

const SEARCH_SCHOOL_QUERY = gql`
  query NewSearchSchoolsQuery(
    $query: SchoolSearchQuery
    $includeCompare: Boolean
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
            departments {
              id
              name
            }
            name @include(if: $includeCompare)
            city @include(if: $includeCompare)
            state @include(if: $includeCompare)
            country @include(if: $includeCompare)
            numRatings @include(if: $includeCompare)
            avgRatingRounded @include(if: $includeCompare)
            legacyId @include(if: $includeCompare)
            summary @include(if: $includeCompare) {
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
