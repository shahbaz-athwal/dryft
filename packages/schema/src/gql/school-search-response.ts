import { z } from "zod";

// ---- Leaf types ----

const DepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const SummarySchema = z.object({
  campusCondition: z.number(),
  campusLocation: z.number(),
  careerOpportunities: z.number(),
  clubAndEventActivities: z.number(),
  foodQuality: z.number(),
  internetSpeed: z.number(),
  libraryCondition: z.number(),
  schoolReputation: z.number(),
  schoolSafety: z.number(),
  schoolSatisfaction: z.number(),
  socialActivities: z.number(),
});

const SchoolNodeSchema = z.object({
  id: z.string(),
  legacyId: z.number(),
  name: z.string(),
  city: z.string(),
  state: z.string(),
  departments: z.array(DepartmentSchema),
});

// ---- Edges / pagination ----

const SchoolEdgeSchema = z.object({
  cursor: z.string(),
  node: SchoolNodeSchema,
});

const SchoolsConnectionSchema = z.object({
  edges: z.array(SchoolEdgeSchema),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
});

// ---- Full query response ----

export const SchoolSearchResponseSchema = z.object({
  newSearch: z.object({
    schools: SchoolsConnectionSchema,
  }),
});

export type SchoolSearchResponse = z.infer<typeof SchoolSearchResponseSchema>;
export type SchoolNode = z.infer<typeof SchoolNodeSchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type Summary = z.infer<typeof SummarySchema>;
