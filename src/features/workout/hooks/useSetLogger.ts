import { useEffect, useState } from 'react'
import { useSetQueries } from './api/useSetQueries'
import { useSetMutations } from './api/useSetMutations'
import { useWorkoutTimer } from './useWorkoutTimer'
import { useRestTimer } from './useRestTimer'
import { useNotificationPermission } from './useNotificationPermission'
import type { Id } from '../../../../convex/_generated/dataModel'

interface UseSetLoggerOptions {
  workoutId: Id<'workouts'>
  patternId: Id<'patterns'>
  exerciseId: Id<'exercises'>
  userId: string
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

  // Convex queries
  const { lastSet, suggestedWeight } = useSetQueries(
    exerciseId,
    userId,
    patternId,
  )
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
