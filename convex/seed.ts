/* eslint-disable max-lines */
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import {
  buildExerciseMap,
  createMesocycle1,
  createMesocycle2,
  createMesocycle3,
  validatePatterns,
} from './seedMesocycleHelpers'
import {
  createMesocycle1Workouts,
  createMesocycle2Workouts,
  createMesocycle3Workouts,
} from './seedWorkoutCreationHelpers'
import { setupSeedManyWorkoutsData } from './seedManyWorkoutsSetupHelpers'
import { createManyWorkouts } from './seedManyWorkoutsHelpers'
import type { Id } from './_generated/dataModel'

/**
 * Get all user IDs (for seeding purposes)
 */
export const getUserIds = query({
  handler: async (ctx) => {
    // Get unique user IDs from mesocycles
    const mesocycles = await ctx.db.query('mesocycles').collect()
    return [...new Set(mesocycles.map((m) => m.userId))]
  },
})

/**
 * Seed the database with movement patterns
 * Run with: npx convex run seed:seedPatterns
 */
export const seedPatterns = mutation({
  handler: async (ctx) => {
    const patterns = [
      {
        name: 'push',
        displayName: 'Push',
        order: 1,
        description: 'Chest, shoulders, triceps',
      },
      {
        name: 'pull',
        displayName: 'Pull',
        order: 2,
        description: 'Back, biceps, rear delts',
      },
      {
        name: 'squat',
        displayName: 'Squat',
        order: 3,
        description: 'Quad-dominant leg movements',
      },
      {
        name: 'hinge',
        displayName: 'Hinge',
        order: 4,
        description: 'Hip-dominant posterior chain',
      },
      {
        name: 'lunge',
        displayName: 'Lunge',
        order: 5,
        description: 'Unilateral leg movements',
      },
      {
        name: 'twist',
        displayName: 'Twist',
        order: 6,
        description: 'Rotational core movements',
      },
    ]

    const patternIds: Record<string, string> = {}

    for (const pattern of patterns) {
      // Check if pattern already exists
      const existing = await ctx.db
        .query('patterns')
        .withIndex('name', (q) => q.eq('name', pattern.name))
        .first()

      if (!existing) {
        const id = await ctx.db.insert('patterns', pattern)
        patternIds[pattern.name] = id
        console.log(`Created pattern: ${pattern.displayName}`)
      } else {
        patternIds[pattern.name] = existing._id
        console.log(`Pattern already exists: ${pattern.displayName}`)
      }
    }

    return patternIds
  },
})

/**
 * Seed the database with placeholder exercises
 * Run with: npx convex run seed:seedExercises
 */
export const seedExercises = mutation({
  handler: async (ctx) => {
    // First, get all patterns
    const patterns = await ctx.db.query('patterns').collect()
    const patternMap = new Map(patterns.map((p) => [p.name, p._id]))

    const exercises = [
      // Push exercises
      { pattern: 'push', name: 'Bench Press' },
      { pattern: 'push', name: 'Incline Bench Press' },
      { pattern: 'push', name: 'Push-ups' },
      { pattern: 'push', name: 'Dumbbell Press' },
      { pattern: 'push', name: 'Pec Deck' },

      // Pull exercises
      { pattern: 'pull', name: 'Pull-ups' },
      { pattern: 'pull', name: 'Barbell Row' },
      { pattern: 'pull', name: 'Lat Pulldown' },
      { pattern: 'pull', name: 'Cable Row' },
      { pattern: 'pull', name: 'Face Pulls' },

      // Squat exercises
      { pattern: 'squat', name: 'Back Squat' },
      { pattern: 'squat', name: 'Front Squat' },
      { pattern: 'squat', name: 'Goblet Squat' },
      { pattern: 'squat', name: 'Leg Press' },

      // Hinge exercises
      { pattern: 'hinge', name: 'Deadlift' },
      { pattern: 'hinge', name: 'Romanian Deadlift' },
      { pattern: 'hinge', name: 'Good Mornings' },
      { pattern: 'hinge', name: 'Hip Thrusts' },

      // Lunge exercises
      { pattern: 'lunge', name: 'Forward Lunge' },
      { pattern: 'lunge', name: 'Reverse Lunge' },
      { pattern: 'lunge', name: 'Bulgarian Split Squat' },
      { pattern: 'lunge', name: 'Walking Lunges' },

      // Twist exercises
      { pattern: 'twist', name: 'Cable Woodchops' },
      { pattern: 'twist', name: 'Russian Twists' },
      { pattern: 'twist', name: 'Pallof Press' },
    ]

    let created = 0
    let skipped = 0

    for (const exercise of exercises) {
      const patternId = patternMap.get(exercise.pattern)
      if (!patternId) {
        console.error(`Pattern not found: ${exercise.pattern}`)
        continue
      }

      // Check if exercise already exists
      const existing = await ctx.db
        .query('exercises')
        .withIndex('patternId_name', (q) =>
          q.eq('patternId', patternId).eq('name', exercise.name),
        )
        .first()

      if (!existing) {
        await ctx.db.insert('exercises', {
          name: exercise.name,
          patternId,
        })
        created++
        console.log(`Created exercise: ${exercise.name} (${exercise.pattern})`)
      } else {
        skipped++
        console.log(`Exercise already exists: ${exercise.name}`)
      }
    }

    return { created, skipped, total: exercises.length }
  },
})

