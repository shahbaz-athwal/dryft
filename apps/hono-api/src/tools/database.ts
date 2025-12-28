import { createTool } from "@inngest/agent-kit";
import { z } from "zod";
import { db } from "../services/db";
import type {
  EnrichmentNetworkState,
  ProfessorEnrichmentData,
} from "../types/enrichment";

/**
 * Tool to update a professor record with enrichment data
 */
export const updateProfessorTool = createTool({
  name: "update_professor",
  description:
    "Update a professor record in the database with enrichment data including email, phone, office location, LinkedIn URL, website URL, designation, and profile image URL",
  parameters: z.object({
    professorId: z
      .string()
      .describe("The unique ID of the professor to update"),
    data: z.object({
      email: z.string().optional().describe("Professor's email address"),
      phone: z.string().optional().describe("Professor's phone number"),
      officeLocation: z
        .string()
        .optional()
        .describe("Professor's office location (building and room)"),
      linkedinUrl: z
        .string()
        .optional()
        .describe("URL to professor's LinkedIn profile"),
      websiteUrl: z
        .string()
        .optional()
        .describe("URL to professor's personal or academic website"),
      designation: z
        .string()
        .optional()
        .describe(
          "Professor's academic title (e.g., Professor, Associate Professor, Assistant Professor)"
        ),
      imageUrl: z
        .string()
        .optional()
        .describe("URL to professor's profile picture"),
    }),
  }),
  handler: async ({ professorId, data }, { network }) => {
    try {
      await db.professor.update({
        where: { id: professorId },
        data: {
          email: data.email,
          phone: data.phone,
          officeLocation: data.officeLocation,
          linkedinUrl: data.linkedinUrl,
          websiteUrl: data.websiteUrl,
          designation: data.designation,
          imageUrl: data.imageUrl,
        },
      });

      // Update network state to track progress
      const state = network?.state.data as EnrichmentNetworkState | undefined;
      if (state) {
        const existingIndex = state.extractedData.findIndex(
          (p) => p.professorId === professorId
        );
        const enrichmentData: ProfessorEnrichmentData = {
          professorId,
          professorName:
            state.professorQueue.find((p) => p.id === professorId)?.name ?? "",
          ...data,
        };

        if (existingIndex >= 0) {
          state.extractedData[existingIndex] = enrichmentData;
        } else {
          state.extractedData.push(enrichmentData);
        }
      }

      return {
        success: true,
        professorId,
        message: "Professor updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        professorId,
        message: `Failed to update professor: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

/**
 * Tool to mark all professors in queue as processed and transition to done phase
 */
export const completeEnrichmentTool = createTool({
  name: "complete_enrichment",
  description:
    "Mark the enrichment workflow as complete after all professors have been processed",
  parameters: z.object({
    summary: z
      .string()
      .describe("A summary of what was extracted and any issues encountered"),
  }),
  handler: ({ summary }, { network }) => {
    const state = network?.state.data as EnrichmentNetworkState | undefined;
    if (state) {
      state.phase = "done";
    }

    return {
      success: true,
      message: "Enrichment workflow completed",
      summary,
      processedCount: state?.extractedData.length ?? 0,
    };
  },
});

/**
 * Tool to update the current phase of the enrichment workflow
 */
export const updatePhaseTool = createTool({
  name: "update_phase",
  description: "Update the current phase of the enrichment workflow",
  parameters: z.object({
    phase: z
      .enum(["search", "navigate", "observe", "extract", "save", "done"])
      .describe("The new phase to transition to"),
    departmentUrl: z
      .string()
      .optional()
      .describe("The department faculty page URL (set during search phase)"),
    pageStructure: z
      .enum(["homepage_list", "accordion", "nested_pages"])
      .optional()
      .describe("The detected page structure (set during observe phase)"),
  }),
  handler: ({ phase, departmentUrl, pageStructure }, { network }) => {
    const state = network?.state.data as EnrichmentNetworkState | undefined;
    if (state) {
      state.phase = phase;
      if (departmentUrl) {
        state.departmentUrl = departmentUrl;
      }
      if (pageStructure) {
        state.pageStructure = pageStructure;
      }
    }

    return {
      success: true,
      message: `Phase updated to: ${phase}`,
      currentState: {
        phase,
        departmentUrl: state?.departmentUrl,
        pageStructure: state?.pageStructure,
      },
    };
  },
});
