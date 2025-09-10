import { prisma } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { resend } from "./resend";

export const auth = betterAuth({
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "verify@dryft.ca",
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`, // TODO: Make email template
      });
    },
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  trustedOrigins:
    process.env.NODE_ENV === "development"
      ? [process.env.FRONTEND_URL as string]
      : ["*"],
});
