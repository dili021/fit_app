import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS
const REST_MINUTES = 3

interface ExercisePlan {
  pattern: string
  exercise: string
  sets: number
  startWeight: number
  weeklyIncrement: number
}

// Push and Pull are primary, the other patterns get one maintenance set
const SESSION_PLAN: Array<ExercisePlan> = [
  {
    pattern: 'push',
    exercise: 'Bench Press',
    sets: 3,
    startWeight: 70,
    weeklyIncrement: 2.5,
  },
  {
    pattern: 'push',
    exercise: 'Incline Bench Press',
    sets: 2,
    startWeight: 55,
    weeklyIncrement: 2.5,
  },
  {
    pattern: 'pull',
    exercise: 'Barbell Row',
    sets: 3,
    startWeight: 60,
    weeklyIncrement: 2.5,
  },
  {
    pattern: 'pull',
    exercise: 'Lat Pulldown',
    sets: 2,
    startWeight: 55,
    weeklyIncrement: 2.5,
  },
  {
    pattern: 'squat',
    exercise: 'Back Squat',
    sets: 1,
    startWeight: 90,
    weeklyIncrement: 2.5,
  },
  {
    pattern: 'hinge',
    exercise: 'Romanian Deadlift',
    sets: 1,
    startWeight: 80,
    weeklyIncrement: 2.5,
  },
  {
    pattern: 'lunge',
    exercise: 'Bulgarian Split Squat',
    sets: 1,
    startWeight: 20,
    weeklyIncrement: 1,
  },
  {
    pattern: 'twist',
    exercise: 'Cable Woodchops',
    sets: 1,
    startWeight: 15,
    weeklyIncrement: 1,
  },
]

interface ResolvedExercise extends ExercisePlan {
  patternId: Id<'patterns'>
  exerciseId: Id<'exercises'>
}

async function resolveSessionPlan(
  ctx: MutationCtx,
): Promise<Array<ResolvedExercise>> {
  const patterns = await ctx.db.query('patterns').collect()
  const exercises = await ctx.db.query('exercises').collect()

  return SESSION_PLAN.map((plan) => {
    const pattern = patterns.find((p) => p.name === plan.pattern)
    const exercise = exercises.find(
      (e) => e.patternId === pattern?._id && e.name === plan.exercise,
    )
    if (!pattern || !exercise) {
      throw new Error(
        `Missing ${plan.pattern}:${plan.exercise}. Run seed:seedAll first`,
      )
    }
    return { ...plan, patternId: pattern._id, exerciseId: exercise._id }
  })
}

async function insertWorkoutSets(
  ctx: MutationCtx,
  params: {
    workoutId: Id<'workouts'>
    startedAt: number
    weekNumber: number
    plan: Array<ResolvedExercise>
  },
): Promise<number> {
  let order = 1
  let cursor = params.startedAt

  for (const item of params.plan) {
    const weight =
      item.startWeight + (params.weekNumber - 1) * item.weeklyIncrement

    for (let set = 0; set < item.sets; set++) {
      const duration = 30 + Math.floor(Math.random() * 20)
      const startTime = cursor
      const endTime = startTime + duration * 1000

      await ctx.db.insert('sets', {
        workoutId: params.workoutId,
        patternId: item.patternId,
        exerciseId: item.exerciseId,
        weight,
        // Later sets of an exercise drop a rep or two
        reps: 8 + Math.floor(Math.random() * 5) - Math.min(set, 2),
        orderInWorkout: order,
        startTime,
        endTime,
        duration,
      })

      order++
      cursor = endTime + REST_MINUTES * 60 * 1000
    }
  }

  return cursor
}

/**
 * Create a completed mesocycle with workouts spread evenly over the last weeks
 */
export async function createRecentWorkouts(
  ctx: MutationCtx,
  params: { userId: string; count: number; weeks: number },
): Promise<{ mesocycleId: Id<'mesocycles'>; workoutsCreated: number }> {
  const { userId, count, weeks } = params
  const plan = await resolveSessionPlan(ctx)

  const now = Date.now()
  const mesoStart = now - weeks * WEEK_MS
  const primaryPatterns = [
    ...new Set(plan.filter((item) => item.sets > 1).map((p) => p.patternId)),
  ]

  const mesocycleId = await ctx.db.insert('mesocycles', {
    userId,
    name: 'Seeded history',
    startDate: mesoStart,
    durationWeeks: weeks,
    primaryPatterns,
    targetSetsPerWeek: 20,
    sessionsPerWeek: 2,
    wasPreviouslyTraining: true,
    restTimeMinutes: REST_MINUTES,
    status: 'completed',
    currentWeek: weeks,
  })

  // First workout on the mesocycle start day, last one a few days ago
  const spanDays = weeks * 7 - 3
  const stepDays = count > 1 ? spanDays / (count - 1) : 0

  for (let i = 0; i < count; i++) {
    const startedAt = mesoStart + Math.round(i * stepDays) * DAY_MS
    const weekNumber = Math.floor((startedAt - mesoStart) / WEEK_MS) + 1

    const workoutId = await ctx.db.insert('workouts', {
      userId,
      mesocycleId,
      date: startedAt,
      weekNumber,
      completed: true,
      startedAt,
    })

    const completedAt = await insertWorkoutSets(ctx, {
      workoutId,
      startedAt,
      weekNumber,
      plan,
    })
    await ctx.db.patch(workoutId, { completedAt })
  }

  return { mesocycleId, workoutsCreated: count }
}
