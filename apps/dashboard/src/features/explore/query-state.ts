"use client";

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import type {
  ExploreFilters,
  ExploreSort,
  ExploreState,
  ExploreView,
} from "@/features/explore/schema";
import {
  DEFAULT_EXPLORE_STATE,
  sortDirections,
  sortKeys,
  TIME_MINUTES_MAX,
  TIME_MINUTES_MIN,
  termValues,
  viewValues,
} from "@/features/explore/schema";
import { normalizeTimeRange } from "@/features/explore/time";

type ExploreStateUpdater =
  | ExploreState
  | ((prev: ExploreState) => ExploreState);

type ExploreFiltersUpdater =
  | ExploreFilters
  | ((prev: ExploreFilters) => ExploreFilters);

const exploreQueryParsers = {
  search: parseAsString.withDefault(""),
  view: parseAsStringLiteral(viewValues).withDefault(
    DEFAULT_EXPLORE_STATE.view
  ),
  sortKey: parseAsStringLiteral(sortKeys).withDefault(
    DEFAULT_EXPLORE_STATE.sort.key
  ),
  sortDir: parseAsStringLiteral(sortDirections).withDefault(
    DEFAULT_EXPLORE_STATE.sort.dir
  ),
  term: parseAsArrayOf(parseAsStringLiteral(termValues)).withDefault([]),
  professorIds: parseAsArrayOf(parseAsString).withDefault([]),
  subjectIds: parseAsArrayOf(parseAsString).withDefault([]),
  academicLevels: parseAsArrayOf(parseAsInteger).withDefault([]),
  timeStart: parseAsInteger,
  timeEnd: parseAsInteger,
};

const exploreUrlKeys = {
  search: "s",
  view: "v",
  sortKey: "sk",
  sortDir: "sd",
  term: "t",
  professorIds: "p",
  subjectIds: "u",
  academicLevels: "a",
  timeStart: "ts",
  timeEnd: "te",
} as const;

function useExploreQueryState() {
  const [query, setQuery] = useQueryStates(exploreQueryParsers, {
    history: "replace",
    urlKeys: exploreUrlKeys,
  });

  const time =
    query.timeStart == null && query.timeEnd == null
      ? null
      : normalizeTimeRange(
          {
            start: query.timeStart ?? TIME_MINUTES_MIN,
            end: query.timeEnd ?? TIME_MINUTES_MAX,
          },
          query.timeStart != null ? "start" : "end"
        );

  const state: ExploreState = {
    filters: {
      term: query.term,
      professorIds: query.professorIds,
      subjectIds: query.subjectIds,
      academicLevels: query.academicLevels,
      time,
    },
    search: query.search,
    sort: { key: query.sortKey, dir: query.sortDir },
    view: query.view,
  };

  const updateState = (updater: ExploreStateUpdater) => {
    const next = typeof updater === "function" ? updater(state) : updater;
    setQuery({
      search: next.search,
      view: next.view,
      sortKey: next.sort.key,
      sortDir: next.sort.dir,
      term: next.filters.term,
      professorIds: next.filters.professorIds,
      subjectIds: next.filters.subjectIds,
      academicLevels: next.filters.academicLevels,
      timeStart: next.filters.time?.start ?? null,
      timeEnd: next.filters.time?.end ?? null,
    });
  };

  const setFilters = (updater: ExploreFiltersUpdater) => {
    const nextFilters =
      typeof updater === "function" ? updater(state.filters) : updater;

    setQuery({
      term: nextFilters.term,
      professorIds: nextFilters.professorIds,
      subjectIds: nextFilters.subjectIds,
      academicLevels: nextFilters.academicLevels,
      timeStart: nextFilters.time?.start ?? null,
      timeEnd: nextFilters.time?.end ?? null,
    });
  };

  const setSearch = (search: string) => {
    setQuery({ search });
  };

  const setSort = (sort: ExploreSort) => {
    setQuery({ sortKey: sort.key, sortDir: sort.dir });
  };

  const setView = (view: ExploreView) => {
    setQuery({ view });
  };

  return {
    state,
    setState: updateState,
    setFilters,
    setSearch,
    setSort,
    setView,
  };
}

export { useExploreQueryState };
