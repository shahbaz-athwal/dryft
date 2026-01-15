"use client";

import { parseAsJson, useQueryState } from "nuqs";
import { useCallback } from "react";

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

  const updateState = useCallback(
    (updater: ExploreStateUpdater) => {
      setState((prev) => {
        const current = (prev ?? defaultExploreState) as ExploreState;
        return typeof updater === "function" ? updater(current) : updater;
      });
    },
    [setState]
  );

  const setFilters = useCallback(
    (updater: ExploreFiltersUpdater) => {
      updateState((prev) => ({
        ...prev,
        filters:
          typeof updater === "function" ? updater(prev.filters) : updater,
      }));
    },
    [updateState]
  );

  const setSearch = useCallback(
    (search: string) => {
      updateState((prev) => ({
        ...prev,
        search,
      }));
    },
    [updateState]
  );

  const setSort = useCallback(
    (sort: ExploreSort) => {
      updateState((prev) => ({
        ...prev,
        sort,
      }));
    },
    [updateState]
  );

  const setView = useCallback(
    (view: ExploreView) => {
      updateState((prev) => ({
        ...prev,
        view,
      }));
    },
    [updateState]
  );

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
