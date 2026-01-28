import { usePaginatedQuery, useQuery } from 'convex/react'
import { api } from '@db/_generated/api'
import type { Id } from '@db/_generated/dataModel'

/**
 * Hook for fetching paginated workouts (for list view)
 */
export function useHistoryQueries(userId: string) {
  const {
    results: workouts,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.workouts.getAllWorkoutsPaginated,
    { userId },
    { initialNumItems: 10 },
  )

  const allWorkouts = useQuery(api.workouts.getAllWorkouts, { userId })
  const mesocycles = useQuery(api.mesocycles.getAllMesocycles, { userId })
  const patterns = useQuery(api.patterns.getAll)
  const exercises = useQuery(api.exercises.getAll)

  return {
    workouts,
    allWorkouts,
    mesocycles,
    patterns,
    exercises,
    status,
    loadMore,
    isLoadingMore: status === 'LoadingMore',
  }
}

/**
 * Hook for fetching sets for an expanded workout
 */
export function useExpandedWorkoutSets(expandedWorkout: Id<'workouts'> | null) {
  return useQuery(
    api.sets.getSetsForWorkout,
    expandedWorkout ? { workoutId: expandedWorkout } : 'skip',
  )
}

/**
 * Hook for fetching sets for selected date workouts
 */
export function useSelectedDateSets(workoutIds: Array<Id<'workouts'>>) {
  return useQuery(
    api.sets.getSetsForWorkouts,
    workoutIds.length > 0 ? { workoutIds } : 'skip',
  )
}
