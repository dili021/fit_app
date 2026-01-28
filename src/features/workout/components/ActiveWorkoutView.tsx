import { ExerciseSelectionSection } from './ExerciseSelectionSection'
import { SetLoggerSection } from './SetLoggerSection'
import { WorkoutFooter } from './WorkoutFooter'
import { ConcludeSessionDialog } from './ConcludeSessionDialog'
import type { Doc, Id } from '../../../../convex/_generated/dataModel'
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay'
import { TimerOverlay } from '@/components/workout/TimerOverlay'

interface ActiveWorkoutViewProps {
  currentPattern: {
    patternId: Id<'patterns'>
    patternName: string
    sets: number
    isPrimary: boolean
  }
  completedSets: number
  workoutTemplate: {
    template: Array<{ patternId: Id<'patterns'>; sets: number }>
  }
  workoutSets: Array<Doc<'sets'>> | undefined
  currentPatternIndex: number
  sessionElapsedSeconds: number
  currentWorkout: Doc<'workouts'>
  selectedExerciseId: Id<'exercises'> | null
  setSelectedExerciseId: (id: Id<'exercises'>) => void
  currentSetNumber: number
  userId: string
  restTimeMinutes: number
  isTimerRunning: boolean
  timerSeconds: number
  setTimerSeconds: (seconds: number) => void
  showTimerOverlay: boolean
  restSecondsRemaining: number | null
  restTimerStopped: boolean
  progressionSuggestion:
    | {
        suggestedWeight: number | null
        lastWeight: number | null
        lastReps: number | null
        suggestion: 'increase' | 'decrease' | 'maintain' | null
        reason: string
      }
    | null
    | undefined
  isLastPattern: boolean
  isNextPatternDisabled: boolean
  allSetsCompleted: boolean
  showConfirmDialog: boolean
  setShowConfirmDialog: (open: boolean) => void
  onSetComplete: () => void
  onTimerStart: () => void
  onTimerStop: () => void
  onTimerReset: () => void
  onRestTimerStart: (seconds: number) => void
  onRestTimerUpdate: (seconds: number) => void
  onRestTimerComplete: () => void
  onRestTimerStop: () => void
  onPreviousPattern: () => void
  onNextPattern: () => void
  onConcludeSession: () => void
  onConfirmConclude: () => void
  getDotClassName: (isCurrent: boolean, isCompleted: boolean) => string
}

export function ActiveWorkoutView({
  currentPattern,
  completedSets: _completedSets,
  workoutTemplate: _workoutTemplate,
  workoutSets: _workoutSets,
  currentPatternIndex,
  sessionElapsedSeconds: _sessionElapsedSeconds,
  currentWorkout,
  selectedExerciseId,
  setSelectedExerciseId,
  currentSetNumber,
  userId,
  restTimeMinutes,
  isTimerRunning,
  timerSeconds,
  setTimerSeconds,
  showTimerOverlay,
  restSecondsRemaining,
  restTimerStopped,
  progressionSuggestion,
  isLastPattern,
  isNextPatternDisabled,
  allSetsCompleted,
  showConfirmDialog,
  setShowConfirmDialog,
  onSetComplete,
  onTimerStart,
  onTimerStop,
  onTimerReset,
  onRestTimerStart,
  onRestTimerUpdate,
  onRestTimerComplete,
  onRestTimerStop,
  onPreviousPattern,
  onNextPattern,
  onConcludeSession,
  onConfirmConclude,
  getDotClassName,
}: ActiveWorkoutViewProps) {
  return (
    <>
      <ConcludeSessionDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={onConfirmConclude}
      />

      <TimerOverlay
        isVisible={showTimerOverlay && isTimerRunning}
        onStart={onTimerStart}
        onStop={onTimerStop}
        elapsedSeconds={timerSeconds}
        isRunning={isTimerRunning}
      />

      <RestTimerOverlay
        isVisible={restSecondsRemaining !== null && restSecondsRemaining > 0}
        secondsRemaining={restSecondsRemaining || 0}
        onDismiss={onRestTimerStop}
        progressionSuggestion={progressionSuggestion || null}
      />

      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex-1 overflow-y-auto flex flex-col">
          <ExerciseSelectionSection
            currentPattern={currentPattern}
            selectedExerciseId={selectedExerciseId}
            onSelectExercise={setSelectedExerciseId}
          />

          {selectedExerciseId && (
            <SetLoggerSection
              currentPattern={currentPattern}
              selectedExerciseId={selectedExerciseId}
              currentSetNumber={currentSetNumber}
              workoutId={currentWorkout._id}
              userId={userId}
              restTimeMinutes={restTimeMinutes}
              onSetComplete={onSetComplete}
              onTimerStart={onTimerStart}
              onTimerStop={onTimerStop}
              onTimerUpdate={setTimerSeconds}
              onTimerReset={onTimerReset}
              onRestTimerStart={onRestTimerStart}
              onRestTimerUpdate={onRestTimerUpdate}
              onRestTimerComplete={onRestTimerComplete}
              restTimerStopped={restTimerStopped}
              getDotClassName={getDotClassName}
            />
          )}
        </div>

        <WorkoutFooter
          currentPatternIndex={currentPatternIndex}
          isLastPattern={isLastPattern}
          isNextPatternDisabled={isNextPatternDisabled}
          allSetsCompleted={allSetsCompleted}
          onPreviousPattern={onPreviousPattern}
          onNextPattern={onNextPattern}
          onConcludeSession={onConcludeSession}
        />
      </div>
    </>
  )
}
