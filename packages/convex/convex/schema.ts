import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({}),
  departments: defineTable({
    prefix: v.string(),
    name: v.string(),
    rmpId: v.optional(v.string()),
  })
    .index("by_prefix", ["prefix"])
    .index("by_name", ["name"]),
});
