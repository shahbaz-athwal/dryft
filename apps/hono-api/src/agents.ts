import {
  anthropic,
  createAgent,
  createNetwork,
  createRoutingAgent,
  createState,
  createTool,
} from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import { env } from "bun";
import z from "zod";
import { inngestAgent } from "./inngest/client";
import { browserBase, getStagehand } from "./services/browser-base";
import { updateProfessorTool } from "./tools/database";
import { act, extract, navigate, observe } from "./tools/stagehand";

const SEARCH_AGENT_SYSTEM_PROMPT = `
  You are a specialized search agent for finding Acadia University faculty pages.

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
  4. Call save_state tool with the discovered departmentUrl

  ## Important
  - Always prioritize official acadiau.ca pages
  - If multiple relevant results appear, choose the one that appears to be the main faculty directory
  - After finding the URL, you MUST call the update_phase tool to proceed to the next phase
`;

const EXTRACTION_AGENT_SYSTEM_PROMPT = `
  You are a specialized extraction agent with access to browser-base stagehand APIs for web browsing.

  ## Available Tools
  You have access to the following browser automation tools:
  - **navigate**: Navigate to a given URL
  - **extract**: Extract structured data from the current page
  - **act**: Perform actions on the page (click, type, etc.)
  - **observe**: Observe and analyze the current page structure
  - **update_professor**: Save extracted professor data to the database

  ## Input You Will Receive
  - A **department faculty page URL** from Acadia University (acadiau.ca)
  - A **professor name** to find on that page
  - A **unique professor ID** to use when saving the data

  ## Your Goal
  Extract all available information for the specified professor from the faculty page and save it using the update_professor tool.

  ## Information to Extract
  1. **Profile Picture URL**
    - Locate the professor's image HTML element on the page
    - Extract the \`src\` attribute from the image element
    - If the src is a relative path, combine it with the page domain to get the full URL
    - Example: If src="/images/prof.jpg" and domain is "https://biology.acadiau.ca", the full URL is "https://biology.acadiau.ca/images/prof.jpg"

  2. **Website URL** - Personal or academic website link

  3. **Designation** - Academic title such as:
    - Professor
    - Associate Professor
    - Assistant Professor
    - Lecturer
    - Instructor
    - Department Head/Chair
    - Emeritus Professor

  4. **Office Location** - Building name and room number

  5. **Email** - Usually in format name@acadiau.ca

  6. **Phone Number** - Office phone, often with 902 area code

  ## Workflow

  1. **Navigate** to the provided department faculty page URL
  2. **Observe** the page to understand its structure and locate the professor
  3. **Extract** all available information for the specified professor:
    - Use the extract tool with appropriate instructions and schema
    - For the profile picture, specifically extract the image src attribute
    - Construct the full image URL by combining relative paths with the domain
  4. **Save** the extracted data using the update_professor tool with the provided professor ID

  ## Important Notes
  - Focus on extracting data for ONE professor only (the one specified in the input)
  - If the professor is not found on the page, report this and skip
  - If certain fields are not available, set them to null
  - Always ensure image URLs are complete (not relative paths)
  - Use the exact professor ID provided when calling update_professor
`;

const searchAgent = createAgent({
  name: "search_agent",
  description:
    "Searches Google to find the official Acadia University faculty page for a specific department",
  system: SEARCH_AGENT_SYSTEM_PROMPT,
  tools: [
    navigate,
    extract,
    act,
    observe,
    createTool({
      name: "save_state",
      description: "Save the discovered department URL",
      parameters: z.object({
        departmentUrl: z.string().describe("The department URL to save"),
      }),
      handler: ({ departmentUrl }, { network }) => {
        // biome-ignore lint/suspicious/noExplicitAny: allow
        (network?.state.data as any).departmentUrl = departmentUrl;
        return {
          success: true,
          message: "Department URL saved successfully",
        };
      },
    }),
  ],
});

const extractionAgent = createAgent({
  name: "extraction_agent",
  description:
    "Navigates to department pages, observes structure, and extracts professor information",
  system: EXTRACTION_AGENT_SYSTEM_PROMPT,
  tools: [navigate, extract, act, observe, updateProfessorTool],
});

