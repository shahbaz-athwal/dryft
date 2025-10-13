import { authEnv } from "@repo/auth/env";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  extends: [authEnv()],
  server: {
    PORT: z.number().default(4000),
    DATABASE_URL: z.url(),
    ACADIA_USERNAME: z.string().min(1),
    ACADIA_PASSWORD: z.string().min(1),
    INNGEST_EVENT_KEY: z.string().min(1),
    INNGEST_SIGNING_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    FRONTEND_URL: z.string().min(1),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  isServer: true,
  runtimeEnv: process.env,
});
