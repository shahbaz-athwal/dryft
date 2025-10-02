import { createRouter } from "@orpc/server";
import { schemas } from "./contract";
import { acadiaImporterRouter } from "./routers/acadia-importer.router";

const baseRouter = createRouter();

export const router = baseRouter
  .query("hello", {
    input: schemas.hello.input,
    output: schemas.hello.output,
    resolve: async () => "Hello World",
  })
  .query("users", {
    input: schemas.users.input,
    output: schemas.users.output,
    resolve: async () => [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" },
    ],
  })
  .query("user", {
    input: schemas.user.input,
    output: schemas.user.output,
    resolve: async ({ input }) => ({
      id: input.id,
      name: "John Doe",
    }),
  })
  .merge("acadiaImporter", acadiaImporterRouter);

export type Router = typeof router;
