import { createTRPCNext } from "@trpc/next";
import { ssrPrepass } from "@trpc/next/ssrPrepass";
import type { AppRouter } from "fastify/src/trpc/router";
import { httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

export const trpc = createTRPCNext<AppRouter>({
  ssr: true,
  ssrPrepass,
  transformer: SuperJSON,
  config() {
    if (typeof window !== "undefined") {
      return {
        links: [
          httpBatchLink({
            url: "/api/trpc",
            transformer: SuperJSON,
          }),
        ],
      };
    }
    return {
      links: [
        httpBatchLink({
          url: "http://localhost:4000/trpc",
          transformer: SuperJSON,
        }),
      ],
    };
  },
});
