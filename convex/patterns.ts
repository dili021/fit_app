import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all patterns
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("patterns").order("asc").collect();
  },
});

/**
 * Get pattern by ID
 */
export const getById = query({
  args: { id: v.id("patterns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
