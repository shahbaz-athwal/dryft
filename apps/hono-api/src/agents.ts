import {
  anthropic,
  createAgent,
  createNetwork,
  createState,
} from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import { env } from "bun";
import { inngestAgent } from "./inngest/client";
import { browserBase, getStagehand } from "./services/browser-base";
import {
  completeEnrichmentTool,
  updatePhaseTool,
  updateProfessorTool,
} from "./tools/database";
import { act, extract, navigate, observe } from "./tools/stagehand";
import type { EnrichmentNetworkState } from "./types/enrichment";

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const SEARCH_AGENT_SYSTEM_PROMPT = `You are a specialized search agent for finding Acadia University faculty pages.

## Your Goal
Find the official faculty/staff directory page for a specific department at Acadia University (acadiau.ca).

## Search Strategy
1. Use Google to search for the department's faculty page
2. Search query format: "{department name} faculty site:acadiau.ca"
3. Look for results from acadiau.ca subdomains (e.g., math.acadiau.ca, cs.acadiau.ca, biology.acadiau.ca)

## Identifying the Correct Page
- The URL should be from acadiau.ca or a subdomain
- Look for pages with titles like "Faculty", "Staff", "People", "Our Team", "Faculty & Staff"
- Avoid course pages, news articles, or student pages
- The page should list multiple professors/faculty members

## Actions to Take
1. Navigate to Google (google.com)
2. Search for the department faculty page using the format above
3. Extract the most relevant acadiau.ca faculty page URL from search results
4. Call update_phase tool with phase="navigate" and the discovered departmentUrl

## Important
- Always prioritize official acadiau.ca pages
- If multiple relevant results appear, choose the one that appears to be the main faculty directory
- After finding the URL, you MUST call the update_phase tool to proceed to the next phase`;

const EXTRACTION_AGENT_SYSTEM_PROMPT = `You are a specialized extraction agent for gathering professor information from Acadia University department websites.

## Your Goals
1. Navigate to the department faculty page
2. Observe and understand the page structure
3. Extract detailed information for each professor in the queue

## Page Structure Detection
Department pages may have different layouts:

### Type 1: Homepage List
- All professors are listed directly on the page
- Information is visible without clicking
- Look for cards, tables, or list items with professor details

### Type 2: Accordion/Expandable Sections
- Professors are grouped in collapsible sections
- You may need to click to expand sections
- Often organized by rank (Professors, Associate Professors, etc.)

### Type 3: Nested Pages
- The main page shows professor names/photos only
- Each professor has their own dedicated page
- You need to click through to individual pages for full details

## Information to Extract for Each Professor
For each professor in the queue, extract:
1. **Email** - Usually in format name@acadiau.ca
2. **Phone** - Office phone number, often with 902 area code
3. **Office Location** - Building name and room number
4. **LinkedIn URL** - Link to their LinkedIn profile if available
5. **Website URL** - Personal or academic website
6. **Designation** - Academic title:
   - Professor
   - Associate Professor
   - Assistant Professor
   - Lecturer
   - Instructor
   - Department Head/Chair
   - Emeritus Professor
7. **Profile Image URL** - URL to their headshot/photo
8. **Office Hours** - If listed on the page

## Workflow Steps

### Phase: navigate
1. Navigate to the departmentUrl from the state
2. Wait for the page to fully load
3. Call update_phase with phase="observe"

### Phase: observe
1. Observe the page structure using the observe tool
2. Determine if it's homepage_list, accordion, or nested_pages
3. Call update_phase with phase="extract" and the detected pageStructure

### Phase: extract
1. Based on the page structure:
   - For homepage_list: Extract data directly from visible content
   - For accordion: Click to expand each section, then extract
   - For nested_pages: Navigate to each professor's page and extract
2. Match extracted professors with those in the professorQueue by name
3. For each matched professor, use the extract tool to get their details
4. After extracting a professor's data, call update_professor to save it
5. Continue until all professors in the queue are processed
6. When done, call update_phase with phase="save"

## Matching Professors
- Match professors from the page to those in the professorQueue
- Use fuzzy matching on names (first name + last name)
- Handle variations like "Dr.", "Prof.", middle initials, etc.
- Only extract data for professors that are in the queue

## Error Handling
- If a professor from the queue is not found on the page, skip them
- If certain fields are not available, leave them empty
- Continue processing even if some extractions fail

## Important Notes
- Be thorough in extracting all available information
- Verify URLs are complete and valid
- For images, get the full URL (not relative paths)
- Phone numbers should include area code`;

const DATABASE_AGENT_SYSTEM_PROMPT = `You are a database agent responsible for persisting professor enrichment data.

## Your Goal
Save all extracted professor data to the database and complete the enrichment workflow.

## Phase: save
When in the save phase:
1. Review the extractedData in the network state
2. For any professors that haven't been saved yet, call update_professor
3. After all professors are processed, call complete_enrichment with a summary

## Using update_professor
- Call this tool for each professor with their enrichment data
- Include all available fields (email, phone, officeLocation, etc.)
- Skip fields that are undefined/unknown

## Completing the Workflow
After all professors are saved:
1. Call complete_enrichment with a summary
2. Include count of successfully enriched professors
3. Note any professors that couldn't be found or had issues

## Error Handling
- If update_professor fails for a professor, log it and continue
- Don't let individual failures stop the entire workflow
- Include failures in the final summary`;

