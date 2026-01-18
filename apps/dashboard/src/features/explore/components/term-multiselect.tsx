"use client";

import { Fragment } from "react/jsx-runtime";
import {
  Toggle,
  ToggleGroup,
  ToggleGroupSeparator,
} from "@/components/ui/toggle-group";
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
      className="flex w-full flex-wrap"
      multiple
      onValueChange={(next: ExploreTerm[]) => {
        setFilters((prev) => ({ ...prev, term: next }));
      }}
      size="sm"
      value={value}
      variant="outline"
    >
      {termOptions.map((option, index) => (
        <Fragment key={option.value}>
          <Toggle value={option.value}>{option.label}</Toggle>
          {index !== termOptions.length - 1 && <ToggleGroupSeparator />}
        </Fragment>
      ))}
    </ToggleGroup>
  );
}

export { TermMultiSelect };
