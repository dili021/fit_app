import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get exercises by pattern
 */
export const getByPattern = query({
  args: { patternId: v.id("patterns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exercises")
      .withIndex("patternId", (q) => q.eq("patternId", args.patternId))
      .collect();
  },
});

/**
 * Get all exercises
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exercises").collect();
  },
});

/**
 * Get exercise by ID
 */
export const getById = query({
  args: { id: v.id("exercises") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
