import { WorkoutOverview } from './WorkoutOverview'
import type { Doc } from '@db/_generated/dataModel'

interface WorkoutOverviewWrapperProps {
  workoutSets: Array<Doc<'sets'>>
  exercises: Array<Doc<'exercises'>>
  patterns: Array<Doc<'patterns'>>
  currentWorkout: Doc<'workouts'>
  onComplete: () => void
}

export function WorkoutOverviewWrapper({
  workoutSets,
  exercises,
  patterns,
  currentWorkout,
  onComplete,
}: WorkoutOverviewWrapperProps) {
  const totalSessionTime = currentWorkout.startedAt
    ? Math.floor(
        ((currentWorkout.completedAt || Date.now()) -
          currentWorkout.startedAt) /
          1000,
      )
    : 0

  return (
    <WorkoutOverview
      sets={workoutSets}
      exercises={exercises}
      patterns={patterns}
      totalSessionTime={totalSessionTime}
      onComplete={onComplete}
    />
  )
}
