import { z } from "zod";

export const PostSearchCriteriaRequestSchema = z.object({
  keyword: z.string().nullable(),
  terms: z.array(z.string()),
  courseIds: z.null(),
  sectionIds: z.null(),
  subjects: z.array(z.string().length(4)),
  faculty: z.array(z.coerce.number()),
  pageNumber: z.number(),
  quantityPerPage: z.number(),
});

export type PostSearchCriteriaRequestInferred = z.infer<
  typeof PostSearchCriteriaRequestSchema
>;

export const PostSearchCriteriaFilteredResponseSchema = z.object({
  Courses: z.array(
    z.object({
      MatchingSectionIds: z.array(z.string()),
      Id: z.string(),
      SubjectCode: z.string(),
      Number: z.string(),
      MinimumCredits: z.number(),
      MaximumCredits: z.number().nullable(),
      Title: z.string(),
      Description: z.string(),
      LocationCodes: z.array(z.string()),
      IsPseudoCourse: z.boolean(),
    })
  ),
  Keyword: z.string().nullable(),
  TotalItems: z.number(),
  TotalPages: z.number(),
  PageSize: z.number(),
  CurrentPageIndex: z.number(),
  Subjects: z.array(
    z.object({
      Value: z.string(),
      Description: z.string(),
      Count: z.number(),
      Selected: z.boolean(),
    })
  ),
  Faculty: z.array(
    z.object({
      Value: z.string(),
      Description: z.string(),
      Count: z.number(),
      Selected: z.boolean(),
    })
  ),
});

export type PostSearchCriteriaFilteredResponseInferred = z.infer<
  typeof PostSearchCriteriaFilteredResponseSchema
>;
