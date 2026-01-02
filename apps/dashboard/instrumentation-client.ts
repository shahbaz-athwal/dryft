import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
  api_host: "https://us.i.posthog.com",
  defaults: "2025-11-30",
});
