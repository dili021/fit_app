import type { Id } from '../../../../convex/_generated/dataModel'

interface Set {
  _id: Id<'sets'>
  exerciseId: Id<'exercises'>
  patternId: Id<'patterns'>
  weight: number
  reps: number
  duration: number
  orderInWorkout: number
}

interface Exercise {
  _id: Id<'exercises'>
  name: string
}

interface Pattern {
  _id: Id<'patterns'>
  displayName: string
}

export interface GroupedByPattern {
  patternId: Id<'patterns'>
  patternName: string
  exercises: Record<
    Id<'exercises'>,
    {
      exerciseId: Id<'exercises'>
      exerciseName: string
      sets: Array<Set>
    }
  >
}

/**
 * Group sets by pattern, then by exercise
 */
export function groupSetsByPattern(
  sets: Array<Set>,
  exercises: Array<Exercise>,
  patterns: Array<Pattern>,
): Record<Id<'patterns'>, GroupedByPattern> {
  return sets.reduce(
    (acc, set) => {
      const exercise = exercises.find((e) => e._id === set.exerciseId)
      const pattern = patterns.find((p) => p._id === set.patternId)

      if (!exercise || !pattern) return acc

      if (!(set.patternId in acc)) {
        acc[set.patternId] = {
          patternId: set.patternId,
          patternName: pattern.displayName,
          exercises: {},
        }
      }

      if (!(set.exerciseId in acc[set.patternId].exercises)) {
        acc[set.patternId].exercises[set.exerciseId] = {
          exerciseId: set.exerciseId,
          exerciseName: exercise.name,
          sets: [],
        }
      }

      acc[set.patternId].exercises[set.exerciseId].sets.push(set)
      return acc
    },
    {} as Record<Id<'patterns'>, GroupedByPattern>,
  )
}
