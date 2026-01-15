import type { ExploreSort, ExploreTerm } from "@/features/explore/schema";

type ExploreOption = {
  value: string;
  label: string;
};

type TermOption = {
  value: ExploreTerm;
  label: string;
};

type SortOption = {
  value: string;
  label: string;
  sort: ExploreSort;
};

const termOptions: TermOption[] = [
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "summer", label: "Summer" },
];

const professorOptions: ExploreOption[] = [
  { value: "prof-001", label: "Dr. Avery Sutton" },
  { value: "prof-002", label: "Prof. Jordan Kim" },
  { value: "prof-003", label: "Dr. Casey Patel" },
  { value: "prof-004", label: "Prof. Morgan Reed" },
];

const subjectOptions: ExploreOption[] = [
  { value: "subj-101", label: "Computer Science" },
  { value: "subj-102", label: "Economics" },
  { value: "subj-103", label: "Psychology" },
  { value: "subj-104", label: "Mathematics" },
];

const academicLevelOptions = Array.from({ length: 10 }, (_, index) => ({
  value: index,
  label: `Level ${index}`,
}));

const sortOptions: SortOption[] = [
  {
    value: "title:asc",
    label: "Title (A-Z)",
    sort: { key: "title", dir: "asc" },
  },
  {
    value: "title:desc",
    label: "Title (Z-A)",
    sort: { key: "title", dir: "desc" },
  },
  {
    value: "difficulty:asc",
    label: "Difficulty (Low-High)",
    sort: { key: "difficulty", dir: "asc" },
  },
  {
    value: "difficulty:desc",
    label: "Difficulty (High-Low)",
    sort: { key: "difficulty", dir: "desc" },
  },
  {
    value: "numRatings:asc",
    label: "Ratings (Few-Many)",
    sort: { key: "numRatings", dir: "asc" },
  },
  {
    value: "numRatings:desc",
    label: "Ratings (Many-Few)",
    sort: { key: "numRatings", dir: "desc" },
  },
  {
    value: "courseLevel:asc",
    label: "Course Level (Low-High)",
    sort: { key: "courseLevel", dir: "asc" },
  },
  {
    value: "courseLevel:desc",
    label: "Course Level (High-Low)",
    sort: { key: "courseLevel", dir: "desc" },
  },
];

export {
  termOptions,
  professorOptions,
  subjectOptions,
  academicLevelOptions,
  sortOptions,
};
export type { ExploreOption, TermOption, SortOption };
