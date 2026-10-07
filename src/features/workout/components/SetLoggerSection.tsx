import { SetLogger } from './SetLogger'
import type { Doc, Id } from '@db/_generated/dataModel'

interface SetLoggerSectionProps {
  currentPattern: {
    patternId: Id<'patterns'>
    sets: number
  }
  selectedExerciseId: Id<'exercises'>
  currentSetNumber: number
  workoutId: Id<'workouts'>
  userId: string
  workoutSets: Array<Doc<'sets'>> | undefined
  restTimeMinutes: number
  onSetComplete: () => void
  onTimerStart: () => void
  onTimerStop: () => void
  onTimerUpdate: (seconds: number) => void
  onTimerReset: () => void
  onRestTimerStart: (seconds: number) => void
  onRestTimerUpdate: (seconds: number) => void
  onRestTimerComplete: () => void
  restTimerStopped: boolean
  isFinalSet: boolean
  getDotClassName: (isCurrent: boolean, isCompleted: boolean) => string
}

export function SetLoggerSection({
  currentPattern,
  selectedExerciseId,
  currentSetNumber,
  workoutId,
  userId,
  workoutSets,
  restTimeMinutes,
  onSetComplete,
  onTimerStart,
  onTimerStop,
  onTimerUpdate,
  onTimerReset,
  onRestTimerStart,
  onRestTimerUpdate,
  onRestTimerComplete,
  restTimerStopped,
  isFinalSet,
  getDotClassName,
}: SetLoggerSectionProps) {
  return (
    <div className="border-t px-4 py-3 space-y-3">
      {/* Set Counter */}
      <div className="flex justify-center items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Set</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: currentPattern.sets }, (_, i) => {
            const setNumber = i + 1
            const isCurrent = setNumber === currentSetNumber
            const isCompleted = setNumber < currentSetNumber

            return (
              <div
                key={setNumber}
                className={`w-1.5 h-1.5 rounded-full transition-all ${getDotClassName(
                  isCurrent,
                  isCompleted,
                )}`}
                aria-label={`Set ${setNumber}`}
              />
            )
          })}
        </div>
      </div>

      {/* Set Logger */}
      <SetLogger
        key={selectedExerciseId}
        workoutId={workoutId}
        patternId={currentPattern.patternId}
        exerciseId={selectedExerciseId}
        userId={userId}
        workoutSets={workoutSets}
        setNumber={currentSetNumber}
        totalSets={currentPattern.sets}
        onSetComplete={onSetComplete}
        restTimeMinutes={restTimeMinutes}
        onTimerStart={onTimerStart}
        onTimerStop={onTimerStop}
        onTimerUpdate={onTimerUpdate}
        onTimerReset={onTimerReset}
        onRestTimerStart={onRestTimerStart}
        onRestTimerUpdate={onRestTimerUpdate}
        onRestTimerComplete={onRestTimerComplete}
        restTimerStopped={restTimerStopped}
        isFinalSet={isFinalSet}
      />
    </div>
  )
}
