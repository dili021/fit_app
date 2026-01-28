import type { Id } from './_generated/dataModel'

interface SetData {
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

interface WorkoutData {
  userId: string
  mesocycleId: Id<'mesocycles'>
  date: number
  weekNumber: number
  completed: boolean
  startedAt: number
  completedAt: number
}

interface DatabaseContext {
  db: {
    insert: (
      table: string,
      data: SetData | WorkoutData,
    ) => Promise<Id<'workouts'> | Id<'sets'>>
  }
}

/**
 * Create sets for an exercise in a workout (reduces nesting)
 */
export async function createSetsForExerciseInWorkout(
  ctx: DatabaseContext,
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
 * Create sets for bodyweight exercise (pull-ups, etc.)
 */
export async function createBodyweightSets(
  ctx: DatabaseContext,
  params: {
    workoutId: Id<'workouts'>
    patternId: Id<'patterns'>
    exerciseId: Id<'exercises'>
    baseReps: number
    numSets: number
    startedAt: number
    restMinutes: number
    orderOffset: number
    setOffset?: number
  },
): Promise<void> {
  const {
    workoutId,
    patternId,
    exerciseId,
    baseReps,
    numSets,
    startedAt,
    restMinutes,
    orderOffset,
    setOffset = 0,
  } = params

  for (let set = 1; set <= numSets; set++) {
    const reps = baseReps + Math.floor(Math.random() * 2)
    const setStart = startedAt + (setOffset + set) * restMinutes * 60 * 1000
    const setEnd = setStart + (20 + Math.random() * 15) * 1000

    await ctx.db.insert('sets', {
      workoutId,
      patternId,
      exerciseId,
      weight: 0,
      reps,
      orderInWorkout: orderOffset + (set - 1) * 2,
      startTime: setStart,
      endTime: setEnd,
      duration: Math.floor((setEnd - setStart) / 1000),
    })
  }
}

/**
 * Create a workout with timing
 */
export async function createWorkout(
  ctx: DatabaseContext,
  params: {
    userId: string
    mesocycleId: Id<'mesocycles'>
    workoutDate: number
    weekNumber: number
    durationRange?: [number, number]
  },
): Promise<{
  workoutId: Id<'workouts'>
  startedAt: number
  completedAt: number
}> {
  const {
    userId,
    mesocycleId,
    workoutDate,
    weekNumber,
    durationRange = [45, 75],
  } = params
  const startedAt = workoutDate
  const durationMinutes =
    durationRange[0] + Math.random() * (durationRange[1] - durationRange[0])
  const completedAt = startedAt + durationMinutes * 60 * 1000

  const workoutId = (await ctx.db.insert('workouts', {
    userId,
    mesocycleId,
    date: workoutDate,
    weekNumber,
    completed: true,
    startedAt,
    completedAt,
  })) as Id<'workouts'>

  return { workoutId, startedAt, completedAt }
}
