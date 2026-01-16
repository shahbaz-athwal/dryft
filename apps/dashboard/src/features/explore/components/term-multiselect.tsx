"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { termOptions } from "@/features/explore/constants";
import {
  type ExploreTerm,
  useExploreQueryState,
} from "@/features/explore/query-state";

function TermMultiSelect() {
  const { state, setFilters } = useExploreQueryState();
  const value = state.filters.term;

  return (
    <ToggleGroup
      className="flex w-full flex-wrap gap-2"
      multiple
      onValueChange={(next: ExploreTerm[]) => {
        setFilters((prev) => ({ ...prev, term: next }));
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
