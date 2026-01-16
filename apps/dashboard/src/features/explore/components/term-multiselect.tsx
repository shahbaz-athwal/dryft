"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { termOptions } from "@/features/explore/constants";
import { useExploreQueryState } from "@/features/explore/query-state";
import type { ExploreTerm } from "@/features/explore/schema";

function TermMultiSelect() {
  const { state, setFilters } = useExploreQueryState();
  const value = state.filters.term;

  return (
    <ToggleGroup
      className="flex w-full flex-wrap gap-2"
      onValueChange={(next) => {
        setFilters((prev) => ({ ...prev, term: next as ExploreTerm[] }));
      }}
      size="sm"
      value={value}
      variant="outline"
    >
      {termOptions.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export { TermMultiSelect };
