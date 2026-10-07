import { ExerciseGroupRow } from './ExerciseGroupRow'
import type { Id } from '@db/_generated/dataModel'

interface Set {
  _id: Id<'sets'>
  exerciseId: Id<'exercises'>
  weight: number
  reps: number
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
}

export function PatternGroupSection({
  patternName,
  exercises,
}: PatternGroupSectionProps) {
  const exerciseGroups = Object.values(exercises)
  const patternTotalSets = exerciseGroups.flatMap((e) => e.sets).length

  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{patternName}</h2>
        <div className="text-xs text-muted-foreground">
          {patternTotalSets} {patternTotalSets === 1 ? 'set' : 'sets'}
        </div>
      </div>
      {exerciseGroups.map((exerciseGroup) => (
        <ExerciseGroupRow
          key={exerciseGroup.exerciseId}
          exerciseName={exerciseGroup.exerciseName}
          sets={exerciseGroup.sets}
        />
      ))}
    </div>
  )
}
