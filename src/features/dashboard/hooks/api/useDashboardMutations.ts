import { useMutation } from 'convex/react'
import { api } from '@db/_generated/api'

export function useDashboardMutations() {
  const checkStatus = useMutation(api.mesocycles.checkAndUpdateMesocycleStatus)
  const createWorkout = useMutation(api.workouts.createWorkout)

  return { checkStatus, createWorkout }
}
