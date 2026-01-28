import type { Doc, Id } from '@db/_generated/dataModel'

/**
 * Get the most recent set for an exercise from the current workout's sets
 * Returns null if no sets exist for this exercise in the current workout
 */
export function getLastSetFromWorkout(
  workoutSets: Array<Doc<'sets'>> | undefined,
  exerciseId: Id<'exercises'> | null,
): Doc<'sets'> | null {
  if (!workoutSets || !exerciseId) {
    return null
  }

  // Find the most recent set for this exercise in the current workout
  const exerciseSets = workoutSets
    .filter((set) => set.exerciseId === exerciseId)
    .sort((a, b) => b.endTime - a.endTime)

  return exerciseSets[0] ?? null
}
