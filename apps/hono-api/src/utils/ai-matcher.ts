import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import type { TeacherNode } from "../services/scrapers/rmp/schemas/teacher-search-response";
import { AI_MAPPING_PROMPT } from "./constants";

const ProfessorMatchSchema = z.object({
  professorId: z.string(),
  rmpId: z.string().nullable(),
});

const ProfessorMatchArraySchema = z.object({
  matches: z.array(ProfessorMatchSchema),
});

type LocalProfessor = {
  id: string;
  name: string;
  department: string;
};

export async function matchProfessorsWithRMP(
  localProfessors: LocalProfessor[],
  rmpProfessors: TeacherNode[]
) {
  const prompt = `${AI_MAPPING_PROMPT}
    Data:
    - Local Professors (from our database):
        ${JSON.stringify(localProfessors, null, 2)}
    - Rate My Professor Data:
        ${JSON.stringify(rmpProfessors, null, 2)}
    `;

  const result = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: ProfessorMatchArraySchema,
    prompt,
  });

  return result.object.matches;
}
