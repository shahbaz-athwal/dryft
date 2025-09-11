import fastifyCors from "@fastify/cors";
import { type AppRouter, appRouter } from "@repo/trpc/router";
import { createContext } from "@repo/trpc/trpc";
import {
  type FastifyTRPCPluginOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import auth from "./routes/auth.routes";

const f = fastify({
  logger: process.env.NODE_ENV === "development",
});

f.register(fastifyCors, {
  origin:
    process.env.NODE_ENV === "development" ? true : process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86_400,
});

// Better Auth
f.register(auth);

// tRPC
f.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      // biome-ignore lint: style/noConsole
      console.error(`Error in tRPC handler on path '${path}':`, error);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

// Start the server
(async () => {
  try {
    await f.listen({
      port: Number(process.env.PORT),
      host: "0.0.0.0",
    });
  } catch (err) {
    f.log.error(err);
    process.exit(1);
  }
})();
