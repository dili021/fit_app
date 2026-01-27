import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";

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
 * Get all workouts for a user (chronological, completed only)
 * @deprecated Use getAllWorkoutsPaginated for pagination support
 */
export const getAllWorkouts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .order("desc")
      .collect();
  },
});

/**
 * Get workouts for a user with pagination (for infinite scroll)
 */
export const getAllWorkoutsPaginated = query({
  args: { 
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .order("desc")
      .paginate(args.paginationOpts);
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

/**
 * Get active (incomplete) workout for a user
 */
export const getActiveWorkout = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query("workouts")
      .withIndex("userId_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    // Find the most recent incomplete workout
    return workouts.find((w) => !w.completed) || null;
  },
});

/**
 * Generate workout template - calculates sets per pattern for a session
 */
export const generateWorkoutTemplate = query({
  args: {
    mesocycleId: v.id("mesocycles"),
  },
  handler: async (ctx, args) => {
    const mesocycle = await ctx.db.get(args.mesocycleId);
    if (!mesocycle) {
      throw new Error("Mesocycle not found");
    }

    // Calculate current week
    const now = Date.now();
    const elapsed = now - mesocycle.startDate;
    const weeksElapsed = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = Math.min(weeksElapsed + 1, mesocycle.durationWeeks);

    // Check if it's the final week (deload week)
    const isDeloadWeek = currentWeek === mesocycle.durationWeeks;

    // Calculate build-up percentage if needed
    let setsMultiplier = 1.0;
    if (!mesocycle.wasPreviouslyTraining) {
      if (currentWeek <= 2) {
        setsMultiplier = 0.5;
      } else if (currentWeek <= 4) {
        setsMultiplier = 0.75;
      }
      // Week 5+ uses 1.0 (full volume)
    }

    // Apply deload reduction (50% of current volume) in final week
    if (isDeloadWeek) {
      setsMultiplier *= 0.5;
    }

    // Calculate sets per primary pattern per week (with build-up)
    const numPrimaryPatterns = mesocycle.primaryPatterns.length;
    const setsPerPrimaryPatternPerWeek = Math.round(
      (mesocycle.targetSetsPerWeek / numPrimaryPatterns) * setsMultiplier
    );

    // Calculate sets per primary pattern per session
    const setsPerPrimaryPatternPerSession = Math.floor(
      setsPerPrimaryPatternPerWeek / mesocycle.sessionsPerWeek
    );

    // Get all patterns
    const allPatterns = await ctx.db.query("patterns").order("asc").collect();

    // Build template: primary patterns first, then maintenance patterns
    const template: Array<{
      patternId: Id<"patterns">;
      patternName: string;
      sets: number;
      isPrimary: boolean;
    }> = [];

    // Add primary patterns
    for (const patternId of mesocycle.primaryPatterns) {
      const pattern = allPatterns.find((p) => p._id === patternId);
      if (pattern) {
        template.push({
          patternId,
          patternName: pattern.displayName,
          sets: setsPerPrimaryPatternPerSession,
          isPrimary: true,
        });
      }
    }

    // Add maintenance patterns (all other patterns)
    const maintenancePatterns = allPatterns.filter(
      (p) => !mesocycle.primaryPatterns.includes(p._id)
    );
    // Maintenance patterns get 1-2 sets per session (simplified for now)
    for (const pattern of maintenancePatterns) {
      template.push({
        patternId: pattern._id,
        patternName: pattern.displayName,
        sets: 1, // Maintenance sets
        isPrimary: false,
      });
    }

    return {
      template,
      currentWeek,
      setsPerPrimaryPatternPerSession,
      totalSetsPerSession: template.reduce((sum, item) => sum + item.sets, 0),
      isDeloadWeek,
    };
  },
});

/**
 * Create a new workout
 */
export const createWorkout = mutation({
  args: {
    userId: v.string(),
    mesocycleId: v.id("mesocycles"),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workoutId = await ctx.db.insert("workouts", {
      userId: args.userId,
      mesocycleId: args.mesocycleId,
      date: now,
      weekNumber: args.weekNumber,
      completed: false,
      startedAt: now,
    });

    return workoutId;
  },
});

/**
 * Complete a workout
 */
export const completeWorkout = mutation({
  args: {
    workoutId: v.id("workouts"),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId);
    if (!workout) {
      throw new Error("Workout not found");
    }

    await ctx.db.patch(args.workoutId, {
      completed: true,
      completedAt: Date.now(),
    });

    return args.workoutId;
  },
});

/**
 * Delete a workout
 */
export const deleteWorkout = mutation({
  args: {
    workoutId: v.id("workouts"),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId);
    if (!workout) {
      throw new Error("Workout not found");
    }

    await ctx.db.delete(args.workoutId);
    return args.workoutId;
  },
});
