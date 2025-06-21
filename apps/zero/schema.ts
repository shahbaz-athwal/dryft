import { schema as generatedSchema, type Schema } from "@repo/db/schema";
import { definePermissions } from "@rocicorp/zero";

export const schema = generatedSchema;

export const permissions = definePermissions<unknown, Schema>(
  schema,
  () => ({}),
);
