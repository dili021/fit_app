import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { mutation, query } from './_generated/server'
import {
  buildCurrentWeekTemplate,
  buildWeek1Template,
  calculateSetsMultiplier,
} from './workoutTemplateHelpers'

/**
 * Get recent workouts for a user (last N workouts)
 */
export const getRecentWorkouts = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 3
    return await ctx.db
      .query('workouts')
      .withIndex('userId_date', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit)
  },
})

/**
 * Get all workouts for a user (chronological, completed only)
 * @deprecated Use getAllWorkoutsPaginated for pagination support
 */
export const getAllWorkouts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workouts')
      .withIndex('userId_date', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('completed'), true))
      .order('desc')
      .collect()
  },
})

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
      .query('workouts')
      .withIndex('userId_date', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('completed'), true))
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

/**
 * Get workouts for a mesocycle
 */
export const getWorkoutsByMesocycle = query({
  args: { mesocycleId: v.id('mesocycles') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workouts')
      .withIndex('mesocycleId', (q) => q.eq('mesocycleId', args.mesocycleId))
      .order('desc')
      .collect()
  },
})

/**
 * Get workout by ID
 */
export const getWorkoutById = query({
  args: { id: v.id('workouts') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Get active (incomplete) workout for a user
 */
export const getActiveWorkout = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query('workouts')
      .withIndex('userId_date', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()

    // Find the most recent incomplete workout
    return workouts.find((w) => !w.completed) || null
  },
})

/**
 * Generate workout template - calculates sets per pattern for a session
 */
export const generateWorkoutTemplate = query({
  args: {
    mesocycleId: v.id('mesocycles'),
  },
  handler: async (ctx, args) => {
    const mesocycle = await ctx.db.get(args.mesocycleId)
    if (!mesocycle) {
      throw new Error('Mesocycle not found')
    }

    // Mesocycle must be activated to generate workout template
    if (
      !mesocycle.startDate ||
      !mesocycle.targetSetsPerWeek ||
      !mesocycle.sessionsPerWeek
    ) {
      throw new Error('Mesocycle is not activated')
    }

    // TypeScript narrowing: these are guaranteed to be defined after the check above
    const startDate = mesocycle.startDate
    const targetSetsPerWeek = mesocycle.targetSetsPerWeek
    const sessionsPerWeek = mesocycle.sessionsPerWeek

    // Calculate current week
    const now = Date.now()
    const elapsed = now - startDate

    // Get all patterns (needed for both paths)
    const allPatterns = await ctx.db.query('patterns').order('asc').collect()

    // If mesocycle hasn't started yet, return week 1 template
    if (elapsed < 0) {
      const template = buildWeek1Template(
        mesocycle,
        allPatterns,
        targetSetsPerWeek,
        sessionsPerWeek,
      )

      const setsPerPrimaryPatternPerSession = Math.floor(
        Math.round(targetSetsPerWeek / mesocycle.primaryPatterns.length) /
          sessionsPerWeek,
      )

      return {
        template,
        currentWeek: 1,
        setsPerPrimaryPatternPerSession,
        totalSetsPerSession: template.reduce((sum, item) => sum + item.sets, 0),
        isDeloadWeek: false,
      }
    }

    // Calculate current week
    const weeksElapsed = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000))
    const currentWeek = Math.min(weeksElapsed + 1, mesocycle.durationWeeks)
    const isDeloadWeek = currentWeek === mesocycle.durationWeeks

    // Calculate sets multiplier
    const setsMultiplier = calculateSetsMultiplier(
      mesocycle.wasPreviouslyTraining ?? true,
      currentWeek,
      isDeloadWeek,
    )

    // Build template for current week
    const template = buildCurrentWeekTemplate({
      mesocycle,
      allPatterns,
      targetSetsPerWeek,
      sessionsPerWeek,
      setsMultiplier,
    })

    const numPrimaryPatterns = mesocycle.primaryPatterns.length
    const setsPerPrimaryPatternPerWeek = Math.round(
      (targetSetsPerWeek / numPrimaryPatterns) * setsMultiplier,
    )
    const setsPerPrimaryPatternPerSession = Math.floor(
      setsPerPrimaryPatternPerWeek / sessionsPerWeek,
    )

    return {
      template,
      currentWeek,
      setsPerPrimaryPatternPerSession,
      totalSetsPerSession: template.reduce((sum, item) => sum + item.sets, 0),
      isDeloadWeek,
    }
  },
})

/**
 * Create a new workout
 */
export const createWorkout = mutation({
  args: {
    userId: v.string(),
    mesocycleId: v.id('mesocycles'),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('workouts', {
      userId: args.userId,
      mesocycleId: args.mesocycleId,
      date: now,
      weekNumber: args.weekNumber,
      completed: false,
      startedAt: now,
    })
  },
})

/**
 * Complete a workout
 */
export const completeWorkout = mutation({
  args: {
    workoutId: v.id('workouts'),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId)
    if (!workout) {
      throw new Error('Workout not found')
    }

    await ctx.db.patch(args.workoutId, {
      completed: true,
      completedAt: Date.now(),
    })

    return args.workoutId
  },
})

/**
 * Delete a workout
 */
export const deleteWorkout = mutation({
  args: {
    workoutId: v.id('workouts'),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId)
    if (!workout) {
      throw new Error('Workout not found')
    }

    await ctx.db.delete(args.workoutId)
    return args.workoutId
  },
})
