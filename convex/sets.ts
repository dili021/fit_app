import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get sets for a workout
 */
export const getSetsForWorkout = query({
  args: { workoutId: v.id("workouts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sets")
      .withIndex("workoutId_order", (q) => q.eq("workoutId", args.workoutId))
      .order("asc")
      .collect();
  },
});

/**
 * Get all sets for a mesocycle (for progress calculation)
 */
export const getSetsForMesocycle = query({
  args: { mesocycleId: v.id("mesocycles") },
  handler: async (ctx, args) => {
    // Get all workouts for this mesocycle
    const workouts = await ctx.db
      .query("workouts")
      .withIndex("mesocycleId", (q) => q.eq("mesocycleId", args.mesocycleId))
      .collect();

    // Get all sets for these workouts
    const allSets = [];
    for (const workout of workouts) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("workoutId", (q) => q.eq("workoutId", workout._id))
        .collect();
      allSets.push(...sets);
    }

    return allSets;
  },
});

/**
 * Get last set for an exercise (for showing previous weight/reps)
 */
export const getLastSetForExercise = query({
  args: { exerciseId: v.id("exercises"), userId: v.string() },
  handler: async (ctx, args) => {
    // Get all workouts for user
    const workouts = await ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Find the most recent set for this exercise
    for (const workout of workouts) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("exerciseId", (q) => q.eq("exerciseId", args.exerciseId))
        .filter((q) => q.eq(q.field("workoutId"), workout._id))
        .order("desc")
        .first();

      if (sets) {
        return sets;
      }
    }

    return null;
  },
});

/**
 * Create a set
 */
export const createSet = mutation({
  args: {
    workoutId: v.id("workouts"),
    patternId: v.id("patterns"),
    exerciseId: v.id("exercises"),
    weight: v.number(),
    reps: v.number(),
    orderInWorkout: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the last order number for this workout to ensure proper sequencing
    const existingSets = await ctx.db
      .query("sets")
      .withIndex("workoutId_order", (q) => q.eq("workoutId", args.workoutId))
      .order("desc")
      .first();

    const order = existingSets ? existingSets.orderInWorkout + 1 : args.orderInWorkout;

    const setId = await ctx.db.insert("sets", {
      workoutId: args.workoutId,
      patternId: args.patternId,
      exerciseId: args.exerciseId,
      weight: args.weight,
      reps: args.reps,
      orderInWorkout: order,
      startTime: args.startTime,
      endTime: args.endTime,
      duration: args.duration,
    });

    return setId;
  },
});
