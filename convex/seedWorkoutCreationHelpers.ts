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
 * Create workouts for mesocycle 1
 */
export async function createMesocycle1Workouts(
  ctx: DatabaseContext,
  params: {
    userId: string
    meso1Id: Id<'mesocycles'>
    meso1Start: number
    oneWeekMs: number
    oneDayMs: number
    exerciseMap: Map<string, Doc<'exercises'>>
    pushPatternId: Id<'patterns'>
    pullPatternId: Id<'patterns'>
  },
): Promise<Array<Id<'workouts'>>> {
  const meso1Workouts: Array<Id<'workouts'>> = []
  for (let week = 1; week <= 2; week++) {
    for (let session = 0; session < 3; session++) {
      const workoutDate =
        params.meso1Start +
        (week - 1) * params.oneWeekMs +
        session * 2 * params.oneDayMs

      const { workoutId, startedAt } = await createWorkout(ctx, {
        userId: params.userId,
        mesocycleId: params.meso1Id,
        workoutDate,
        weekNumber: week,
      })

      const benchPress = params.exerciseMap.get('push:Bench Press')
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

      const pullUps = params.exerciseMap.get('pull:Pull-ups')
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

      meso1Workouts.push(workoutId)
    }
  }
  return meso1Workouts
}

/**
 * Create workouts for mesocycle 2
 */
export async function createMesocycle2Workouts(
  ctx: DatabaseContext,
  params: {
    userId: string
    meso2Id: Id<'mesocycles'>
    meso2Start: number
    oneWeekMs: number
    oneDayMs: number
    exerciseMap: Map<string, Doc<'exercises'>>
    squatPatternId: Id<'patterns'>
    hingePatternId: Id<'patterns'>
  },
): Promise<void> {
  for (let week = 1; week <= 2; week++) {
    for (let session = 0; session < 2; session++) {
      const workoutDate =
        params.meso2Start +
        (week - 1) * params.oneWeekMs +
        session * 3 * params.oneDayMs

      const { workoutId, startedAt } = await createWorkout(ctx, {
        userId: params.userId,
        mesocycleId: params.meso2Id,
        workoutDate,
        weekNumber: week,
        durationRange: [50, 75],
      })

      const backSquat = params.exerciseMap.get('squat:Back Squat')
      if (backSquat) {
        await createSetsForExerciseInWorkout(ctx, {
          workoutId,
          patternId: params.squatPatternId,
          exerciseId: backSquat._id,
          baseWeight: 100 + week * 5,
          numSets: 4,
          repsRange: [6, 7],
          startedAt,
          restMinutes: 4,
          orderOffset: 0,
          firstSetWeightAdjustment: -10,
        })
      }

      const deadlift = params.exerciseMap.get('hinge:Deadlift')
      if (deadlift) {
        await createSetsForExerciseInWorkout(ctx, {
          workoutId,
          patternId: params.hingePatternId,
          exerciseId: deadlift._id,
          baseWeight: 140 + week * 5,
          numSets: 3,
          repsRange: [5, 6],
          startedAt,
          restMinutes: 4,
          orderOffset: 4,
          firstSetWeightAdjustment: -10,
        })
      }
    }
  }
}

/**
 * Create workouts for mesocycle 3
 */
export async function createMesocycle3Workouts(
  ctx: DatabaseContext,
  params: {
    userId: string
    meso3Id: Id<'mesocycles'>
    meso3Start: number
    oneWeekMs: number
    oneDayMs: number
    exerciseMap: Map<string, Doc<'exercises'>>
    pushPatternId: Id<'patterns'>
  },
): Promise<void> {
  for (let week = 1; week <= 2; week++) {
    for (let session = 0; session < 3; session++) {
      const workoutDate =
        params.meso3Start +
        (week - 1) * params.oneWeekMs +
        session * 2 * params.oneDayMs

      const { workoutId, startedAt } = await createWorkout(ctx, {
        userId: params.userId,
        mesocycleId: params.meso3Id,
        workoutDate,
        weekNumber: week,
        durationRange: [40, 60],
      })

      const inclineBench = params.exerciseMap.get('push:Incline Bench Press')
      if (inclineBench) {
        await createSetsForExerciseInWorkout(ctx, {
          workoutId,
          patternId: params.pushPatternId,
          exerciseId: inclineBench._id,
          baseWeight: 70 + week * 2,
          numSets: 6,
          repsRange: [10, 12],
          startedAt,
          restMinutes: 2,
          orderOffset: 0,
        })
      }
    }
  }
}
