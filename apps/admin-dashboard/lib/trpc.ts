import type { AppRouter } from "@repo/trpc/router";
import { createTRPCReact } from "@trpc/react-query";

type TRPCReactClient = ReturnType<typeof createTRPCReact<AppRouter>>;
export const trpc: TRPCReactClient = createTRPCReact<AppRouter>();
