import { ExerciseGroupCard } from './ExerciseGroupCard'
import type { Id } from '../../../../convex/_generated/dataModel'

interface Set {
  _id: Id<'sets'>
  exerciseId: Id<'exercises'>
  weight: number
  reps: number
  duration: number
  orderInWorkout: number
}

interface PatternGroupSectionProps {
  patternName: string
  exercises: Record<
    Id<'exercises'>,
    {
      exerciseId: Id<'exercises'>
      exerciseName: string
      sets: Array<Set>
    }
  >
  formatTime: (seconds: number) => string
}

export function PatternGroupSection({
  patternName,
  exercises,
  formatTime,
}: PatternGroupSectionProps) {
  const patternSets = Object.values(exercises).flatMap((e) => e.sets)
  const patternTotalSets = patternSets.length

  return (
    <div className="space-y-3">
      {/* Pattern Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <h2 className="text-xl font-semibold">{patternName}</h2>
        <div className="text-sm text-muted-foreground">
          {patternTotalSets} {patternTotalSets === 1 ? 'set' : 'sets'}
        </div>
      </div>

      {/* Exercises in this pattern */}
      <div className="space-y-3">
        {Object.values(exercises).map((exerciseGroup) => (
          <ExerciseGroupCard
            key={exerciseGroup.exerciseId}
            exerciseName={exerciseGroup.exerciseName}
            sets={exerciseGroup.sets}
            formatTime={formatTime}
          />
        ))}
      </div>
    </div>
  )
}
