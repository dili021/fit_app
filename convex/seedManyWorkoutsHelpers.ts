import {
  createBodyweightSets,
  createSetsForExerciseInWorkout,
  createWorkout,
} from './seedWorkoutHelpers'
import type { Doc, Id } from './_generated/dataModel'

interface WorkoutInsertData {
  userId: string
  mesocycleId: Id<'mesocycles'>
  date: number
  weekNumber: number
  completed: boolean
  startedAt: number
  completedAt: number
}

interface SetInsertData {
  workoutId: Id<'workouts'>
  patternId: Id<'patterns'>
  exerciseId: Id<'exercises'>
  weight: number
  reps: number
  orderInWorkout: number
  startTime: number
  endTime: number
  duration: number
}

interface DatabaseContext {
  db: {
    insert: (
      table: string,
      data: WorkoutInsertData | SetInsertData,
    ) => Promise<Id<'workouts'> | Id<'sets'>>
  }
}

/**
 * Create many workouts for pagination testing
 */
export async function createManyWorkouts(
  ctx: DatabaseContext,
  params: {
    userId: string
    mesoId: Id<'mesocycles'>
    mesoStart: number
    oneWeekMs: number
    oneDayMs: number
    exerciseMap: Map<string, Doc<'exercises'>>
    pushPatternId: Id<'patterns'>
    pullPatternId: Id<'patterns'>
  },
): Promise<number> {
  let workoutsCreated = 0
  const benchPress = params.exerciseMap.get('push:Bench Press')
  const pullUps = params.exerciseMap.get('pull:Pull-ups')

  for (let week = 1; week <= 20; week++) {
    for (let session = 0; session < 3; session++) {
      const workoutDate =
        params.mesoStart +
        (week - 1) * params.oneWeekMs +
        session * 2 * params.oneDayMs

      const { workoutId, startedAt } = await createWorkout(ctx, {
        userId: params.userId,
        mesocycleId: params.mesoId,
        workoutDate,
        weekNumber: week,
      })

      if (benchPress) {
        await createSetsForExerciseInWorkout(ctx, {
          workoutId,
          patternId: params.pushPatternId,
          exerciseId: benchPress._id,
          baseWeight: 80 + week * 2.5,
          numSets: 5,
          repsRange: [8, 10],
          startedAt,
          restMinutes: 3,
          orderOffset: 0,
          firstSetWeightAdjustment: -5,
        })
      }

      if (pullUps) {
        await createBodyweightSets(ctx, {
          workoutId,
          patternId: params.pullPatternId,
          exerciseId: pullUps._id,
          baseReps: 8 + week,
          numSets: 4,
          startedAt,
          restMinutes: 3,
          orderOffset: 1,
          setOffset: 5,
        })
      }

      workoutsCreated++
    }
  }

  return workoutsCreated
}
