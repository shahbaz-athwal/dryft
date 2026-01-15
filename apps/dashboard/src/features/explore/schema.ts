import { z } from "zod";

const termValues = ["fall", "winter", "summer"] as const;
const sortKeys = ["title", "difficulty", "numRatings", "courseLevel"] as const;
const sortDirections = ["asc", "desc"] as const;
const viewValues = ["grid", "table"] as const;

const exploreFiltersSchema = z.object({
  term: z.array(z.enum(termValues)),
  professorIds: z.array(z.string()),
  subjectIds: z.array(z.string()),
  academicLevels: z.array(z.number().int().min(0).max(9)),
  time: z.unknown().nullable(),
});

const exploreSortSchema = z.object({
  key: z.enum(sortKeys),
  dir: z.enum(sortDirections),
});

const exploreSchema = z.object({
  filters: exploreFiltersSchema,
  search: z.string(),
  sort: exploreSortSchema,
  view: z.enum(viewValues),
});

type ExploreState = z.infer<typeof exploreSchema>;
type ExploreFilters = z.infer<typeof exploreFiltersSchema>;
type ExploreSort = z.infer<typeof exploreSortSchema>;
type ExploreView = ExploreState["view"];
type ExploreSortKey = ExploreSort["key"];
type ExploreSortDirection = ExploreSort["dir"];
type ExploreTerm = ExploreFilters["term"][number];

const defaultExploreState: ExploreState = {
  filters: {
    term: [],
    professorIds: [],
    subjectIds: [],
    academicLevels: [],
    time: null,
  },
  search: "",
  sort: {
    key: "title",
    dir: "asc",
  },
  view: "grid",
};

export {
  exploreSchema,
  exploreFiltersSchema,
  exploreSortSchema,
  defaultExploreState,
};
export type {
  ExploreState,
  ExploreFilters,
  ExploreSort,
  ExploreView,
  ExploreSortKey,
  ExploreSortDirection,
  ExploreTerm,
};
