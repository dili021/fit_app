import { useQuery } from 'convex/react'
import { api } from '@db/_generated/api'
import type { Id } from '@db/_generated/dataModel'

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
