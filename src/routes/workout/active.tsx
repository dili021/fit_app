import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useActiveWorkout } from '@/features/workout/hooks/useActiveWorkout'
import { useSetCompletion } from '@/features/workout/hooks/useSetCompletion'
import { ActiveWorkoutView } from '@/features/workout/components/ActiveWorkoutView'
import { WorkoutOverviewWrapper } from '@/features/workout/components/WorkoutOverviewWrapper'
import {
  NoWorkoutState,
  WorkoutDataNotFoundState,
  WorkoutLoadingState,
} from '@/features/workout/components/WorkoutLoadingStates'

const workoutActiveSearchSchema = z.object({
  workoutId: z.string().optional(),
})

export const Route = createFileRoute('/workout/active')({
  component: ActiveWorkout,
  validateSearch: workoutActiveSearchSchema,
})

function ActiveWorkout() {
  const { userId, isPending } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      {userId ? <ActiveWorkoutContent userId={userId} /> : null}
    </ProtectedRoute>
  )
}

// Helper function for dot className based on state
function getDotClassName(isCurrent: boolean, isCompleted: boolean): string {
  if (isCurrent) return 'bg-primary'
  if (isCompleted) return 'bg-green-500'
  return 'bg-muted'
}

function getWorkoutLoadingOrErrorState({
  activeWorkout,
  workoutId,
  workoutQuery,
  currentWorkout,
  mesocycle,
  workoutTemplate,
  currentPattern,
}: {
  activeWorkout: unknown
  workoutId: string | undefined
  workoutQuery: unknown
  currentWorkout: unknown
  mesocycle: unknown
  workoutTemplate: unknown
  currentPattern: unknown | null
}): ReactElement | null {
  // Loading state - check if queries are still loading
  if (activeWorkout === undefined) {
    return <WorkoutLoadingState />
  }
  if (workoutId !== undefined && workoutQuery === undefined) {
    return <WorkoutLoadingState />
  }

  // No workout found
  if (!currentWorkout) {
    return <NoWorkoutState />
  }

  // Loading mesocycle or template
  if (mesocycle === undefined || workoutTemplate === undefined) {
    return <WorkoutLoadingState />
  }

  // No mesocycle found (after undefined check)
  if (!mesocycle || !currentPattern) {
    return <WorkoutDataNotFoundState />
  }

  return null
}

function ActiveWorkoutContent({ userId }: { userId: string }) {
  const { workoutId } = Route.useSearch()

  // Use consolidated hook for all workout logic
  const workout = useActiveWorkout({ userId, workoutId })

  // Destructure hook values
  const {
    currentWorkout,
    activeWorkout,
    workout: workoutQuery,
    mesocycle,
    workoutTemplate,
    exercises,
    patterns,
    workoutSets,
    progressionSuggestion,
    currentPatternIndex,
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
    currentPattern: currentPatternTemplate,
    isLastPattern,
    isNextPatternDisabled,
    allSetsCompleted,
    showWorkoutOverview,
    showConfirmDialog,
    setShowConfirmDialog,
    handleNextPattern,
    handlePreviousPattern,
    handleTimerStart,
    handleTimerStop,
    handleTimerReset,
    handleRestTimerStart,
    handleRestTimerUpdate,
    handleRestTimerComplete,
    handleRestTimerStop,
    handleConcludeSession,
    concludeWorkout,
    handleCompleteWorkoutFromOverview,
    setPendingPatternNavigation,
  } = workout

  // Get current pattern with full details
  const currentPattern =
    currentPatternTemplate && patterns
      ? {
          ...currentPatternTemplate,
          patternName:
            patterns.find((p) => p._id === currentPatternTemplate.patternId)
              ?.displayName || 'Unknown Pattern',
        }
      : null

  // Handle loading and error states
  const loadingOrErrorState = getWorkoutLoadingOrErrorState({
    activeWorkout,
    workoutId,
    workoutQuery,
    currentWorkout,
    mesocycle,
    workoutTemplate,
    currentPattern,
  })
  if (loadingOrErrorState) {
    return loadingOrErrorState
  }

  // TypeScript narrowing: after the check above, these are guaranteed to be non-null
  if (!currentWorkout || !mesocycle || !currentPattern || !workoutTemplate) {
    return <WorkoutDataNotFoundState />
  }

  // Handle set completion with auto-navigation logic
  const { handleSetComplete } = useSetCompletion({
    workoutTemplate,
    workoutSets,
    currentPattern,
    currentPatternIndex,
    currentSetNumber,
    isLastPattern,
    setPendingPatternNavigation,
  })

  // Show workout overview if all sets are completed
  if (showWorkoutOverview && workoutSets && exercises && patterns) {
    return (
      <WorkoutOverviewWrapper
        workoutSets={workoutSets}
        exercises={exercises}
        patterns={patterns}
        currentWorkout={currentWorkout}
        onComplete={handleCompleteWorkoutFromOverview}
      />
    )
  }

  return (
    <ActiveWorkoutView
      currentPattern={currentPattern}
      completedSets={completedSets}
      workoutTemplate={workoutTemplate}
      workoutSets={workoutSets}
      currentPatternIndex={currentPatternIndex}
      sessionElapsedSeconds={sessionElapsedSeconds}
      currentWorkout={currentWorkout}
      selectedExerciseId={selectedExerciseId}
      setSelectedExerciseId={setSelectedExerciseId}
      currentSetNumber={currentSetNumber}
      userId={userId}
      restTimeMinutes={mesocycle.restTimeMinutes ?? 3}
      isTimerRunning={isTimerRunning}
      timerSeconds={timerSeconds}
      setTimerSeconds={setTimerSeconds}
      showTimerOverlay={showTimerOverlay}
      restSecondsRemaining={restSecondsRemaining}
      restTimerStopped={restTimerStopped}
      progressionSuggestion={progressionSuggestion}
      isLastPattern={isLastPattern}
      isNextPatternDisabled={isNextPatternDisabled}
      allSetsCompleted={allSetsCompleted}
      showConfirmDialog={showConfirmDialog}
      setShowConfirmDialog={setShowConfirmDialog}
      onSetComplete={handleSetComplete}
      onTimerStart={handleTimerStart}
      onTimerStop={handleTimerStop}
      onTimerReset={handleTimerReset}
      onRestTimerStart={handleRestTimerStart}
      onRestTimerUpdate={handleRestTimerUpdate}
      onRestTimerComplete={handleRestTimerComplete}
      onRestTimerStop={handleRestTimerStop}
      onPreviousPattern={handlePreviousPattern}
      onNextPattern={handleNextPattern}
      onConcludeSession={handleConcludeSession}
      onConfirmConclude={() => {
        void concludeWorkout()
      }}
      getDotClassName={getDotClassName}
    />
  )
}
