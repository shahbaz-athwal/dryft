import { gql } from "graphql-request";

const SCHOOL_RATING_PAGE_QUERY = gql`
  query SchoolRatingsPageQuery($id: ID!, $count: Int, $cursor: String) {
    school: node(id: $id) {
      __typename
      ... on School {
        id
        legacyId
        name
        city
        state
        country
        numRatings
        avgRatingRounded
        avgRating
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
        ratings(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
              __typename
              legacyId
              clubsRating
              facilitiesRating
              foodRating
              happinessRating
              internetRating
              locationRating
              opportunitiesRating
              reputationRating
              safetyRating
              socialRating
              comment
              date
              flagStatus
              createdByUser
              thumbsUpTotal
              thumbsDownTotal
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

export { SCHOOL_RATING_PAGE_QUERY };
