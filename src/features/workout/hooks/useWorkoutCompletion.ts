import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '../../../../convex/_generated/api'
import type { Doc, Id } from '../../../../convex/_generated/dataModel'

interface UseWorkoutCompletionProps {
  currentWorkout: Doc<'workouts'> | null | undefined
  workoutSets: Array<Doc<'sets'>> | undefined
  workoutTemplate:
    | { template: Array<{ patternId: Id<'patterns'>; sets: number }> }
    | null
    | undefined
}

/**
 * Hook for managing workout completion logic
 */
export function useWorkoutCompletion({
  currentWorkout,
  workoutSets,
  workoutTemplate,
}: UseWorkoutCompletionProps) {
  const navigate = useNavigate()
  const [showWorkoutOverview, setShowWorkoutOverview] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const completeWorkout = useMutation(api.workouts.completeWorkout)
  const deleteWorkout = useMutation(api.workouts.deleteWorkout)

  // Calculate if all sets are completed for the workout
  const allSetsCompleted =
    workoutSets && workoutTemplate
      ? (() => {
          for (const pattern of workoutTemplate.template) {
            const patternSets = workoutSets.filter(
              (s) => s.patternId === pattern.patternId,
            )
            if (patternSets.length < pattern.sets) {
              return false
            }
          }
          return true
        })()
      : false

  // Show overview when all sets are completed (only once)
  useEffect(() => {
    if (
      allSetsCompleted &&
      workoutSets &&
      workoutSets.length > 0 &&
      !showWorkoutOverview
    ) {
      // Small delay to ensure all data is loaded
      const timer = setTimeout(() => {
        setShowWorkoutOverview(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [allSetsCompleted, workoutSets, showWorkoutOverview])

  const concludeWorkout = async () => {
    if (!currentWorkout) return

    try {
      // Check if there are any sets completed
      const hasSets = workoutSets && workoutSets.length > 0

      if (!hasSets) {
        // Delete the workout if no sets were completed
        await deleteWorkout({ workoutId: currentWorkout._id })
      } else {
        // Complete the workout if sets were completed
        await completeWorkout({ workoutId: currentWorkout._id })
      }

      void navigate({ to: '/' })
    } catch {
      alert('Failed to conclude workout. Please try again.')
    }
  }

  const handleConcludeSession = () => {
    // Only show confirmation if not all sets are completed
    if (!allSetsCompleted) {
      setShowConfirmDialog(true)
      return
    }

    // If all sets completed, conclude directly
    void concludeWorkout()
  }

  const handleCompleteWorkoutFromOverview = async () => {
    if (!currentWorkout) return

    try {
      await completeWorkout({ workoutId: currentWorkout._id })
      void navigate({ to: '/' })
    } catch {
      alert('Failed to complete workout. Please try again.')
    }
  }

  return {
    allSetsCompleted,
    showWorkoutOverview,
    showConfirmDialog,
    setShowConfirmDialog,
    concludeWorkout,
    handleConcludeSession,
    handleCompleteWorkoutFromOverview,
  }
}
