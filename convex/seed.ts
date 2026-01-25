import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the database with movement patterns
 * Run with: npx convex run seed:seedPatterns
 */
export const seedPatterns = mutation({
  handler: async (ctx) => {
    const patterns = [
      { name: "push", displayName: "Push", order: 1, description: "Chest, shoulders, triceps" },
      { name: "pull", displayName: "Pull", order: 2, description: "Back, biceps, rear delts" },
      { name: "squat", displayName: "Squat", order: 3, description: "Quad-dominant leg movements" },
      { name: "hinge", displayName: "Hinge", order: 4, description: "Hip-dominant posterior chain" },
      { name: "lunge", displayName: "Lunge", order: 5, description: "Unilateral leg movements" },
      { name: "twist", displayName: "Twist", order: 6, description: "Rotational core movements" },
    ];

    const patternIds: Record<string, string> = {};

    for (const pattern of patterns) {
      // Check if pattern already exists
      const existing = await ctx.db
        .query("patterns")
        .withIndex("name", (q) => q.eq("name", pattern.name))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("patterns", pattern);
        patternIds[pattern.name] = id;
        console.log(`Created pattern: ${pattern.displayName}`);
      } else {
        patternIds[pattern.name] = existing._id;
        console.log(`Pattern already exists: ${pattern.displayName}`);
      }
    }

    return patternIds;
  },
});

/**
 * Seed the database with placeholder exercises
 * Run with: npx convex run seed:seedExercises
 */
export const seedExercises = mutation({
  handler: async (ctx) => {
    // First, get all patterns
    const patterns = await ctx.db.query("patterns").collect();
    const patternMap = new Map(patterns.map((p) => [p.name, p._id]));

    const exercises = [
      // Push exercises
      { pattern: "push", name: "Bench Press" },
      { pattern: "push", name: "Incline Bench Press" },
      { pattern: "push", name: "Push-ups" },
      { pattern: "push", name: "Dumbbell Press" },
      { pattern: "push", name: "Pec Deck" },

      // Pull exercises
      { pattern: "pull", name: "Pull-ups" },
      { pattern: "pull", name: "Barbell Row" },
      { pattern: "pull", name: "Lat Pulldown" },
      { pattern: "pull", name: "Cable Row" },
      { pattern: "pull", name: "Face Pulls" },

      // Squat exercises
      { pattern: "squat", name: "Back Squat" },
      { pattern: "squat", name: "Front Squat" },
      { pattern: "squat", name: "Goblet Squat" },
      { pattern: "squat", name: "Leg Press" },

      // Hinge exercises
      { pattern: "hinge", name: "Deadlift" },
      { pattern: "hinge", name: "Romanian Deadlift" },
      { pattern: "hinge", name: "Good Mornings" },
      { pattern: "hinge", name: "Hip Thrusts" },

      // Lunge exercises
      { pattern: "lunge", name: "Forward Lunge" },
      { pattern: "lunge", name: "Reverse Lunge" },
      { pattern: "lunge", name: "Bulgarian Split Squat" },
      { pattern: "lunge", name: "Walking Lunges" },

      // Twist exercises
      { pattern: "twist", name: "Cable Woodchops" },
      { pattern: "twist", name: "Russian Twists" },
      { pattern: "twist", name: "Pallof Press" },
    ];

    let created = 0;
    let skipped = 0;

    for (const exercise of exercises) {
      const patternId = patternMap.get(exercise.pattern);
      if (!patternId) {
        console.error(`Pattern not found: ${exercise.pattern}`);
        continue;
      }

      // Check if exercise already exists
      const existing = await ctx.db
        .query("exercises")
        .withIndex("patternId_name", (q) =>
          q.eq("patternId", patternId).eq("name", exercise.name)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("exercises", {
          name: exercise.name,
          patternId,
        });
        created++;
        console.log(`Created exercise: ${exercise.name} (${exercise.pattern})`);
      } else {
        skipped++;
        console.log(`Exercise already exists: ${exercise.name}`);
      }
    }

    return { created, skipped, total: exercises.length };
  },
});

