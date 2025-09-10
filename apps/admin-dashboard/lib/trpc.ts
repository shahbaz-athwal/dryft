import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "fastify-api/trpc";

export const trpc = createTRPCReact<AppRouter>();
