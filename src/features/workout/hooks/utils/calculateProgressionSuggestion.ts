import type { Doc, Id } from '@db/_generated/dataModel'

interface ProgressionSuggestion {
  suggestedWeight: number | null
  lastWeight: number | null
  lastReps: number | null
  suggestion: 'increase' | 'decrease' | 'maintain' | null
  reason: string
}

/**
 * Calculate progression suggestion from current workout's sets
 * This provides immediate updates when sets are completed
 */
export function calculateProgressionSuggestion(
  workoutSets: Array<Doc<'sets'>> | undefined,
  selectedExerciseId: Id<'exercises'> | null,
): ProgressionSuggestion | null {
  if (!workoutSets || !selectedExerciseId) {
    return null
  }

  // Find the most recent set for this exercise in the current workout
  const exerciseSets = workoutSets
    .filter((set) => set.exerciseId === selectedExerciseId)
    .sort((a, b) => b.endTime - a.endTime)

  if (exerciseSets.length === 0) {
    return null
  }

  const lastSet = exerciseSets[0]

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
}
