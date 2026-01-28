import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

export function useSetQueries(
  exerciseId: Id<'exercises'>,
  userId: string,
  patternId: Id<'patterns'>,
) {
  const lastSet = useQuery(api.sets.getLastSetForExercise, {
    exerciseId,
    userId,
  })
  const suggestedWeight = useQuery(api.progression.getSuggestedWeight, {
    userId,
    exerciseId,
    patternId,
  })

  return { lastSet, suggestedWeight }
}
