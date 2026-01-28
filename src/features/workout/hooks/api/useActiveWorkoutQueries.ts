import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@db/_generated/api'
import { calculateProgressionSuggestion } from '../utils/calculateProgressionSuggestion'
import type { Doc, Id } from '@db/_generated/dataModel'

interface UseActiveWorkoutQueriesProps {
  userId: string
  workoutId?: string
  currentWorkout: Doc<'workouts'> | null | undefined
  selectedExerciseId: Id<'exercises'> | null
}

/**
 * Hook for fetching all data needed for active workout
 */
export function useActiveWorkoutQueries({
  userId,
  workoutId,
  currentWorkout,
  selectedExerciseId,
}: UseActiveWorkoutQueriesProps) {
  const activeWorkout = useQuery(api.workouts.getActiveWorkout, { userId })
  const workout = useQuery(
    api.workouts.getWorkoutById,
    workoutId ? { id: workoutId as Id<'workouts'> } : 'skip',
  )

  const mesocycle = useQuery(
    api.mesocycles.getMesocycleById,
    currentWorkout?.mesocycleId ? { id: currentWorkout.mesocycleId } : 'skip',
  )

  const workoutTemplateQuery = useQuery(
    api.workouts.generateWorkoutTemplate,
    mesocycle ? { mesocycleId: mesocycle._id } : 'skip',
  )

  const exercises = useQuery(api.exercises.getAll, {})
  const patterns = useQuery(api.patterns.getAll, {})

  const workoutSets = useQuery(
    api.sets.getSetsForWorkout,
    currentWorkout ? { workoutId: currentWorkout._id } : 'skip',
  )

  // Get last set from last completed workout (for fallback when no sets in current workout)
  const lastCompletedWorkoutSet = useQuery(
    api.progression.getLastSetFromLastCompletedWorkout,
    selectedExerciseId && currentWorkout
      ? {
          userId,
          exerciseId: selectedExerciseId,
          excludeWorkoutId: currentWorkout._id,
        }
      : 'skip',
  )

  // Calculate suggestion from current workout's sets first (immediate updates)
  // Fall back to last completed workout's set if no sets in current workout
  const progressionSuggestion = useMemo(() => {
    // First priority: current workout's last set for this exercise
    const currentWorkoutSuggestion = calculateProgressionSuggestion(
      workoutSets,
      selectedExerciseId,
    )

    if (currentWorkoutSuggestion) {
      return currentWorkoutSuggestion
    }

    // Second priority: last completed workout's last set for this exercise
    if (lastCompletedWorkoutSet) {
      return calculateProgressionSuggestion(
        [lastCompletedWorkoutSet],
        selectedExerciseId,
      )
    }

    return null
  }, [workoutSets, selectedExerciseId, lastCompletedWorkoutSet])

  return {
    activeWorkout,
    workout,
    mesocycle,
    workoutTemplate: workoutTemplateQuery,
    exercises,
    patterns,
    workoutSets,
    progressionSuggestion,
  }
}
