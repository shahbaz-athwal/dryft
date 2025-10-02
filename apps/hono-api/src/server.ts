import { handler } from "@repo/orpc/handler";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: { headers: c.req.raw.headers }, // Provide initial context if needed
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

app.get("/", (c) => c.text("Hono API with oRPC"));

export default {
  fetch: app.fetch,
  port: 4000,
};
