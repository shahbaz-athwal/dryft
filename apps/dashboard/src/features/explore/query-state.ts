"use client";

import { parseAsJson, useQueryState } from "nuqs";

import type {
  ExploreFilters,
  ExploreSort,
  ExploreState,
  ExploreView,
} from "@/features/explore/schema";
import { defaultExploreState, exploreSchema } from "@/features/explore/schema";

type ExploreStateUpdater =
  | ExploreState
  | ((prev: ExploreState) => ExploreState);

type ExploreFiltersUpdater =
  | ExploreFilters
  | ((prev: ExploreFilters) => ExploreFilters);

const exploreParser = parseAsJson(exploreSchema)
  .withDefault(defaultExploreState)
  .withOptions({ history: "replace" });

function useExploreQueryState() {
  const [state, setState] = useQueryState("q", exploreParser);

  const updateState = (updater: ExploreStateUpdater) => {
    setState((prev) => {
      const current = (prev ?? defaultExploreState) as ExploreState;
      return typeof updater === "function" ? updater(current) : updater;
    });
  };

  const setFilters = (updater: ExploreFiltersUpdater) => {
    updateState((prev) => ({
      ...prev,
      filters: typeof updater === "function" ? updater(prev.filters) : updater,
    }));
  };

  const setSearch = (search: string) => {
    updateState((prev) => ({
      ...prev,
      search,
    }));
  };

  const setSort = (sort: ExploreSort) => {
    updateState((prev) => ({
      ...prev,
      sort,
    }));
  };

  const setView = (view: ExploreView) => {
    updateState((prev) => ({
      ...prev,
      view,
    }));
  };

  return {
    state: (state ?? defaultExploreState) as ExploreState,
    setState: updateState,
    setFilters,
    setSearch,
    setSort,
    setView,
  };
}

export { useExploreQueryState };
