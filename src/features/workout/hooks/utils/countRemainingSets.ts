import type { Doc, Id } from '@db/_generated/dataModel'

/**
 * Count the sets the workout template still expects.
 * Extra sets logged on one pattern don't make up for another.
 */
export function countRemainingSets(
  template: Array<{ patternId: Id<'patterns'>; sets: number }>,
  workoutSets: Array<Doc<'sets'>>,
): number {
  return template.reduce((remaining, pattern) => {
    const logged = workoutSets.filter(
      (s) => s.patternId === pattern.patternId,
    ).length
    return remaining + Math.max(0, pattern.sets - logged)
  }, 0)
}
