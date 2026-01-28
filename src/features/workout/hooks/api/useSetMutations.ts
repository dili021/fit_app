import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

export function useSetMutations() {
  const createSet = useMutation(api.sets.createSet)

  return { createSet }
}
