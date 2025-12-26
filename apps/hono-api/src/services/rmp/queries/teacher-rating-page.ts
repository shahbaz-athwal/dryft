import { gql } from "graphql-request";
import { z } from "zod";

export const TEACHER_RATINGS_PAGE_QUERY = gql`
query TeacherRatingsPageQuery($id: ID!, $cursor: String) {
  node(id: $id) {
    __typename
    ... on Teacher {
      id
      legacyId
      ratings(first: 30, after: $cursor) {
        edges {
          node {
            id
            legacyId
            date
            class
            helpfulRating
            clarityRating
            difficultyRating
            comment
            attendanceMandatory
            wouldTakeAgain
            grade
            textbookUse
            isForCredit
            thumbsUpTotal
            thumbsDownTotal
            ratingTags
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

const RatingNodeSchema = z
  .object({
    id: z.string().nullable(),
    legacyId: z.number(),
    date: z.string(),
    class: z.string().nullable(),
    helpfulRating: z.number(),
    clarityRating: z.number(),
    difficultyRating: z.number(),
    comment: z.string().nullable(),
    attendanceMandatory: z.string().nullable(),
    wouldTakeAgain: z.number().nullable(),
    grade: z.string().nullable(),
    textbookUse: z.number().nullable(),
    isForCredit: z.boolean().nullable(),
    thumbsUpTotal: z.number(),
    thumbsDownTotal: z.number(),
    ratingTags: z.string(),
  })
  .transform((raw) => ({
    id: raw.id || raw.legacyId.toString(),
    quality: Math.round((raw.helpfulRating + raw.clarityRating) / 2),
    difficulty: raw.difficultyRating,
    isForCredit: raw.isForCredit,
    comment: raw.comment,
    textBookRequired: raw.textbookUse !== null ? raw.textbookUse === 1 : null,
    attendanceRequired: raw.attendanceMandatory === "mandatory",
    gradeReceived: raw.grade,
    wouldTakeAgain:
      raw.wouldTakeAgain !== null ? raw.wouldTakeAgain === 1 : null,
    thumbsUpTotal: raw.thumbsUpTotal,
    thumbsDownTotal: raw.thumbsDownTotal,
    tags: raw.ratingTags ? raw.ratingTags.split("--") : [],
    courseCode: raw.class,
    postedAt: new Date(raw.date),
  }));

const PageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
});

const TeacherRatingsResponseSchema = z.object({
  node: z.object({
    __typename: z.literal("Teacher"),
    id: z.string(),
    legacyId: z.number(),
    ratings: z.object({
      edges: z.array(
        z.object({
          node: RatingNodeSchema,
        })
      ),
      pageInfo: PageInfoSchema,
    }),
  }),
});

export { TeacherRatingsResponseSchema, RatingNodeSchema, PageInfoSchema };
