import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get recent workouts for a user (last N workouts)
 */
export const getRecentWorkouts = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;
    return await ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get workouts for a mesocycle
 */
export const getWorkoutsByMesocycle = query({
  args: { mesocycleId: v.id("mesocycles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workouts")
      .withIndex("mesocycleId", (q) => q.eq("mesocycleId", args.mesocycleId))
      .order("desc")
      .collect();
  },
});

/**
 * Get workout by ID
 */
export const getWorkoutById = query({
  args: { id: v.id("workouts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