/**
 * Seed everything in one go
 * Run with: npx convex run seed:seedAll
 */
export const seedAll = mutation({
  handler: async (ctx) => {
    console.log('Seeding patterns...')

    // Seed patterns
    const patterns = [
      {
        name: 'push',
        displayName: 'Push',
        order: 1,
        description: 'Chest, shoulders, triceps',
      },
      {
        name: 'pull',
        displayName: 'Pull',
        order: 2,
        description: 'Back, biceps, rear delts',
      },
      {
        name: 'squat',
        displayName: 'Squat',
        order: 3,
        description: 'Quad-dominant leg movements',
      },
      {
        name: 'hinge',
        displayName: 'Hinge',
        order: 4,
        description: 'Hip-dominant posterior chain',
      },
      {
        name: 'lunge',
        displayName: 'Lunge',
        order: 5,
        description: 'Unilateral leg movements',
      },
      {
        name: 'twist',
        displayName: 'Twist',
        order: 6,
        description: 'Rotational core movements',
      },
    ]

    const patternIds: Record<string, Id<'patterns'>> = {}
    let patternsCreated = 0

    for (const pattern of patterns) {
      const existing = await ctx.db
        .query('patterns')
        .withIndex('name', (q) => q.eq('name', pattern.name))
        .first()

      if (!existing) {
        const id = await ctx.db.insert('patterns', pattern)
        patternIds[pattern.name] = id
        patternsCreated++
        console.log(`Created pattern: ${pattern.displayName}`)
      } else {
        patternIds[pattern.name] = existing._id
        console.log(`Pattern already exists: ${pattern.displayName}`)
      }
    }

    console.log('Seeding exercises...')

    // Seed exercises
    const patternMap = new Map(
      Object.entries(patternIds).map(([name, id]) => [name, id]),
    )

    const exercises = [
      { pattern: 'push', name: 'Bench Press' },
      { pattern: 'push', name: 'Incline Bench Press' },
      { pattern: 'push', name: 'Push-ups' },
      { pattern: 'push', name: 'Dumbbell Press' },
      { pattern: 'push', name: 'Pec Deck' },
      { pattern: 'pull', name: 'Pull-ups' },
      { pattern: 'pull', name: 'Barbell Row' },
      { pattern: 'pull', name: 'Lat Pulldown' },
      { pattern: 'pull', name: 'Cable Row' },
      { pattern: 'pull', name: 'Face Pulls' },
      { pattern: 'squat', name: 'Back Squat' },
      { pattern: 'squat', name: 'Front Squat' },
      { pattern: 'squat', name: 'Goblet Squat' },
      { pattern: 'squat', name: 'Leg Press' },
      { pattern: 'hinge', name: 'Deadlift' },
      { pattern: 'hinge', name: 'Romanian Deadlift' },
      { pattern: 'hinge', name: 'Good Mornings' },
      { pattern: 'hinge', name: 'Hip Thrusts' },
      { pattern: 'lunge', name: 'Forward Lunge' },
      { pattern: 'lunge', name: 'Reverse Lunge' },
      { pattern: 'lunge', name: 'Bulgarian Split Squat' },
      { pattern: 'lunge', name: 'Walking Lunges' },
      { pattern: 'twist', name: 'Cable Woodchops' },
      { pattern: 'twist', name: 'Russian Twists' },
      { pattern: 'twist', name: 'Pallof Press' },
    ]

    let exercisesCreated = 0
    let exercisesSkipped = 0

    for (const exercise of exercises) {
      const patternId = patternMap.get(exercise.pattern)
      if (!patternId) {
        console.error(`Pattern not found: ${exercise.pattern}`)
        continue
      }

      const existing = await ctx.db
        .query('exercises')
        .withIndex('patternId_name', (q) =>
          q.eq('patternId', patternId).eq('name', exercise.name),
        )
        .first()

      if (!existing) {
        await ctx.db.insert('exercises', {
          name: exercise.name,
          patternId: patternId,
        })
        exercisesCreated++
        console.log(`Created exercise: ${exercise.name} (${exercise.pattern})`)
      } else {
        exercisesSkipped++
        console.log(`Exercise already exists: ${exercise.name}`)
      }
    }

    return {
      patterns: { created: patternsCreated, total: patterns.length },
      exercises: {
        created: exercisesCreated,
        skipped: exercisesSkipped,
        total: exercises.length,
      },
    }
  },
})

/**
 * Clear all workout data for a user (sets, workouts, mesocycles)
 * Run with: npx convex run seed:clearUserData --args '{"userId": "your-user-id"}'
 */
