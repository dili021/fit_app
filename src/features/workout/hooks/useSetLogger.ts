import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@db/_generated/api'
import { useSetQueries } from './api/useSetQueries'
import { useSetMutations } from './api/useSetMutations'
import { useWorkoutTimer } from './useWorkoutTimer'
import { useRestTimer } from './useRestTimer'
import { useNotificationPermission } from './useNotificationPermission'
import { calculateProgressionSuggestion } from './utils/calculateProgressionSuggestion'
import { getLastSetFromWorkout } from './utils/getLastSetFromWorkout'
import type { Doc, Id } from '@db/_generated/dataModel'

interface UseSetLoggerOptions {
  workoutId: Id<'workouts'>
  patternId: Id<'patterns'>
  exerciseId: Id<'exercises'>
  userId: string
  workoutSets: Array<Doc<'sets'>> | undefined
  setNumber: number
  restTimeMinutes: number
  onSetComplete: () => void
  onTimerStart?: () => void
  onTimerUpdate?: (seconds: number) => void
  onTimerReset?: () => void
  onRestTimerStart?: (seconds: number) => void
  onRestTimerUpdate?: (seconds: number) => void
  onRestTimerComplete?: () => void
  restTimerStopped?: boolean
}

export function useSetLogger({
  workoutId,
  patternId,
  exerciseId,
  userId,
  workoutSets,
  setNumber,
  restTimeMinutes,
  onSetComplete,
  onTimerStart,
  onTimerUpdate,
  onTimerReset,
  onRestTimerStart,
  onRestTimerUpdate,
  onRestTimerComplete,
  restTimerStopped = false,
}: UseSetLoggerOptions) {
  const [weight, setWeight] = useState<string>('')
  const [reps, setReps] = useState<string>('')

  // Convex queries (for fallback when no sets in current workout)
  const { lastSet: fallbackLastSet } = useSetQueries(
    exerciseId,
    userId,
    patternId,
  )

  // Get last set from last completed workout (for fallback)
  const lastCompletedWorkoutSet = useQuery(
    api.progression.getLastSetFromLastCompletedWorkout,
    exerciseId && workoutId
      ? {
          userId,
          exerciseId,
          excludeWorkoutId: workoutId,
        }
      : 'skip',
  )

  // Get last set from current workout first (most up-to-date)
  // Fall back to last completed workout's set, then historical query
  const lastSet = useMemo(() => {
    const currentWorkoutLastSet = getLastSetFromWorkout(workoutSets, exerciseId)
    if (currentWorkoutLastSet) {
      return currentWorkoutLastSet
    }
    if (lastCompletedWorkoutSet) {
      return lastCompletedWorkoutSet
    }
    return fallbackLastSet ?? null
  }, [workoutSets, exerciseId, lastCompletedWorkoutSet, fallbackLastSet])

  // Calculate suggestion from current workout's sets first (immediate updates)
  // Fall back to last completed workout's set if no sets in current workout
  const suggestedWeight = useMemo(() => {
    // First priority: current workout's last set for this exercise
    const currentWorkoutSuggestion = calculateProgressionSuggestion(
      workoutSets,
      exerciseId,
    )

    if (currentWorkoutSuggestion) {
      return currentWorkoutSuggestion
    }

    // Second priority: last completed workout's last set for this exercise
    if (lastCompletedWorkoutSet) {
      return calculateProgressionSuggestion(
        [lastCompletedWorkoutSet],
        exerciseId,
      )
    }

    return null
  }, [workoutSets, exerciseId, lastCompletedWorkoutSet])
  const { createSet } = useSetMutations()

  // Notification permission
  useNotificationPermission()

  // Timers
  const timer = useWorkoutTimer({
    onUpdate: onTimerUpdate,
    onStart: onTimerStart,
    onReset: onTimerReset,
  })

  const restTimer = useRestTimer({
    restTimeMinutes,
    onStart: onRestTimerStart,
    onUpdate: onRestTimerUpdate,
    onComplete: () => {
      // Stop workout timer when rest completes
      timer.resetTimer()
      onRestTimerComplete?.()
    },
    stopped: restTimerStopped,
  })

  // Stop workout timer when rest timer is stopped externally
  useEffect(() => {
    if (restTimerStopped && restTimer.restSecondsRemaining !== null) {
      timer.resetTimer()
    }
  }, [restTimerStopped, restTimer.restSecondsRemaining, timer])

  // Load last weight/reps when exercise changes
  useEffect(() => {
    if (lastSet) {
      setWeight(lastSet.weight.toString())
      setReps(lastSet.reps.toString())
    } else {
      setWeight('')
      setReps('')
    }
  }, [lastSet, exerciseId])

  const handleStartTimer = () => {
    timer.startTimer()
  }

  const handleCompleteSet = async () => {
    if (!weight || !reps) return

    const endTime = Date.now()
    const startTime = timer.startTime || endTime
    const duration = Math.floor((endTime - startTime) / 1000)

    try {
      await createSet({
        workoutId,
        patternId,
        exerciseId,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        orderInWorkout: setNumber,
        startTime,
        endTime,
        duration,
      })

      // Reset timer state FIRST (before starting rest)
      timer.resetTimer()

      // Start rest timer
      restTimer.startRest()

      // Call completion callback
      onSetComplete()
    } catch {
      alert('Failed to save set. Please try again.')
    }
  }

  const canComplete = weight && reps

  return {
    weight,
    setWeight,
    reps,
    setReps,
    lastSet,
    suggestedWeight,
    isTimerRunning: timer.isTimerRunning,
    restSecondsRemaining: restTimer.restSecondsRemaining,
    canComplete,
    handleStartTimer,
    handleCompleteSet,
  }
}
