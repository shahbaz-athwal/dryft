import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "inngest/hono";
import { functions, inngest } from "./inngest";
import { handler } from "./routes/rpc";
import { auth } from "./services/auth";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/inngest/*", serve({ client: inngest, functions }));

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: {}, // Provide initial context if needed
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
