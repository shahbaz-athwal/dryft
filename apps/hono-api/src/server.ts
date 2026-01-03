import { handleRequest } from "@better-upload/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { connect } from "inngest/connect";
import { serve } from "inngest/hono";
import { inngest } from "./inngest/client";
import {
  triggerCourseProcessing,
  triggerRmpReviewsPulling,
} from "./inngest/event-producers";
import { linkProfessorsWithRmp } from "./inngest/link-professors-with-rmp";
import { populateCourses } from "./inngest/populate-courses";
import { populateDepartments } from "./inngest/populate-departments";
import { populateProfessors } from "./inngest/populate-professors";
import { processCourse } from "./inngest/process-course";
import { pullRmpReviews } from "./inngest/pull-rmp-reviews";
import { handler as rpcHandler } from "./routes/rpc";
import { auth } from "./services/auth";
import { uploadRouter } from "./services/file-upload";
import { posthog } from "./services/posthog";

const app = new Hono();

const functions = [
  processCourse,
  populateProfessors,
  linkProfessorsWithRmp,
  populateCourses,
  triggerCourseProcessing,
  populateDepartments,
  pullRmpReviews,
  triggerRmpReviewsPulling,
];

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  poweredBy({
    serverName: "Acadia One API",
  })
);
app.use(logger());

// Todo: Add OTEL Logging

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

app.post("/upload", (c) => {
  return handleRequest(c.req.raw, uploadRouter);
});

app.get("/", (c) => c.text("Hono API with oRPC"));

app.onError(async (err, c) => {
  posthog.captureException(err, undefined, {
    path: c.req.path,
    method: c.req.method,
    url: c.req.url,
    headers: c.req.header(),
  });

  await posthog.flush();
  return c.text("Internal Server Error", 500);
});

(async () => {
  await connect({
    apps: [{ client: inngest, functions }],
  });
})();

export default {
  fetch: app.fetch,
  port: 4000,
};

await posthog.shutdown();
