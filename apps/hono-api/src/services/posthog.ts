import { env } from "bun";
import { PostHog } from "posthog-node";

if (!env.POSTHOG_PUBLIC_KEY) {
  throw new Error("POSTHOG_PUBLIC_KEY is not set");
}

export const posthog = new PostHog(env.POSTHOG_PUBLIC_KEY, {
  host: "https://us.i.posthog.com",
});