const router = createRoutingAgent({
  name: "Professor Data Extraction Routing Agent",
  system: async ({ network }): Promise<string> => {
    if (!network) {
      throw new Error(
        "The routing agent can only be used within a network of agents"
      );
    }
    const agents = await network?.availableAgents();
    return `
      You are the orchestrator for professor data extraction, coordinating between the search agent and the extraction agent.

      ## Your Role
      You orchestrate the extraction task by delegating work to specialized agents in the correct sequence.

      ## Available Agents
      <agents>
      ${agents
        .map((a) => {
          return `<agent>
        <name>${a.name}</name>
        <description>${a.description}</description>
        <tools>${JSON.stringify(Array.from(a.tools.values()))}</tools>
      </agent>`;
        })
        .join("\n")}
      </agents>

      ## Workflow

      ### Step 1: Find the Department URL
      First, use the **search_agent** to find the department faculty page URL on Acadia University's website.
      - The search agent will search Google for the department's faculty page
      - It will save the discovered departmentUrl to the state
      - Wait for the search agent to complete before proceeding

      ### Step 2: Extract Professor Information
      After the department URL is found, extract information for each professor **one at a time**.
      - For EACH professor in the input list, call the **extraction_agent** separately
      - The extraction agent will:
        1. Navigate to the department faculty page
        2. Find and extract information for that specific professor
        3. Save the data using the update_professor tool
      - Do NOT batch multiple professors - extract ONE professor per extraction_agent call
      - Continue until all professors have been processed

      ## Decision Logic
      1. If the departmentUrl has NOT been found yet → select search_agent
      2. If the departmentUrl exists AND there are professors still to process → select extraction_agent (for the next professor)
      3. If all professors have been processed → call select_agent with "finished"

      ## Important
      - Process professors sequentially, one at a time
      - Ensure the search agent completes before starting extraction
      - Track which professors have been processed to avoid duplicates
    `;
  },
  tools: [
    createTool({
      name: "select_agent",
      description:
        "select an agent to handle the input, based off of the current conversation",
      parameters: z
        .object({
          name: z
            .string()
            .describe("The name of the agent that should handle the request"),
        })
        .strict(),
      handler: ({ name }, { network }) => {
        if (!network) {
          throw new Error(
            "The routing agent can only be used within a network of agents"
          );
        }
        if (name === "finished") {
          return;
        }
        const agent = network.agents.get(name);
        if (agent === undefined) {
          throw new Error(
            `The routing agent requested an agent that doesn't exist: ${name}`
          );
        }
        return agent.name;
      },
    }),
  ],
  tool_choice: "select_agent",
  lifecycle: {
    onRoute: ({ result }) => {
      const tool = result.toolCalls[0];
      if (!tool) {
        return;
      }
      // biome-ignore lint/suspicious/noExplicitAny: allow
      const agentName = (tool.content as any).data || (tool.content as string);
      if (agentName === "finished") {
        return;
      }
      return [agentName];
    },
  },
});

export const enrichmentNetwork = createNetwork({
  name: "Professor Enrichment Network",
  agents: [searchAgent, extractionAgent],
  defaultModel: anthropic({
    model: "claude-sonnet-4-5",
    apiKey: env.ANTHROPIC_API_KEY,
    defaultParameters: {
      max_tokens: 64_000,
    },
  }),
  router,
  maxIter: 50, // Allow sufficient iterations for processing multiple professors
});

export const enrichProfessorsByDepartment = inngestAgent.createFunction(
  {
    id: "enrich-professors-by-department",
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
    const state = createState({
      browserbaseSessionID,
      departmentName,
      departmentPrefix,
      professors,
    });

    // Step 3: Run the enrichment network
    const prompt = `
      Find and extract enrichment data for professors in the ${departmentName} department at Acadia University.
      Professors to find (${professors.length} total):
      ${professors.map((p) => `${p.name} (ID: ${p.id})`).join("\n")}
      `;

    const response = await enrichmentNetwork.run(prompt, { state });

    // Step 4: Close the browser session
    await step.run("close-browserbase-session", async () => {
      const stagehand = await getStagehand(browserbaseSessionID);
      await stagehand.close();
    });

    return response;
  }
);

const server = createServer({
  appId: "Browsing Agent",
  functions: [enrichProfessorsByDepartment],
});

server.listen(5000);
