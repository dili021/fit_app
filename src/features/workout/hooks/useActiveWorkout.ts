import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@db/_generated/api'
import { useActiveWorkoutQueries } from './api/useActiveWorkoutQueries'
import { useSessionTimer } from './useSessionTimer'
import { usePatternProgress } from './usePatternProgress'
import { useWorkoutCompletion } from './useWorkoutCompletion'
import { usePatternNavigation } from './usePatternNavigation'
import type { Id } from '@db/_generated/dataModel'

interface UseActiveWorkoutProps {
  userId: string
  workoutId?: string
}

/**
 * Main hook for active workout functionality
 * Integrates all workout-related hooks and state
 */
export function useActiveWorkout({ userId, workoutId }: UseActiveWorkoutProps) {
  // State management
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0)
  const [selectedExerciseId, setSelectedExerciseId] =
    useState<Id<'exercises'> | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [showTimerOverlay, setShowTimerOverlay] = useState(false)
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<
    number | null
  >(null)
  const [restTimerStopped, setRestTimerStopped] = useState(false)

  // Fetch base workout data first
  const activeWorkout = useQuery(api.workouts.getActiveWorkout, { userId })
  const workout = useQuery(
    api.workouts.getWorkoutById,
    workoutId ? { id: workoutId as Id<'workouts'> } : 'skip',
  )

  const currentWorkout = workout || activeWorkout

  // Fetch dependent data
  const queries = useActiveWorkoutQueries({
    userId,
    workoutId,
    currentWorkout,
    selectedExerciseId,
  })

  // Pattern progress tracking
  const { completedSets, currentSetNumber } = usePatternProgress({
    workoutSets: queries.workoutSets,
    workoutTemplate: queries.workoutTemplate,
    currentPatternIndex,
  })

  // Workout completion logic
  const completion = useWorkoutCompletion({
    currentWorkout,
    workoutSets: queries.workoutSets,
    workoutTemplate: queries.workoutTemplate,
  })

  // Session timer
  const sessionElapsedSeconds = useSessionTimer({
    currentWorkout,
    showWorkoutOverview: completion.showWorkoutOverview,
  })

  // Pattern navigation
  const patternNav = usePatternNavigation({
    workoutSets: queries.workoutSets,
    workoutTemplate: queries.workoutTemplate,
    currentPatternIndex,
  })

  // Reset timer state when pattern or exercise changes
  useEffect(() => {
    setIsTimerRunning(false)
    setTimerSeconds(0)
    setShowTimerOverlay(false)
    setRestSecondsRemaining(null)
    setRestTimerStopped(false)
    patternNav.setPendingPatternNavigation(false)
  }, [currentPatternIndex, selectedExerciseId])

  // Timer handlers
  const handleTimerStart = () => {
    setTimerSeconds(0)
    setIsTimerRunning(true)
    setShowTimerOverlay(true)
  }

  const handleTimerStop = () => {
    setIsTimerRunning(false)
    setShowTimerOverlay(false)
  }

  const handleTimerReset = () => {
    setIsTimerRunning(false)
    setTimerSeconds(0)
    setShowTimerOverlay(false)
  }

  const handleRestTimerStart = (seconds: number) => {
    setRestSecondsRemaining(seconds)
    setRestTimerStopped(false)
  }

  const handleRestTimerUpdate = (seconds: number) => {
    setRestSecondsRemaining(seconds)
  }

  const handleRestTimerComplete = () => {
    setRestSecondsRemaining(null)
    setRestTimerStopped(false)
    setIsTimerRunning(false)
    setTimerSeconds(0)
    setShowTimerOverlay(false)
    if (patternNav.pendingPatternNavigation) {
      handleNextPattern()
    }
  }

  const handleRestTimerStop = () => {
    setRestTimerStopped(true)
    setRestSecondsRemaining(null)
    setIsTimerRunning(false)
    setTimerSeconds(0)
    setShowTimerOverlay(false)
    if (patternNav.pendingPatternNavigation) {
      handleNextPattern()
    }
  }

  // Pattern navigation handlers
  const handleNextPattern = () => {
    if (!patternNav.isLastPattern && !patternNav.isNextPatternDisabled) {
      setCurrentPatternIndex((prev) => prev + 1)
      setSelectedExerciseId(null)
    }
  }

  const handlePreviousPattern = () => {
    if (currentPatternIndex > 0) {
      setCurrentPatternIndex((prev) => prev - 1)
      setSelectedExerciseId(null)
    }
  }

  return {
    // Data
    ...queries,
    currentWorkout,
    // State
    currentPatternIndex,
    setCurrentPatternIndex,
    selectedExerciseId,
    setSelectedExerciseId,
    completedSets,
    currentSetNumber,
    isTimerRunning,
    timerSeconds,
    setTimerSeconds,
    showTimerOverlay,
    restSecondsRemaining,
    restTimerStopped,
    sessionElapsedSeconds,
    // Pattern navigation
    ...patternNav,
    handleNextPattern,
    handlePreviousPattern,
    // Completion
    ...completion,
    // Timer handlers
    handleTimerStart,
    handleTimerStop,
    handleTimerReset,
    handleRestTimerStart,
    handleRestTimerUpdate,
    handleRestTimerComplete,
    handleRestTimerStop,
  }
}
