import fastifyCors from "@fastify/cors";
import {
  type FastifyTRPCPluginOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import auth from "./routes/auth.routes";
import { type AppRouter, appRouter } from "./trpc/router";
import { createContext } from "./trpc/trpc";

const f = fastify({
  logger: true,
});

f.register(fastifyCors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
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
    await f.listen({ port: 4000, host: "0.0.0.0" });
  } catch (err) {
    f.log.error(err);
    process.exit(1);
  }
})();