export const clearUserData = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Delete all sets for user's workouts
    const workouts = await ctx.db
      .query('workouts')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()

    let setsDeleted = 0
    for (const workout of workouts) {
      const sets = await ctx.db
        .query('sets')
        .withIndex('workoutId', (q) => q.eq('workoutId', workout._id))
        .collect()

      for (const set of sets) {
        await ctx.db.delete(set._id)
        setsDeleted++
      }
    }

    // Delete all workouts
    let workoutsDeleted = 0
    for (const workout of workouts) {
      await ctx.db.delete(workout._id)
      workoutsDeleted++
    }

    // Delete all mesocycles
    const mesocycles = await ctx.db
      .query('mesocycles')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()

    let mesocyclesDeleted = 0
    for (const mesocycle of mesocycles) {
      await ctx.db.delete(mesocycle._id)
      mesocyclesDeleted++
    }

    return {
      setsDeleted,
      workoutsDeleted,
      mesocyclesDeleted,
    }
  },
})

/**
 * Seed realistic placeholder workout data for a user
 * Creates 2-3 mesocycles with completed workouts and sets
 * Run with: npx convex run seed:seedUserWorkoutData --args '{"userId": "your-user-id"}'
 */
export const seedUserWorkoutData = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get patterns and exercises
    const patterns = await ctx.db.query('patterns').collect()
    const exercises = await ctx.db.query('exercises').collect()

    if (patterns.length === 0 || exercises.length === 0) {
      throw new Error(
        'Patterns and exercises must be seeded first. Run seed:seedAll',
      )
    }

    const patternMap = new Map(patterns.map((p) => [p.name, p._id]))
    const { pushPatternId, pullPatternId, squatPatternId, hingePatternId } =
      validatePatterns(patternMap)
    const exerciseMap = buildExerciseMap(exercises, patterns)

    const now = Date.now()
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000
    const oneDayMs = 24 * 60 * 60 * 1000

    // Mesocycle 1: Push + Pull (6 weeks, completed)
    const meso1Start = now - 8 * oneWeekMs // Started 8 weeks ago
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meso1Id = await createMesocycle1(ctx as any, {
      userId: args.userId,
      meso1Start,
      pushPatternId,
      pullPatternId,
    })

    // Create workouts for mesocycle 1 (3 sessions/week for 6 weeks = 18 workouts)
    // Reduced to 2 weeks for faster seeding (6 workouts)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meso1Workouts = await createMesocycle1Workouts(ctx as any, {
      userId: args.userId,
      meso1Id,
      meso1Start,
      oneWeekMs,
      oneDayMs,
      exerciseMap,
      pushPatternId,
      pullPatternId,
    })

    // Mesocycle 2: Squat + Hinge (4 weeks, completed)
    const meso2Start = now - 4 * oneWeekMs // Started 4 weeks ago
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meso2Id = await createMesocycle2(ctx as any, {
      userId: args.userId,
      meso2Start,
      squatPatternId,
      hingePatternId,
    })

    // Create workouts for mesocycle 2 (2 sessions/week for 4 weeks = 8 workouts)
    // Reduced to 2 weeks for faster seeding (4 workouts)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await createMesocycle2Workouts(ctx as any, {
      userId: args.userId,
      meso2Id,
      meso2Start,
      oneWeekMs,
      oneDayMs,
      exerciseMap,
      squatPatternId,
      hingePatternId,
    })

    // Mesocycle 3: Push (6 weeks, active - in progress)
    const meso3Start = now - 2 * oneWeekMs // Started 2 weeks ago
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meso3Id = await createMesocycle3(ctx as any, {
      userId: args.userId,
      meso3Start,
      pushPatternId,
    })

    // Create workouts for mesocycle 3 (3 sessions/week, 2 weeks completed = 6 workouts)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await createMesocycle3Workouts(ctx as any, {
      userId: args.userId,
      meso3Id,
      meso3Start,
      oneWeekMs,
      oneDayMs,
      exerciseMap,
      pushPatternId,
    })

    return {
      mesocyclesCreated: 3,
      mesocycle1Id: meso1Id,
      mesocycle2Id: meso2Id,
      mesocycle3Id: meso3Id,
      workoutsCreated: meso1Workouts.length + 4 + 6,
    }
  },
})

/**
 * Seed many workouts for testing pagination (creates 50+ workouts)
 * Run with: npx convex run seed:seedManyWorkouts --args '{"userId": "your-user-id"}'
 */
export const seedManyWorkouts = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setupData = await setupSeedManyWorkoutsData(ctx as any)

    // Update mesocycle with correct userId
    await ctx.db.patch(setupData.mesoId, { userId: args.userId })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workoutsCreated = await createManyWorkouts(ctx as any, {
      userId: args.userId,
      mesoId: setupData.mesoId,
      mesoStart: setupData.mesoStart,
      oneWeekMs: setupData.oneWeekMs,
      oneDayMs: setupData.oneDayMs,
      exerciseMap: setupData.exerciseMap,
      pushPatternId: setupData.pushPatternId,
      pullPatternId: setupData.pullPatternId,
    })

    return {
      mesocycleId: setupData.mesoId,
      workoutsCreated,
    }
  },
})
