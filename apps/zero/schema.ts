import { schema as generatedSchema, type Schema } from "@repo/db/schema";
import { ANYONE_CAN_DO_ANYTHING, definePermissions } from "@rocicorp/zero";

export const schema = generatedSchema;

export const permissions = definePermissions<unknown, Schema>(schema, () => ({
  user: ANYONE_CAN_DO_ANYTHING,
}));
