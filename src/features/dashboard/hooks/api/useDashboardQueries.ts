import { useQuery } from 'convex/react'
import { api } from '@db/_generated/api'

export function useDashboardQueries(userId: string) {
  const activeMesocycle = useQuery(api.mesocycles.getActiveMesocycle, {
    userId,
  })
  const activeWorkout = useQuery(api.workouts.getActiveWorkout, { userId })
  const recentWorkouts = useQuery(api.workouts.getRecentWorkouts, {
    userId,
    limit: 3,
  })
  const patterns = useQuery(api.patterns.getAll)

  const mesocycleSets = useQuery(
    api.sets.getSetsForMesocycle,
    activeMesocycle ? { mesocycleId: activeMesocycle._id } : 'skip',
  )

  const mesocycleStatusInfo = useQuery(
    api.mesocycles.getMesocycleStatusInfo,
    activeMesocycle ? { mesocycleId: activeMesocycle._id } : 'skip',
  )

  const workoutTemplate = useQuery(
    api.workouts.generateWorkoutTemplate,
    activeMesocycle ? { mesocycleId: activeMesocycle._id } : 'skip',
  )

  return {
    activeMesocycle,
    activeWorkout,
    recentWorkouts,
    patterns,
    mesocycleSets,
    mesocycleStatusInfo,
    workoutTemplate,
  }
}
