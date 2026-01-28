import type { Doc, Id } from './_generated/dataModel'

/**
 * Create sets for an exercise in a workout
 */
export async function createSetsForExercise(
  ctx: {
    db: {
      insert: (
        table: string,
        data: {
          workoutId: Id<'workouts'>
          patternId: Id<'patterns'>
          exerciseId: Id<'exercises'>
          weight: number
          reps: number
          orderInWorkout: number
          startTime: number
          endTime: number
          duration: number
        },
      ) => Promise<Id<'sets'> | Id<'workouts'>>
    }
  },
  params: {
    workoutId: Id<'workouts'>
    patternId: Id<'patterns'>
    exerciseId: Id<'exercises'>
    baseWeight: number
    numSets: number
    repsRange: [number, number]
    startedAt: number
    restMinutes: number
    orderOffset: number
    firstSetWeightAdjustment?: number
  },
): Promise<void> {
  const {
    workoutId,
    patternId,
    exerciseId,
    baseWeight,
    numSets,
    repsRange,
    startedAt,
    restMinutes,
    orderOffset,
    firstSetWeightAdjustment = 0,
  } = params

  for (let set = 1; set <= numSets; set++) {
    const weight = baseWeight + (set === 1 ? firstSetWeightAdjustment : 0)
    const reps =
      repsRange[0] +
      Math.floor(Math.random() * (repsRange[1] - repsRange[0] + 1))
    const setStart = startedAt + set * restMinutes * 60 * 1000
    const setEnd = setStart + (30 + Math.random() * 20) * 1000

    await ctx.db.insert('sets', {
      workoutId,
      patternId,
      exerciseId,
      weight: Math.round(weight * 10) / 10,
      reps,
      orderInWorkout: orderOffset + set - 1,
      startTime: setStart,
      endTime: setEnd,
      duration: Math.floor((setEnd - setStart) / 1000),
    })
  }
}

/**
 * Create a workout with sets
 */
export async function createWorkoutWithSets(
  ctx: {
    db: {
      insert: (
        table: string,
        data:
          | {
              userId: string
              mesocycleId: Id<'mesocycles'>
              date: number
              weekNumber: number
              completed: boolean
              startedAt: number
              completedAt: number
            }
          | {
              workoutId: Id<'workouts'>
              patternId: Id<'patterns'>
              exerciseId: Id<'exercises'>
              weight: number
              reps: number
              orderInWorkout: number
              startTime: number
              endTime: number
              duration: number
            },
      ) => Promise<Id<'workouts'> | Id<'sets'>>
    }
  },
  params: {
    userId: string
    mesocycleId: Id<'mesocycles'>
    workoutDate: number
    weekNumber: number
    exerciseMap: Map<string, Doc<'exercises'>>
    patternId: Id<'patterns'>
    exerciseKey: string
    baseWeight: number
    numSets: number
    repsRange: [number, number]
    restMinutes: number
    orderOffset: number
    firstSetWeightAdjustment?: number
  },
): Promise<Id<'workouts'>> {
  const {
    userId,
    mesocycleId,
    workoutDate,
    weekNumber,
    exerciseMap,
    patternId,
    exerciseKey,
    baseWeight,
    numSets,
    repsRange,
    restMinutes,
    orderOffset,
    firstSetWeightAdjustment = 0,
  } = params

  const startedAt = workoutDate
  const completedAt = startedAt + (45 + Math.random() * 30) * 60 * 1000

  const workoutId = (await ctx.db.insert('workouts', {
    userId,
    mesocycleId,
    date: workoutDate,
    weekNumber,
    completed: true,
    startedAt,
    completedAt,
  })) as Id<'workouts'>

  const exercise = exerciseMap.get(exerciseKey)
  if (exercise) {
    await createSetsForExercise(ctx, {
      workoutId,
      patternId,
      exerciseId: exercise._id,
      baseWeight,
      numSets,
      repsRange,
      startedAt,
      restMinutes,
      orderOffset,
      firstSetWeightAdjustment,
    })
  }

  return workoutId
}
