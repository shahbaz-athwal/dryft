import { google } from "@ai-sdk/google";
import BrowserBase from "@browserbasehq/sdk";
import { AISdkClient, Stagehand } from "@browserbasehq/stagehand";
import { env } from "bun";

export const browserBase = new BrowserBase({
  apiKey: env.BROWSER_BASE_API_KEY,
});

export async function getStagehand(sessionId: string) {
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: env.BROWSERBASE_API_KEY,
    projectId: env.BROWSERBASE_PROJECT_ID,
    browserbaseSessionID: sessionId,
    llmClient: new AISdkClient({
      model: google("gemini-flash-latest"),
    }),
  });
  await stagehand.init();
  return stagehand;
}
