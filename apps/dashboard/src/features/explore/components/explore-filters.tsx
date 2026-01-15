"use client";

import {
  Field,
  FieldContent,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AcademicLevelMultiSelect } from "@/features/explore/components/academic-level-multiselect";
import { MultiCombobox } from "@/features/explore/components/multi-combobox";
import { TermMultiSelect } from "@/features/explore/components/term-multiselect";
import {
  academicLevelOptions,
  professorOptions,
  subjectOptions,
} from "@/features/explore/constants";
import { useExploreQueryState } from "@/features/explore/query-state";

function ExploreFilters() {
  const { state, setFilters } = useExploreQueryState();
  const { filters } = state;

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-4">
        <FieldSet>
          <FieldTitle className="text-base">Filters</FieldTitle>
          <Separator />
          <Field>
            <FieldLabel>Term</FieldLabel>
            <FieldContent>
              <TermMultiSelect
                onChange={(next) => {
                  setFilters((prev) => ({ ...prev, term: next }));
                }}
                value={filters.term}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Professors</FieldLabel>
            <FieldContent>
              <MultiCombobox
                onChange={(next) => {
                  setFilters((prev) => ({ ...prev, professorIds: next }));
                }}
                options={professorOptions}
                placeholder="Select professors"
                searchPlaceholder="Search professors"
                value={filters.professorIds}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Subjects</FieldLabel>
            <FieldContent>
              <MultiCombobox
                onChange={(next) => {
                  setFilters((prev) => ({ ...prev, subjectIds: next }));
                }}
                options={subjectOptions}
                placeholder="Select subjects"
                searchPlaceholder="Search subjects"
                value={filters.subjectIds}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Academic level</FieldLabel>
            <FieldContent>
              <AcademicLevelMultiSelect
                onChange={(next) => {
                  setFilters((prev) => ({ ...prev, academicLevels: next }));
                }}
                value={filters.academicLevels}
              />
              <p className="text-muted-foreground text-sm">
                {academicLevelOptions.length} levels available
              </p>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Time</FieldLabel>
            <FieldContent>
              <Input
                aria-disabled
                disabled
                placeholder="Coming soon"
                readOnly
                value=""
              />
            </FieldContent>
          </Field>
        </FieldSet>
      </div>
    </ScrollArea>
  );
}

export { ExploreFilters };
