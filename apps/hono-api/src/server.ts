import { Hono } from "hono";
import { cors } from "hono/cors";
import { connect } from "inngest/connect";
import { serve } from "inngest/hono";
import { inngest } from "./inngest/client";
import { processCourse } from "./inngest/process-course";
import { handler as rpcHandler } from "./routes/rpc";
import { auth } from "./services/auth";

const app = new Hono();
const functions = [processCourse];

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
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: {}, // Provide initial context if needed
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

app.get("/", (c) => c.text("Hono API with oRPC"));

(async () => {
  await connect({
    apps: [{ client: inngest, functions }],
  });
})();

export default {
  fetch: app.fetch,
  port: 4000,
};
