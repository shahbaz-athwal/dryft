"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { termOptions } from "@/features/explore/constants";
import type { ExploreTerm } from "@/features/explore/schema";

type TermMultiSelectProps = {
  value: ExploreTerm[];
  onChange: (value: ExploreTerm[]) => void;
};

function TermMultiSelect({ value, onChange }: TermMultiSelectProps) {
  return (
    <ToggleGroup
      className="flex w-full flex-wrap gap-2"
      onValueChange={(next) => {
        onChange(next as ExploreTerm[]);
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
