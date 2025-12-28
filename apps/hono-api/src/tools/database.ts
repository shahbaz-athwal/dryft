import { createTool } from "@inngest/agent-kit";
import { z } from "zod";
import { db } from "../services/db";

export const updateProfessorTool = createTool({
  name: "update_professor",
  description:
    "Update a professor record in the database with enrichment data including email, phone, office location, LinkedIn URL, website URL, designation, and profile image URL",
  parameters: z.object({
    professorId: z
      .string()
      .describe("The unique ID of the professor to update"),
    data: z.object({
      email: z.string().nullable().describe("Professor's email address"),
      phone: z.string().nullable().describe("Professor's phone number"),
      officeLocation: z
        .string()
        .nullable()
        .describe("Professor's office location (building and room)"),
      linkedinUrl: z
        .string()
        .nullable()
        .describe("URL to professor's LinkedIn profile"),
      websiteUrl: z
        .string()
        .nullable()
        .describe("URL to professor's personal or academic website"),
      designation: z
        .string()
        .nullable()
        .describe(
          "Professor's academic title (e.g., Professor, Associate Professor, Assistant Professor)"
        ),
      imageUrl: z
        .string()
        .nullable()
        .describe("URL to professor's profile picture"),
    }),
  }),
  handler: async ({ professorId, data }) => {
    try {
      await db.professor.update({
        where: { id: professorId },
        data: {
          email: data.email,
          phone: data.phone,
          officeLocation: data.officeLocation,
          linkedinUrl: data.linkedinUrl,
          websiteUrl: data.websiteUrl,
          designation: data.designation ?? "Professor",
          imageUrl: data.imageUrl,
        },
      });
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
