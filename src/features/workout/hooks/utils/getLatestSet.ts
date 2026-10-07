import type { Doc } from '@db/_generated/dataModel'

/**
 * Get the set logged most recently in a workout
 */
export function getLatestSet(
  workoutSets: Array<Doc<'sets'>> | undefined,
): Doc<'sets'> | null {
  if (!workoutSets || workoutSets.length === 0) {
    return null
  }

  return workoutSets.reduce((latest, set) =>
    set._creationTime > latest._creationTime ? set : latest,
  )
}
