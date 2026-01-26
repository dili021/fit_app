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
 * Get exercise progress over time (all sets for a specific exercise)
 */
export const getExerciseProgress = query({
  args: { exerciseId: v.id("exercises"), userId: v.string() },
  handler: async (ctx, args) => {
    // Get all workouts for user
    const workouts = await ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .order("asc")
      .collect();

    // Get all sets for this exercise across all workouts
    const progress = [];
    for (const workout of workouts) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("exerciseId", (q) => q.eq("exerciseId", args.exerciseId))
        .filter((q) => q.eq(q.field("workoutId"), workout._id))
        .order("asc")
        .collect();

      if (sets.length > 0) {
        // Calculate average weight and reps for this workout
        const totalWeight = sets.reduce((sum, s) => sum + s.weight, 0);
        const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);
        const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
        
        progress.push({
          workoutId: workout._id,
          date: workout.date,
          weekNumber: workout.weekNumber,
          setCount: sets.length,
          avgWeight: totalWeight / sets.length,
          avgReps: totalReps / sets.length,
          totalVolume,
          setDetails: sets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            volume: s.weight * s.reps,
          })),
        });
      }
    }

    return progress;
  },
});

/**
 * Get pattern volume over time (aggregated by workout date)
 */
export const getPatternVolume = query({
  args: { patternId: v.id("patterns"), userId: v.string() },
  handler: async (ctx, args) => {
    // Get all workouts for user
    const workouts = await ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .order("asc")
      .collect();

    // Get all sets for this pattern across all workouts
    const volume = [];
    for (const workout of workouts) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("patternId", (q) => q.eq("patternId", args.patternId))
        .filter((q) => q.eq(q.field("workoutId"), workout._id))
        .collect();

      if (sets.length > 0) {
        const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
        const totalSets = sets.length;
        
        volume.push({
          workoutId: workout._id,
          date: workout.date,
          weekNumber: workout.weekNumber,
          sets: totalSets,
          totalVolume,
        });
      }
    }

    return volume;
  },
});

/**
 * Get all sets for a user (for comprehensive progress tracking)
 */
export const getAllSetsForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get all workouts for user
    const workouts = await ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completed"), true))
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
