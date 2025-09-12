import { convexAdapter } from "@convex-dev/better-auth";
import { betterAuth } from "better-auth";
import type { GenericCtx } from "./convex/_generated/server";
import { betterAuthComponent } from "./convex/auth";
import { env } from "./env";

export const auth = (ctx: GenericCtx) => {
  betterAuth({
    database: convexAdapter(ctx, betterAuthComponent),
    baseURL: env.API_URL,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
  });
};
