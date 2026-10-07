import type { Id } from '@db/_generated/dataModel'

interface Set {
  _id: Id<'sets'>
  weight: number
  reps: number
  orderInWorkout: number
}

interface ExerciseGroupRowProps {
  exerciseName: string
  sets: Array<Set>
}

export function ExerciseGroupRow({
  exerciseName,
  sets,
}: ExerciseGroupRowProps) {
  const orderedSets = [...sets].sort(
    (a, b) => a.orderInWorkout - b.orderInWorkout,
  )

  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
      <span className="font-medium">{exerciseName}</span>
      <span className="text-right text-muted-foreground">
        {orderedSets.map((set) => `${set.weight}kg × ${set.reps}`).join(', ')}
      </span>
    </div>
  )
}
