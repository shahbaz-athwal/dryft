"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { academicLevelOptions } from "@/features/explore/constants";

type AcademicLevelMultiSelectProps = {
  value: number[];
  onChange: (value: number[]) => void;
};

function AcademicLevelMultiSelect({
  value,
  onChange,
}: AcademicLevelMultiSelectProps) {
  return (
    <ToggleGroup
      className="flex w-full flex-wrap gap-2"
      onValueChange={(next) => {
        const parsed = next
          .map((entry) => Number.parseInt(entry, 10))
          .filter((entry) => Number.isFinite(entry));
        onChange(parsed);
      }}
      size="sm"
      value={value.map((entry) => entry.toString())}
      variant="outline"
    >
      {academicLevelOptions.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value.toString()}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export { AcademicLevelMultiSelect };
