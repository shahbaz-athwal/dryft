import { prisma } from "@repo/db/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { authEnv } from "./env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: authEnv().BETTER_AUTH_SECRET,
  advanced: {
    defaultCookieAttributes: {
      secure: true,
      sameSite: "none",
      httpOnly: true,
    },
  },

  trustedOrigins: ["*"],
});
