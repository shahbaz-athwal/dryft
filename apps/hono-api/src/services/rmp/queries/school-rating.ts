import { gql } from "graphql-request";
import { z } from "zod";

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

// ---- Leaf types ----

const SchoolRatingNodeSchema = z.object({
  id: z.string(),
  __typename: z.literal("SchoolRating"),
  legacyId: z.string(),
  clubsRating: z.number().nullable(),
  facilitiesRating: z.number().nullable(),
  foodRating: z.number().nullable(),
  happinessRating: z.number().nullable(),
  internetRating: z.number().nullable(),
  locationRating: z.number().nullable(),
  opportunitiesRating: z.number().nullable(),
  reputationRating: z.number().nullable(),
  safetyRating: z.number().nullable(),
  socialRating: z.number().nullable(),
  comment: z.string().nullable(),
  date: z.string().nullable(),
  flagStatus: z.string().nullable(),
  createdByUser: z.boolean().nullable(),
  thumbsUpTotal: z.number().nullable(),
  thumbsDownTotal: z.number().nullable(),
});

// ---- Edges / pagination ----

const SchoolRatingEdgeSchema = z.object({
  cursor: z.string(),
  node: SchoolRatingNodeSchema,
});

const RatingsSchema = z.object({
  edges: z.array(SchoolRatingEdgeSchema),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
});

// ---- Summary fragment ----

const SummarySchema = z.object({
  schoolReputation: z.number().nullable(),
  schoolSatisfaction: z.number().nullable(),
  internetSpeed: z.number().nullable(),
  campusCondition: z.number().nullable(),
  schoolSafety: z.number().nullable(),
  careerOpportunities: z.number().nullable(),
  socialActivities: z.number().nullable(),
  foodQuality: z.number().nullable(),
  clubAndEventActivities: z.number().nullable(),
  campusLocation: z.number().nullable(),
});

// ---- Top-level School type ----

const SchoolSchema = z.object({
  __typename: z.literal("School"),
  id: z.string(),
  legacyId: z.string(),
  name: z.string(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  numRatings: z.number().nullable(),
  avgRatingRounded: z.number().nullable(),
  avgRating: z.number().nullable(),
  summary: SummarySchema,
  ratings: RatingsSchema,
});

// ---- Full query response ----

const SchoolRatingsPageResponseSchema = z.object({
  data: z.object({
    school: SchoolSchema,
  }),
});

export { SCHOOL_RATING_PAGE_QUERY, SchoolRatingsPageResponseSchema };
