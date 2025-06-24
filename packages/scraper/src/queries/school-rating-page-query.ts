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

        # overall rating
        avgRatingRounded
        avgRating

        # summary
        summary {
          schoolReputation
          schoolSatisfaction
          internetSpeed
          campusCondition
          schoolSafety
          careerOpportunities
          socialActivities
          foodQuality
          clubAndEventActivities
          campusLocation
        }

        # the first 20 ratings
        ratings(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
              __typename
              legacyId

              # all the per‐category scores
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

              # comment / metadata
              comment
              date
              flagStatus
              createdByUser

              # thumbs
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
