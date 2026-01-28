import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

export function useDashboardMutations() {
  const checkStatus = useMutation(api.mesocycles.checkAndUpdateMesocycleStatus)
  const createWorkout = useMutation(api.workouts.createWorkout)

  return { checkStatus, createWorkout }
}
