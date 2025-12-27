import {
  createAgent,
  createNetwork,
  createRoutingAgent,
  createState,
  createTool,
  gemini,
} from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import { env } from "bun";
import { EventSchemas, Inngest } from "inngest";
import { z } from "zod";
import { browserBase, getStagehand } from "./services/browser-base";
import { act, extract, navigate, observe } from "./tools/stagehand";

const webSearchAgent = createAgent({
  name: "web_search_agent",
  description: "I am a web search agent.",
  system: `You are a web search agent.
  `,
  tools: [navigate, extract, act, observe],
});

const datbaseAgent = createAgent({
  name: "database_agent",
  description: "I am a database agent.",
  system: `You are a database agent responsible for querying and mutating the database.
  `,
  tools: [],
});

const supervisorRoutingAgent = createRoutingAgent({
  name: "Supervisor",
  description: "I am a Research supervisor.",
  system: `You are a research supervisor.
Your goal is to search for information linked to the user request by augmenting your own research with the "web_search_agent" agent.

Think step by step and reason through your decision.

When the answer is found, call the "done" agent.`,
  model: gemini({
    model: "gemini-3-flash",
    apiKey: env.GOOGLE_API_KEY,
  }),
  tools: [
    createTool({
      name: "route_to_agent",
      description: "Invoke an agent to perform a task",
      parameters: z.object({
        agent: z.string().describe("The agent to invoke"),
      }),
      handler: ({ agent }) => {
        return agent;
      },
    }),
  ],
  tool_choice: "route_to_agent",
  lifecycle: {
    onRoute: ({ result, network }) => {
      const lastMessage = lastResult(network?.state.results);

      // ensure to loop back to the last executing agent if a tool has been called
      if (lastMessage && isLastMessageOfType(lastMessage, "tool_call")) {
        return [lastMessage?.agent.name];
      }

      const tool = result.toolCalls[0];
      if (!tool) {
        return;
      }
      const toolName = tool.tool.name;
      if (toolName === "done") {
        return;
      }
      if (
        toolName === "route_to_agent" &&
        typeof tool.content === "object" &&
        tool.content !== null &&
        "data" in tool.content &&
        typeof tool.content.data === "string"
      ) {
        return [tool.content.data];
      }
      return;
    },
  },
});

const searchNetwork = createNetwork({
  name: "Search Network",
  agents: [webSearchAgent, datbaseAgent],
  defaultModel: gemini({
    model: "gemini-3-flash",
    apiKey: env.GOOGLE_API_KEY,
  }),
  defaultRouter: supervisorRoutingAgent,
});

const inngest = new Inngest({
  id: "Browser Agent",
  schemas: new EventSchemas().fromSchema({
    "scrape/professors-details-department": z.object({
      departmentName: z.string(),
    }),
  }),
});

const simpleSearchWorkflow = inngest.createFunction(
  {
    id: "scrape-professors-details-department",
  },
  {
    event: "scrape/professors-details-department",
  },
  async ({ step, event }) => {
    const browserbaseSessionID = await step.run(
      "create_browserbase_session",
      async () => {
        const session = await browserBase.sessions.create({
          projectId: env.BROWSERBASE_PROJECT_ID as string,
          keepAlive: true,
        });
        return session.id;
      }
    );

    const state = createState({
      browserbaseSessionID,
    });

    const response = await searchNetwork.run(
      `Search for professors in department of ${event.data.departmentName}`,
      {
        state,
      }
    );

    await step.run("close-browserbase-session", async () => {
      const stagehand = await getStagehand(browserbaseSessionID);
      await stagehand.close();
    });

    return {
      response,
    };
  }
);
const server = createServer({
  appId: "Browser Agent",
  networks: [searchNetwork],
  functions: [simpleSearchWorkflow],
});

server.listen(5000, () => {
  // biome-ignore lint/suspicious/noConsole: logging
  console.log("Agent kit running!");
});
