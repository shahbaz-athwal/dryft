import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listDepartments = query({
  args: {},

  handler: async (ctx) => {
    const all = await ctx.db.query("departments").order("asc").collect();
    return all.map((d) => ({
      _id: d._id,
      _creationTime: d._creationTime,
      prefix: d.prefix,
      name: d.name,
      rmpId: d.rmpId ?? null,
    }));
  },
});

export const populateDepartments = mutation({
  args: {},
  returns: v.object({ inserted: v.number(), updated: v.number() }),
  handler: async (ctx) => {
    const mockDepartments: Array<{
      prefix: string;
      name: string;
      rmpId: string | null;
    }> = [
      { prefix: "CS", name: "Computer Science", rmpId: null },
      { prefix: "MATH", name: "Mathematics", rmpId: null },
      { prefix: "PHYS", name: "Physics", rmpId: null },
      { prefix: "CHEM", name: "Chemistry", rmpId: null },
      { prefix: "BIOL", name: "Biology", rmpId: null },
    ];

    let inserted = 0;
    let updated = 0;

    for (const dept of mockDepartments) {
      const existing = await ctx.db
        .query("departments")
        .withIndex("by_prefix", (q) => q.eq("prefix", dept.prefix))
        .unique();

      if (existing) {
        const needsUpdate =
          existing.name !== dept.name ||
          (existing.rmpId ?? null) !== (dept.rmpId ?? null);
        if (needsUpdate) {
          await ctx.db.patch(existing._id, {
            name: dept.name,
            rmpId: dept.rmpId ?? undefined,
          });
          updated += 1;
        }
        continue;
      }

      await ctx.db.insert("departments", {
        prefix: dept.prefix,
        name: dept.name,
        rmpId: dept.rmpId ?? undefined,
      });
      inserted += 1;
    }

    return { inserted, updated };
  },
});
