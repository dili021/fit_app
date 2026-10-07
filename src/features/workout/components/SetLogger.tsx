import { Check, Play } from 'lucide-react'
import { ProgressionSuggestionDisplay } from './ProgressionSuggestionDisplay'
import type { Doc, Id } from '@db/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSetLogger } from '@/features/workout/hooks/useSetLogger'

interface SetLoggerProps {
  workoutId: Id<'workouts'>
  patternId: Id<'patterns'>
  exerciseId: Id<'exercises'>
  userId: string
  workoutSets: Array<Doc<'sets'>> | undefined
  setNumber: number
  totalSets: number
  onSetComplete: () => void
  restTimeMinutes: number
  onTimerStart?: () => void
  onTimerStop?: () => void
  onTimerUpdate?: (seconds: number) => void
  onTimerReset?: () => void
  onRestTimerStart?: (seconds: number) => void
  onRestTimerUpdate?: (seconds: number) => void
  onRestTimerComplete?: () => void
  restTimerStopped?: boolean // Signal from parent to stop rest timer
  isFinalSet?: boolean // No rest timer after the last set of the workout
}

export function SetLogger({
  workoutId,
  patternId,
  exerciseId,
  userId,
  workoutSets,
  setNumber,
  onSetComplete,
  restTimeMinutes,
  onTimerStart,
  onTimerUpdate,
  onTimerReset,
  onRestTimerStart,
  onRestTimerUpdate,
  onRestTimerComplete,
  restTimerStopped = false,
  isFinalSet = false,
}: SetLoggerProps) {
  const {
    weight,
    setWeight,
    reps,
    setReps,
    lastSet,
    suggestedWeight,
    isTimerRunning,
    restSecondsRemaining,
    canComplete,
    handleStartTimer,
    handleCompleteSet,
  } = useSetLogger({
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
    restTimerStopped,
    isFinalSet,
  })

  return (
    <div className="w-full space-y-3">
      {/* Timer Button - Opens overlay when clicked */}
      <Button
        onClick={handleStartTimer}
        variant="outline"
        className="w-full"
        disabled={!!restSecondsRemaining || isTimerRunning}
      >
        <Play className="h-4 w-4 mr-2" />
        Start Timer
      </Button>

      {/* Weight and Reps Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={lastSet?.weight.toString() || '0'}
            className="mt-2 text-lg"
          />
          <ProgressionSuggestionDisplay
            suggestion={suggestedWeight}
            lastSet={lastSet}
            fallbackLabel="Last"
            fallbackValue={`${lastSet?.weight ?? 0}kg`}
          />
        </div>
        <div>
          <Label htmlFor="reps">Reps</Label>
          <Input
            id="reps"
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder={lastSet?.reps.toString() || '0'}
            className="mt-2 text-lg"
          />
          <ProgressionSuggestionDisplay
            suggestion={null}
            lastSet={lastSet}
            fallbackLabel="Last"
            fallbackValue={`${lastSet?.reps ?? 0} reps`}
          />
        </div>
      </div>

      {/* Complete Set Button */}
      <Button
        onClick={() => {
          void handleCompleteSet()
        }}
        size="lg"
        className="w-full"
        disabled={!canComplete}
      >
        <Check className="h-5 w-5 mr-2" />
        Complete Set
      </Button>
    </div>
  )
}
