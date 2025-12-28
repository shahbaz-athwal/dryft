import BrowserBase from "@browserbasehq/sdk";
import { Stagehand } from "@browserbasehq/stagehand";
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
    model: "google/gemini-2.5-flash",
  });
  await stagehand.init();
  return stagehand;
}
