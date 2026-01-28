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
    // Get ALL workouts for user (including active ones) to see most recent sets
    const workouts = await ctx.db
      .query('workouts')
      .withIndex('userId_date', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()

    // Find the most recent set for this exercise (including from active workouts)
    // Order by endTime descending to get the absolute most recent set
    let lastSet = null
    let mostRecentEndTime = 0

    for (const workout of workouts) {
      const sets = await ctx.db
        .query('sets')
        .withIndex('exerciseId', (q) => q.eq('exerciseId', args.exerciseId))
        .filter((q) => q.eq(q.field('workoutId'), workout._id))
        .collect()

      // Find the most recent set by endTime
      for (const set of sets) {
        if (set.endTime > mostRecentEndTime) {
          mostRecentEndTime = set.endTime
          lastSet = set
        }
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

    // Verify workout belongs to user
    const workout = await ctx.db.get(lastSet.workoutId)
    if (!workout || workout.userId !== args.userId) {
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
