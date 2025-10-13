import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export function authEnv() {
  return createEnv({
    server: {
      BETTER_AUTH_SECRET: z.string().min(1),
      NODE_ENV: z.enum(["development", "production"]).default("development"),
    },
    isServer: true,
    runtimeEnv: process.env,
  });
}
