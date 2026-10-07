import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@db/_generated/api'
import { countRemainingSets } from './utils/countRemainingSets'
import type { Doc, Id } from '@db/_generated/dataModel'

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  // null until the workout data has loaded
  const [openedWithSetsLeft, setOpenedWithSetsLeft] = useState<boolean | null>(
    null,
  )
  const [summaryRequested, setSummaryRequested] = useState(false)

  const completeWorkout = useMutation(api.workouts.completeWorkout)
  const deleteWorkout = useMutation(api.workouts.deleteWorkout)

  const remainingSets =
    workoutSets && workoutTemplate
      ? countRemainingSets(workoutTemplate.template, workoutSets)
      : null
  const allSetsCompleted = remainingSets === 0
  const hasSets = !!workoutSets && workoutSets.length > 0

  useEffect(() => {
    if (openedWithSetsLeft === null && remainingSets !== null) {
      setOpenedWithSetsLeft(remainingSets > 0)
    }
  }, [openedWithSetsLeft, remainingSets])

  // A workout reopened with every set logged goes straight to the summary.
  // One finished on this screen waits for the user to ask for it.
  const finishedThisSession = openedWithSetsLeft === true
  const awaitingSummary =
    allSetsCompleted && hasSets && finishedThisSession && !summaryRequested
  const showWorkoutOverview =
    allSetsCompleted &&
    hasSets &&
    (openedWithSetsLeft === false || summaryRequested)

  const concludeWorkout = async () => {
    if (!currentWorkout) return

    try {
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
    remainingSets,
    awaitingSummary,
    viewSummary: () => setSummaryRequested(true),
    showWorkoutOverview,
    showConfirmDialog,
    setShowConfirmDialog,
    concludeWorkout,
    handleConcludeSession,
    handleCompleteWorkoutFromOverview,
  }
}
