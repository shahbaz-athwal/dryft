import { api } from "@repo/convex/convex/_generated/api";
import { env } from "@repo/convex/env";
import { ConvexHttpClient } from "convex/browser";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

const convex = new ConvexHttpClient(env.CONVEX_URL);

app.post("/departments/populate", async (c) => {
  const result = await convex.mutation(api.departments.populateDepartments, {});
  return c.json(result, 200);
});

app.get("/departments", async (c) => {
  const departments = await convex.query(api.departments.listDepartments, {});
  return c.json(departments, 200);
});

export default {
  fetch: app.fetch,
  port: 4000,
};
