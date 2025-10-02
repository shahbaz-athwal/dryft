import { createMiddleware, RPCHandler } from "@orpc/server/hono";
import { router } from "@repo/orpc/router";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

const rpcHandler = new RPCHandler(router);

app.use(
  "/orpc/*",
  createMiddleware(rpcHandler, {
    prefix: "/orpc",
    context: async () => ({}),
  })
);

app.get("/", (c) => c.text("Hono API with oRPC"));

export default {
  fetch: app.fetch,
  port: 4000,
};