/**
 * Seed everything in one go
 * Run with: npx convex run seed:seedAll
 */
export const seedAll = mutation({
  handler: async (ctx) => {
    console.log("Seeding patterns...");
    
    // Seed patterns
    const patterns = [
      { name: "push", displayName: "Push", order: 1, description: "Chest, shoulders, triceps" },
      { name: "pull", displayName: "Pull", order: 2, description: "Back, biceps, rear delts" },
      { name: "squat", displayName: "Squat", order: 3, description: "Quad-dominant leg movements" },
      { name: "hinge", displayName: "Hinge", order: 4, description: "Hip-dominant posterior chain" },
      { name: "lunge", displayName: "Lunge", order: 5, description: "Unilateral leg movements" },
      { name: "twist", displayName: "Twist", order: 6, description: "Rotational core movements" },
    ];

    const patternIds: Record<string, any> = {};
    let patternsCreated = 0;

    for (const pattern of patterns) {
      const existing = await ctx.db
        .query("patterns")
        .withIndex("name", (q) => q.eq("name", pattern.name))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("patterns", pattern);
        patternIds[pattern.name] = id;
        patternsCreated++;
        console.log(`Created pattern: ${pattern.displayName}`);
      } else {
        patternIds[pattern.name] = existing._id;
        console.log(`Pattern already exists: ${pattern.displayName}`);
      }
    }

    console.log("Seeding exercises...");
    
    // Seed exercises
    const patternMap = new Map(
      Object.entries(patternIds).map(([name, id]) => [name, id])
    );

    const exercises = [
      { pattern: "push", name: "Bench Press" },
      { pattern: "push", name: "Incline Bench Press" },
      { pattern: "push", name: "Push-ups" },
      { pattern: "push", name: "Dumbbell Press" },
      { pattern: "push", name: "Pec Deck" },
      { pattern: "pull", name: "Pull-ups" },
      { pattern: "pull", name: "Barbell Row" },
      { pattern: "pull", name: "Lat Pulldown" },
      { pattern: "pull", name: "Cable Row" },
      { pattern: "pull", name: "Face Pulls" },
      { pattern: "squat", name: "Back Squat" },
      { pattern: "squat", name: "Front Squat" },
      { pattern: "squat", name: "Goblet Squat" },
      { pattern: "squat", name: "Leg Press" },
      { pattern: "hinge", name: "Deadlift" },
      { pattern: "hinge", name: "Romanian Deadlift" },
      { pattern: "hinge", name: "Good Mornings" },
      { pattern: "hinge", name: "Hip Thrusts" },
      { pattern: "lunge", name: "Forward Lunge" },
      { pattern: "lunge", name: "Reverse Lunge" },
      { pattern: "lunge", name: "Bulgarian Split Squat" },
      { pattern: "lunge", name: "Walking Lunges" },
      { pattern: "twist", name: "Cable Woodchops" },
      { pattern: "twist", name: "Russian Twists" },
      { pattern: "twist", name: "Pallof Press" },
    ];

    let exercisesCreated = 0;
    let exercisesSkipped = 0;

    for (const exercise of exercises) {
      const patternId = patternMap.get(exercise.pattern);
      if (!patternId) {
        console.error(`Pattern not found: ${exercise.pattern}`);
        continue;
      }

      const existing = await ctx.db
        .query("exercises")
        .withIndex("patternId_name", (q) =>
          q.eq("patternId", patternId as any).eq("name", exercise.name)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("exercises", {
          name: exercise.name,
          patternId: patternId as any,
        });
        exercisesCreated++;
        console.log(`Created exercise: ${exercise.name} (${exercise.pattern})`);
      } else {
        exercisesSkipped++;
        console.log(`Exercise already exists: ${exercise.name}`);
      }
    }

    return {
      patterns: { created: patternsCreated, total: patterns.length },
      exercises: { created: exercisesCreated, skipped: exercisesSkipped, total: exercises.length },
    };
  },
});
