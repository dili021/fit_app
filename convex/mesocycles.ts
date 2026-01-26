import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the active mesocycle for a user
 */
export const getActiveMesocycle = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mesocycles")
      .withIndex("userId_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active")
      )
      .first();
  },
});

/**
 * Get mesocycle by ID
 */
export const getMesocycleById = query({
  args: { id: v.id("mesocycles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get all mesocycles for a user
 */
export const getAllMesocycles = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mesocycles")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Create a new mesocycle
 */
export const createMesocycle = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    startDate: v.number(),
    durationWeeks: v.number(),
    primaryPatterns: v.array(v.id("patterns")),
    targetSetsPerWeek: v.number(),
    sessionsPerWeek: v.number(),
    wasPreviouslyTraining: v.boolean(),
    restTimeMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    // Deactivate any existing active mesocycles for this user
    const existing = await ctx.db
      .query("mesocycles")
      .withIndex("userId_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active")
      )
      .collect();

    for (const mesocycle of existing) {
      await ctx.db.patch(mesocycle._id, { status: "completed" });
    }

    // Create new mesocycle
    const mesocycleId = await ctx.db.insert("mesocycles", {
      userId: args.userId,
      name: args.name,
      startDate: args.startDate,
      durationWeeks: args.durationWeeks,
      primaryPatterns: args.primaryPatterns,
      targetSetsPerWeek: args.targetSetsPerWeek,
      sessionsPerWeek: args.sessionsPerWeek,
      wasPreviouslyTraining: args.wasPreviouslyTraining,
      restTimeMinutes: args.restTimeMinutes,
      status: "active",
      currentWeek: 1,
    });

    return mesocycleId;
  },
});

/**
 * Calculate set distribution for a mesocycle and week
 */
export const calculateSetDistribution = query({
  args: {
    mesocycleId: v.id("mesocycles"),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const mesocycle = await ctx.db.get(args.mesocycleId);
    if (!mesocycle) {
      throw new Error("Mesocycle not found");
    }

    // Calculate build-up percentage if needed
    let setsMultiplier = 1.0;
    if (!mesocycle.wasPreviouslyTraining) {
      if (args.weekNumber <= 2) {
        setsMultiplier = 0.5;
      } else if (args.weekNumber <= 4) {
        setsMultiplier = 0.75;
      }
      // Week 5+ uses 1.0 (full volume)
    }

    const adjustedSetsPerWeek = Math.round(
      mesocycle.targetSetsPerWeek * setsMultiplier
    );
    const setsPerSession = Math.floor(
      adjustedSetsPerWeek / mesocycle.sessionsPerWeek
    );
    const extraSets = adjustedSetsPerWeek % mesocycle.sessionsPerWeek;

    return {
      setsPerSession,
      extraSets,
      totalSetsPerWeek: adjustedSetsPerWeek,
      sessionsPerWeek: mesocycle.sessionsPerWeek,
    };
  },
});
