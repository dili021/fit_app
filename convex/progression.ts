import { v } from 'convex/values'
import { query } from './_generated/server'

/**
 * Get suggested weight for an exercise based on last performance
 * Implements 8-12 rep range progression logic:
 * - If last reps ≥ 12 → suggest weight increase (+5 lbs / +2.5 kg)
 * - If last reps < 8 → suggest weight decrease (-5 lbs / -2.5 kg)
 * - If 8-12 → maintain weight (in hypertrophy sweet spot)
 */
export const getSuggestedWeight = query({
  args: {
    userId: v.string(),
    exerciseId: v.id('exercises'),
    patternId: v.id('patterns'),
  },
  handler: async (ctx, args) => {
    // Optimized: Query sets directly by exerciseId (indexed) instead of iterating through all workouts
    // This avoids reading thousands of workout documents
    // Get sets for this exercise (limit to 200 to avoid reading too many documents)
    const sets = await ctx.db
      .query('sets')
      .withIndex('exerciseId', (q) => q.eq('exerciseId', args.exerciseId))
      .take(200)

    // Find the most recent set that belongs to this user
    // Sort by endTime descending in memory since endTime is not part of the index
    let lastSet = null
    let mostRecentEndTime = 0

    for (const set of sets) {
      // Check if this set belongs to a workout owned by the user
      const workout = await ctx.db.get(set.workoutId)
      if (
        workout &&
        workout.userId === args.userId &&
        set.endTime > mostRecentEndTime
      ) {
        mostRecentEndTime = set.endTime
        lastSet = set
      }
    }

    if (!lastSet) {
      // No previous data - return null (no suggestion)
      return {
        suggestedWeight: null,
        lastWeight: null,
        lastReps: null,
        suggestion: null,
        reason: 'No previous data for this exercise',
      }
    }

    const lastWeight = lastSet.weight
    const lastReps = lastSet.reps

    // Progression logic based on 8-12 rep range
    let suggestedWeight: number | null = null
    let suggestion: 'increase' | 'decrease' | 'maintain' | null = null
    let reason = ''

    if (lastReps >= 12) {
      // Hit 12+ reps → increase weight
      // Increase by 2.5kg (or ~5 lbs)
      suggestedWeight = lastWeight + 2.5
      suggestion = 'increase'
      reason = `Last set: ${lastReps} reps @ ${lastWeight}kg. Increase to ${suggestedWeight}kg to stay in 8-12 rep range.`
    } else if (lastReps < 8) {
      // Can't hit 8 reps → decrease weight
      // Decrease by 2.5kg (or ~5 lbs)
      suggestedWeight = Math.max(0, lastWeight - 2.5)
      suggestion = 'decrease'
      reason = `Last set: ${lastReps} reps @ ${lastWeight}kg. Decrease to ${suggestedWeight}kg to stay in 8-12 rep range.`
    } else {
      // 8-12 reps → maintain (sweet spot)
      suggestedWeight = lastWeight
      suggestion = 'maintain'
      reason = `Last set: ${lastReps} reps @ ${lastWeight}kg. Maintain weight (in hypertrophy zone).`
    }

    return {
      suggestedWeight,
      lastWeight,
      lastReps,
      suggestion,
      reason,
    }
  },
})

/**
 * Get last set from last completed workout for an exercise
 * Used for progression suggestions when no sets exist in current workout
 */
export const getLastSetFromLastCompletedWorkout = query({
  args: {
    userId: v.string(),
    exerciseId: v.id('exercises'),
    excludeWorkoutId: v.optional(v.id('workouts')),
  },
  handler: async (ctx, args) => {
    // Get all completed workouts for user, ordered by date desc
    const workouts = await ctx.db
      .query('workouts')
      .withIndex('userId_date', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('completed'), true))
      .order('desc')
      .collect()

    // Find the most recent set for this exercise from completed workouts
    // Exclude the current workout if provided
    for (const workout of workouts) {
      // Skip if this is the workout we want to exclude (current active workout)
      if (args.excludeWorkoutId && workout._id === args.excludeWorkoutId) {
        continue
      }

      const sets = await ctx.db
        .query('sets')
        .withIndex('exerciseId', (q) => q.eq('exerciseId', args.exerciseId))
        .filter((q) => q.eq(q.field('workoutId'), workout._id))
        .order('desc')
        .first()

      if (sets) {
        return sets
      }
    }

    return null
  },
})

/**
 * Get last performance data for an exercise
 * Returns the most recent weight and reps for quick reference
 */
export const getLastPerformance = query({
  args: {
    userId: v.string(),
    exerciseId: v.id('exercises'),
  },
  handler: async (ctx, args) => {
    // Get all workouts for user
    const workouts = await ctx.db
      .query('workouts')
      .withIndex('userId_date', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('completed'), true))
      .order('desc')
      .collect()

    // Find the most recent set for this exercise
    for (const workout of workouts) {
      const sets = await ctx.db
        .query('sets')
        .withIndex('exerciseId', (q) => q.eq('exerciseId', args.exerciseId))
        .filter((q) => q.eq(q.field('workoutId'), workout._id))
        .order('desc')
        .first()

      if (sets) {
        return {
          weight: sets.weight,
          reps: sets.reps,
          date: workout.date,
        }
      }
    }

    return null
  },
})
