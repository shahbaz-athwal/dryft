"use client";

import { Clock, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker";
import { AcademicLevelMultiSelect } from "@/features/explore/components/academic-level-multiselect";
import { MultiCombobox } from "@/features/explore/components/multi-combobox";
import { TermMultiSelect } from "@/features/explore/components/term-multiselect";
import {
  academicLevelOptions,
  professorOptions,
  subjectOptions,
} from "@/features/explore/constants";
import { useExploreQueryState } from "@/features/explore/query-state";
import { TIME_MINUTES_MAX, TIME_MINUTES_MIN } from "@/features/explore/schema";
import {
  buildTimeOptions,
  formatMinutes,
  normalizeTimeRange,
} from "@/features/explore/time";
import { cn } from "@/lib/utils";

function ExploreFilters() {
  const { state, setFilters } = useExploreQueryState();
  const { filters } = state;

  const timeOptions = useMemo(() => buildTimeOptions(), []);
  const timeValue = filters.time ?? {
    start: TIME_MINUTES_MIN,
    end: TIME_MINUTES_MAX,
  };

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
              <Popover>
                <PopoverTrigger>
                  <Button
                    className="w-full justify-between"
                    size="default"
                    type="button"
                    variant="outline"
                  >
                    <span
                      className={cn(
                        "truncate text-left",
                        !filters.time && "text-muted-foreground"
                      )}
                    >
                      {filters.time
                        ? `${formatMinutes(filters.time.start)} – ${formatMinutes(
                            filters.time.end
                          )}`
                        : "Any time"}
                    </span>
                    <Clock className="size-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">Time range</div>
                    <Button
                      disabled={!filters.time}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, time: null }));
                      }}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <X className="size-4" />
                      Clear
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="text-muted-foreground text-xs">Start</div>
                      <WheelPickerWrapper className="w-full">
                        <WheelPicker<number>
                          onValueChange={(nextStart) => {
                            setFilters((prev) => {
                              const current = prev.time ?? timeValue;
                              const next = normalizeTimeRange(
                                { start: nextStart, end: current.end },
                                "start"
                              );
                              return { ...prev, time: next };
                            });
                          }}
                          options={timeOptions}
                          value={timeValue.start}
                        />
                      </WheelPickerWrapper>
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="text-muted-foreground text-xs">End</div>
                      <WheelPickerWrapper className="w-full">
                        <WheelPicker<number>
                          onValueChange={(nextEnd) => {
                            setFilters((prev) => {
                              const current = prev.time ?? timeValue;
                              const next = normalizeTimeRange(
                                { start: current.start, end: nextEnd },
                                "end"
                              );
                              return { ...prev, time: next };
                            });
                          }}
                          options={timeOptions}
                          value={timeValue.end}
                        />
                      </WheelPickerWrapper>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </FieldContent>
          </Field>
        </FieldSet>
      </div>
    </ScrollArea>
  );
}

export { ExploreFilters };
