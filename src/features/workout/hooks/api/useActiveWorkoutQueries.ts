import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Doc, Id } from '../../../../../convex/_generated/dataModel'

interface UseActiveWorkoutQueriesProps {
  userId: string
  workoutId?: string
  currentWorkout: Doc<'workouts'> | null | undefined
  workoutTemplate:
    | { template: Array<{ patternId: Id<'patterns'> }> }
    | null
    | undefined
  currentPatternIndex: number
  selectedExerciseId: Id<'exercises'> | null
}

/**
 * Hook for fetching all data needed for active workout
 */
export function useActiveWorkoutQueries({
  userId,
  workoutId,
  currentWorkout,
  workoutTemplate,
  currentPatternIndex,
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

  const progressionSuggestion = useQuery(
    api.progression.getSuggestedWeight,
    workoutTemplate &&
      selectedExerciseId &&
      workoutTemplate.template[currentPatternIndex]
      ? {
          userId,
          exerciseId: selectedExerciseId,
          patternId: workoutTemplate.template[currentPatternIndex].patternId,
        }
      : 'skip',
  )

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
