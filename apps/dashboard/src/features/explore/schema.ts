import { z } from "zod";

const termValues = ["fall", "winter", "summer"] as const;
const sortKeys = ["title", "difficulty", "numRatings", "courseLevel"] as const;
const sortDirections = ["asc", "desc"] as const;
const viewValues = ["grid", "table"] as const;

const TIME_MINUTES_MIN = 8 * 60;
const TIME_MINUTES_MAX = 21 * 60;
const TIME_STEP_MINUTES = 15;

const exploreTimeRangeSchema = z
  .object({
    start: z
      .number()
      .int()
      .min(TIME_MINUTES_MIN)
      .max(TIME_MINUTES_MAX)
      .multipleOf(TIME_STEP_MINUTES),
    end: z
      .number()
      .int()
      .min(TIME_MINUTES_MIN)
      .max(TIME_MINUTES_MAX)
      .multipleOf(TIME_STEP_MINUTES),
  })
  .refine((value) => value.start <= value.end, {
    message: "Time range start must be less than or equal to end.",
  });

const exploreFiltersSchema = z.object({
  term: z.array(z.enum(termValues)),
  professorIds: z.array(z.string()),
  subjectIds: z.array(z.string()),
  academicLevels: z.array(z.number().int().min(0).max(9)),
  time: exploreTimeRangeSchema.nullable(),
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
type ExploreTimeRange = z.infer<typeof exploreTimeRangeSchema>;

const DEFAULT_EXPLORE_STATE: ExploreState = {
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
  exploreTimeRangeSchema,
  DEFAULT_EXPLORE_STATE,
  termValues,
  sortKeys,
  sortDirections,
  viewValues,
  TIME_MINUTES_MIN,
  TIME_MINUTES_MAX,
  TIME_STEP_MINUTES,
};
export type {
  ExploreState,
  ExploreFilters,
  ExploreSort,
  ExploreView,
  ExploreSortKey,
  ExploreSortDirection,
  ExploreTerm,
  ExploreTimeRange,
};