// ============================================================================
// AGENTS
// ============================================================================

/**
 * Search Agent - Finds department faculty pages via Google search
 */
const searchAgent = createAgent({
  name: "search_agent",
  description:
    "Searches Google to find the official Acadia University faculty page for a specific department",
  system: SEARCH_AGENT_SYSTEM_PROMPT,
  tools: [navigate, extract, act, observe, updatePhaseTool],
});

/**
 * Extraction Agent - Extracts professor details from department pages
 */
const extractionAgent = createAgent({
  name: "extraction_agent",
  description:
    "Navigates to department pages, observes structure, and extracts professor information",
  system: EXTRACTION_AGENT_SYSTEM_PROMPT,
  tools: [
    navigate,
    extract,
    act,
    observe,
    updatePhaseTool,
    updateProfessorTool,
  ],
});

/**
 * Database Agent - Persists extracted data to the database
 */
const databaseAgent = createAgent({
  name: "database_agent",
  description:
    "Saves extracted professor enrichment data to the database and completes the workflow",
  system: DATABASE_AGENT_SYSTEM_PROMPT,
  tools: [updateProfessorTool, completeEnrichmentTool],
});

// ============================================================================
// NETWORK
// ============================================================================

/**
 * Professor Enrichment Network
 * Orchestrates the search, extraction, and database agents to enrich professor data
 */
export const enrichmentNetwork = createNetwork({
  name: "Professor Enrichment Network",
  agents: [searchAgent, extractionAgent, databaseAgent],
  defaultModel: anthropic({
    model: "claude-haiku-4-5",
    apiKey: env.ANTHROPIC_API_KEY,
    defaultParameters: {
      max_tokens: 64_000,
    },
  }),
  router: ({ network }) => {
    const state = network?.state.data as EnrichmentNetworkState | undefined;

    if (!state?.phase) {
      return searchAgent;
    }

    switch (state.phase) {
      case "search":
        return searchAgent;
      case "navigate":
      case "observe":
      case "extract":
        return extractionAgent;
      case "save":
        return databaseAgent;
      case "done":
        return;
      default:
        return searchAgent;
    }
  },
  maxIter: 50, // Allow sufficient iterations for processing multiple professors
});

/**
 * Creates initial state for the enrichment workflow
 */
export function createEnrichmentState(
  browserbaseSessionID: string,
  departmentName: string,
  departmentPrefix: string,
  professors: { id: string; name: string }[]
): ReturnType<typeof createState<EnrichmentNetworkState>> {
  return createState<EnrichmentNetworkState>({
    phase: "search",
    browserbaseSessionID,
    departmentName,
    departmentPrefix,
    professorQueue: professors,
    extractedData: [],
    currentProfessorIndex: 0,
  });
}

// ============================================================================
// INNGEST FUNCTION
// ============================================================================

/**
 * Inngest function that runs the professor enrichment workflow
 */
export const enrichProfessorsByDepartment = inngestAgent.createFunction(
  {
    id: "enrich-professors-by-department",
    retries: 2,
  },
  {
    event: "enrich/professors-by-department",
  },
  async ({ step, event }) => {
    const { departmentName, departmentPrefix, professors } = event.data;

    // Step 1: Create a Browserbase session
    const browserbaseSessionID = await step.run(
      "create-browserbase-session",
      async () => {
        const session = await browserBase.sessions.create({
          projectId: env.BROWSERBASE_PROJECT_ID as string,
          keepAlive: true,
        });
        return session.id;
      }
    );

    // Step 2: Create the network state
    const state = createEnrichmentState(
      browserbaseSessionID,
      departmentName,
      departmentPrefix,
      professors
    );

    // Step 3: Run the enrichment network
    const prompt = `Find and extract enrichment data for professors in the ${departmentName} department at Acadia University.

Department: ${departmentName}
Department Prefix: ${departmentPrefix}

Professors to find (${professors.length} total):
${professors.map((p, i) => `${i + 1}. ${p.name} (ID: ${p.id})`).join("\n")}

Start by searching Google for the department's faculty page on acadiau.ca, then navigate to it, observe the page structure, and extract information for each professor listed above.`;

    const response = await enrichmentNetwork.run(prompt, { state });

    // Step 4: Close the browser session
    await step.run("close-browserbase-session", async () => {
      try {
        const stagehand = await getStagehand(browserbaseSessionID);
        await stagehand.close();
      } catch {
        // Session may already be closed
      }
    });

    // Return summary
    return {
      departmentName,
      departmentPrefix,
      professorsRequested: professors.length,
      professorsEnriched: state.data.extractedData.length,
      extractedData: state.data.extractedData,
      networkResponse: response,
    };
  }
);

// ============================================================================
// SERVER
// ============================================================================

const server = createServer({
  appId: "Professor Enrichment Agent",
  networks: [enrichmentNetwork],
  functions: [enrichProfessorsByDepartment],
});

server.listen(5000, () => {
  // biome-ignore lint/suspicious/noConsole: logging
  console.log("Professor Enrichment Agent running on port 5000!");
});
