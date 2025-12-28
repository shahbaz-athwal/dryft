/**
 * Data extracted for professor enrichment
 */
export type ProfessorEnrichmentData = {
  professorId: string;
  professorName: string;
  email?: string;
  phone?: string;
  officeLocation?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  designation?: string;
  imageUrl?: string;
  officeHours?: string;
};

/**
 * Network state for the professor enrichment workflow
 */
export type EnrichmentNetworkState = {
  /** Current phase of the workflow */
  phase: "search" | "navigate" | "observe" | "extract" | "save" | "done";
  /** Browserbase session ID for the current browser session */
  browserbaseSessionID: string;
  /** Name of the department being processed */
  departmentName: string;
  /** Prefix of the department (e.g., "COMP" for Computer Science) */
  departmentPrefix: string;
  /** URL of the department faculty page discovered via search */
  departmentUrl?: string;
  /** Detected page structure type */
  pageStructure?: "homepage_list" | "accordion" | "nested_pages";
  /** Queue of professors to process */
  professorQueue: { id: string; name: string }[];
  /** Extracted enrichment data for professors */
  extractedData: ProfessorEnrichmentData[];
  /** Index of the current professor being processed */
  currentProfessorIndex: number;
  /** Error message if any step fails */
  error?: string;
};

/**
 * Input for the enrichment workflow event
 */
export type EnrichmentEventInput = {
  departmentName: string;
  departmentPrefix: string;
  professors: { id: string; name: string }[];
};
