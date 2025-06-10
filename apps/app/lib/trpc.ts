import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "fastify/src/trpc/router";

export const trpc = createTRPCReact<AppRouter>();
