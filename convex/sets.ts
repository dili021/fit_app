import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
 * Get sets for multiple workouts
 */
export const getSetsForWorkouts = query({
  args: { workoutIds: v.array(v.id("workouts")) },
  handler: async (ctx, args) => {
    const allSets = [];
    for (const workoutId of args.workoutIds) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("workoutId_order", (q) => q.eq("workoutId", workoutId))
        .order("asc")
        .collect();
      allSets.push(...sets);
    }
    return allSets;
  },
});

/**
 * Get all sets for a mesocycle (for progress calculation)
 * Optimized: Use workoutId_order index for efficient lookups
 */
export const getSetsForMesocycle = query({
  args: { mesocycleId: v.id("mesocycles") },
  handler: async (ctx, args) => {
    // Get all workouts for this mesocycle
    const workouts = await ctx.db
      .query("workouts")
      .withIndex("mesocycleId", (q) => q.eq("mesocycleId", args.mesocycleId))
      .collect();

    // Get all sets for these workouts using indexed lookup
    // workoutId_order index allows efficient per-workout queries
    const allSets = [];
    for (const workout of workouts) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("workoutId_order", (q) => q.eq("workoutId", workout._id))
        .order("asc")
        .collect();
      allSets.push(...sets);
    }

    return allSets;
  },
});

/**
 * Get exercise progress over time (all sets for a specific exercise)
 * Optimized: Query sets by workoutId (indexed) to avoid reading all sets globally
 */
export const getExerciseProgress = query({
  args: { 
    exerciseId: v.id("exercises"), 
    userId: v.string(),
    // Optional: limit to recent workouts to reduce query load
    limitWorkouts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get workouts for user (optionally limited to recent ones)
    let workoutsQuery = ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .order("desc"); // Most recent first
    
    // Apply limit if provided (e.g., last 100 workouts for charts)
    const workouts = args.limitWorkouts 
      ? await workoutsQuery.take(args.limitWorkouts)
      : await workoutsQuery.collect();
    
    // Reverse to chronological order
    workouts.reverse();
    
    // Create a map of workoutId -> workout for quick access
    const workoutMap = new Map(workouts.map((w) => [w._id, w]));

    // Query sets by workoutId (indexed) and filter by exerciseId
    // This only reads sets for this user's workouts, not all sets globally
    // Using workoutId index is efficient - each query only reads sets for that specific workout
    const allSets = [];
    for (const workout of workouts) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("workoutId_order", (q) => q.eq("workoutId", workout._id))
        .filter((q) => q.eq(q.field("exerciseId"), args.exerciseId))
        .order("asc")
        .collect();
      allSets.push(...sets);
    }

    // Group sets by workoutId
    const setsByWorkout = new Map<Id<"workouts">, typeof allSets>();
    for (const set of allSets) {
      if (!setsByWorkout.has(set.workoutId)) {
        setsByWorkout.set(set.workoutId, []);
      }
      setsByWorkout.get(set.workoutId)!.push(set);
    }

    // Aggregate progress by workout
    const progress = [];
    for (const [workoutId, sets] of setsByWorkout.entries()) {
      const workout = workoutMap.get(workoutId);
      if (!workout) continue;

      // Sort sets by orderInWorkout to maintain sequence
      sets.sort((a, b) => a.orderInWorkout - b.orderInWorkout);

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

    // Sort by date to ensure chronological order
    progress.sort((a, b) => a.date - b.date);

    return progress;
  },
});

/**
 * Get pattern volume over time (aggregated by workout date)
 * Optimized: Query sets by workoutId (indexed) to avoid reading all sets globally
 */
export const getPatternVolume = query({
  args: { 
    patternId: v.id("patterns"), 
    userId: v.string(),
    // Optional: limit to recent workouts to reduce query load
    limitWorkouts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get workouts for user (optionally limited to recent ones)
    let workoutsQuery = ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .order("desc"); // Most recent first
    
    // Apply limit if provided (e.g., last 100 workouts for charts)
    const workouts = args.limitWorkouts 
      ? await workoutsQuery.take(args.limitWorkouts)
      : await workoutsQuery.collect();
    
    // Reverse to chronological order
    workouts.reverse();

    // Create a map of workoutId -> workout for quick access
    const workoutMap = new Map(workouts.map((w) => [w._id, w]));

    // Query sets by workoutId (indexed) and filter by patternId
    // This only reads sets for this user's workouts, not all sets globally
    // Using workoutId index is efficient - each query only reads sets for that specific workout
    const allSets = [];
    for (const workout of workouts) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("workoutId_order", (q) => q.eq("workoutId", workout._id))
        .filter((q) => q.eq(q.field("patternId"), args.patternId))
        .order("asc")
        .collect();
      allSets.push(...sets);
    }

    // Group sets by workoutId
    const setsByWorkout = new Map<Id<"workouts">, typeof allSets>();
    for (const set of allSets) {
      if (!setsByWorkout.has(set.workoutId)) {
        setsByWorkout.set(set.workoutId, []);
      }
      setsByWorkout.get(set.workoutId)!.push(set);
    }

    // Aggregate volume by workout
    const volume = [];
    for (const [workoutId, sets] of setsByWorkout.entries()) {
      const workout = workoutMap.get(workoutId);
      if (!workout) continue;

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

    // Sort by date to ensure chronological order
    volume.sort((a, b) => a.date - b.date);

    return volume;
  },
});

/**
 * Get all sets for a user (for comprehensive progress tracking)
 * Optimized: Use workoutId index efficiently by querying sets directly
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

    // Create a Set of workout IDs for fast lookup
    const workoutIds = new Set(workouts.map((w) => w._id));

    // Query sets using workoutId index - Convex will efficiently filter
    // We query each workout's sets individually since workoutId is indexed
    // This is still efficient because workoutId index allows direct lookups
    const allSets = [];
    for (const workout of workouts) {
      const sets = await ctx.db
        .query("sets")
        .withIndex("workoutId_order", (q) => q.eq("workoutId", workout._id))
        .order("asc")
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

    // Calculate suggested weight change based on 8-12 rep range (auto-progression)
    // This is a CORE feature - keeps user in hypertrophy zone
    let suggestedWeightChange: "increase" | "decrease" | "maintain" | undefined = undefined;
    
    if (args.reps >= 12) {
      // Hit 12+ reps → suggest weight increase for next time
      suggestedWeightChange = "increase";
    } else if (args.reps < 8) {
      // Can't hit 8 reps → suggest weight decrease for next time
      suggestedWeightChange = "decrease";
    } else {
      // 8-12 reps → maintain (sweet spot)
      suggestedWeightChange = "maintain";
    }

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
      suggestedWeightChange,
    });

    return setId;
  },
});
