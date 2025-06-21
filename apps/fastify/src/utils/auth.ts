import { prisma } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { resend } from "./resend";

export const auth = betterAuth({
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "verify@shahcodes.in", // TODO: Change this to different domain after buying one
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
    requireEmailVerification: true,
  },

  trustedOrigins: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ["*"],
});
