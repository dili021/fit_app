import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Get all user IDs (for seeding purposes)
 */
export const getUserIds = query({
  handler: async (ctx) => {
    // Get unique user IDs from mesocycles
    const mesocycles = await ctx.db.query('mesocycles').collect()
    const userIds = [...new Set(mesocycles.map((m) => m.userId))]
    return userIds
  },
})

/**
 * Seed the database with movement patterns
 * Run with: npx convex run seed:seedPatterns
 */
export const seedPatterns = mutation({
  handler: async (ctx) => {
    const patterns = [
      {
        name: 'push',
        displayName: 'Push',
        order: 1,
        description: 'Chest, shoulders, triceps',
      },
      {
        name: 'pull',
        displayName: 'Pull',
        order: 2,
        description: 'Back, biceps, rear delts',
      },
      {
        name: 'squat',
        displayName: 'Squat',
        order: 3,
        description: 'Quad-dominant leg movements',
      },
      {
        name: 'hinge',
        displayName: 'Hinge',
        order: 4,
        description: 'Hip-dominant posterior chain',
      },
      {
        name: 'lunge',
        displayName: 'Lunge',
        order: 5,
        description: 'Unilateral leg movements',
      },
      {
        name: 'twist',
        displayName: 'Twist',
        order: 6,
        description: 'Rotational core movements',
      },
    ]

    const patternIds: Record<string, string> = {}

    for (const pattern of patterns) {
      // Check if pattern already exists
      const existing = await ctx.db
        .query('patterns')
        .withIndex('name', (q) => q.eq('name', pattern.name))
        .first()

      if (!existing) {
        const id = await ctx.db.insert('patterns', pattern)
        patternIds[pattern.name] = id
        console.log(`Created pattern: ${pattern.displayName}`)
      } else {
        patternIds[pattern.name] = existing._id
        console.log(`Pattern already exists: ${pattern.displayName}`)
      }
    }

    return patternIds
  },
})

/**
 * Seed the database with placeholder exercises
 * Run with: npx convex run seed:seedExercises
 */
export const seedExercises = mutation({
  handler: async (ctx) => {
    // First, get all patterns
    const patterns = await ctx.db.query('patterns').collect()
    const patternMap = new Map(patterns.map((p) => [p.name, p._id]))

    const exercises = [
      // Push exercises
      { pattern: 'push', name: 'Bench Press' },
      { pattern: 'push', name: 'Incline Bench Press' },
      { pattern: 'push', name: 'Push-ups' },
      { pattern: 'push', name: 'Dumbbell Press' },
      { pattern: 'push', name: 'Pec Deck' },

      // Pull exercises
      { pattern: 'pull', name: 'Pull-ups' },
      { pattern: 'pull', name: 'Barbell Row' },
      { pattern: 'pull', name: 'Lat Pulldown' },
      { pattern: 'pull', name: 'Cable Row' },
      { pattern: 'pull', name: 'Face Pulls' },

      // Squat exercises
      { pattern: 'squat', name: 'Back Squat' },
      { pattern: 'squat', name: 'Front Squat' },
      { pattern: 'squat', name: 'Goblet Squat' },
      { pattern: 'squat', name: 'Leg Press' },

      // Hinge exercises
      { pattern: 'hinge', name: 'Deadlift' },
      { pattern: 'hinge', name: 'Romanian Deadlift' },
      { pattern: 'hinge', name: 'Good Mornings' },
      { pattern: 'hinge', name: 'Hip Thrusts' },

      // Lunge exercises
      { pattern: 'lunge', name: 'Forward Lunge' },
      { pattern: 'lunge', name: 'Reverse Lunge' },
      { pattern: 'lunge', name: 'Bulgarian Split Squat' },
      { pattern: 'lunge', name: 'Walking Lunges' },

      // Twist exercises
      { pattern: 'twist', name: 'Cable Woodchops' },
      { pattern: 'twist', name: 'Russian Twists' },
      { pattern: 'twist', name: 'Pallof Press' },
    ]

    let created = 0
    let skipped = 0

    for (const exercise of exercises) {
      const patternId = patternMap.get(exercise.pattern)
      if (!patternId) {
        console.error(`Pattern not found: ${exercise.pattern}`)
        continue
      }

      // Check if exercise already exists
      const existing = await ctx.db
        .query('exercises')
        .withIndex('patternId_name', (q) =>
          q.eq('patternId', patternId).eq('name', exercise.name),
        )
        .first()

      if (!existing) {
        await ctx.db.insert('exercises', {
          name: exercise.name,
          patternId,
        })
        created++
        console.log(`Created exercise: ${exercise.name} (${exercise.pattern})`)
      } else {
        skipped++
        console.log(`Exercise already exists: ${exercise.name}`)
      }
    }

    return { created, skipped, total: exercises.length }
  },
})

/**
 * Seed everything in one go
 * Run with: npx convex run seed:seedAll
 */
export const seedAll = mutation({
  handler: async (ctx) => {
    console.log('Seeding patterns...')

    // Seed patterns
    const patterns = [
      {
        name: 'push',
        displayName: 'Push',
        order: 1,
        description: 'Chest, shoulders, triceps',
      },
      {
        name: 'pull',
        displayName: 'Pull',
        order: 2,
        description: 'Back, biceps, rear delts',
      },
      {
        name: 'squat',
        displayName: 'Squat',
        order: 3,
        description: 'Quad-dominant leg movements',
      },
      {
        name: 'hinge',
        displayName: 'Hinge',
        order: 4,
        description: 'Hip-dominant posterior chain',
      },
      {
        name: 'lunge',
        displayName: 'Lunge',
        order: 5,
        description: 'Unilateral leg movements',
      },
      {
        name: 'twist',
        displayName: 'Twist',
        order: 6,
        description: 'Rotational core movements',
      },
    ]

    const patternIds: Record<string, any> = {}
    let patternsCreated = 0

    for (const pattern of patterns) {
      const existing = await ctx.db
        .query('patterns')
        .withIndex('name', (q) => q.eq('name', pattern.name))
        .first()

      if (!existing) {
        const id = await ctx.db.insert('patterns', pattern)
        patternIds[pattern.name] = id
        patternsCreated++
        console.log(`Created pattern: ${pattern.displayName}`)
      } else {
        patternIds[pattern.name] = existing._id
        console.log(`Pattern already exists: ${pattern.displayName}`)
      }
    }

    console.log('Seeding exercises...')

    // Seed exercises
    const patternMap = new Map(
      Object.entries(patternIds).map(([name, id]) => [name, id]),
    )

    const exercises = [
      { pattern: 'push', name: 'Bench Press' },
      { pattern: 'push', name: 'Incline Bench Press' },
      { pattern: 'push', name: 'Push-ups' },
      { pattern: 'push', name: 'Dumbbell Press' },
      { pattern: 'push', name: 'Pec Deck' },
      { pattern: 'pull', name: 'Pull-ups' },
      { pattern: 'pull', name: 'Barbell Row' },
      { pattern: 'pull', name: 'Lat Pulldown' },
      { pattern: 'pull', name: 'Cable Row' },
      { pattern: 'pull', name: 'Face Pulls' },
      { pattern: 'squat', name: 'Back Squat' },
      { pattern: 'squat', name: 'Front Squat' },
      { pattern: 'squat', name: 'Goblet Squat' },
      { pattern: 'squat', name: 'Leg Press' },
      { pattern: 'hinge', name: 'Deadlift' },
      { pattern: 'hinge', name: 'Romanian Deadlift' },
      { pattern: 'hinge', name: 'Good Mornings' },
      { pattern: 'hinge', name: 'Hip Thrusts' },
      { pattern: 'lunge', name: 'Forward Lunge' },
      { pattern: 'lunge', name: 'Reverse Lunge' },
      { pattern: 'lunge', name: 'Bulgarian Split Squat' },
      { pattern: 'lunge', name: 'Walking Lunges' },
      { pattern: 'twist', name: 'Cable Woodchops' },
      { pattern: 'twist', name: 'Russian Twists' },
      { pattern: 'twist', name: 'Pallof Press' },
    ]

    let exercisesCreated = 0
    let exercisesSkipped = 0

    for (const exercise of exercises) {
      const patternId = patternMap.get(exercise.pattern)
      if (!patternId) {
        console.error(`Pattern not found: ${exercise.pattern}`)
        continue
      }

      const existing = await ctx.db
        .query('exercises')
        .withIndex('patternId_name', (q) =>
          q.eq('patternId', patternId).eq('name', exercise.name),
        )
        .first()

      if (!existing) {
        await ctx.db.insert('exercises', {
          name: exercise.name,
          patternId: patternId,
        })
        exercisesCreated++
        console.log(`Created exercise: ${exercise.name} (${exercise.pattern})`)
      } else {
        exercisesSkipped++
        console.log(`Exercise already exists: ${exercise.name}`)
      }
    }

    return {
      patterns: { created: patternsCreated, total: patterns.length },
      exercises: {
        created: exercisesCreated,
        skipped: exercisesSkipped,
        total: exercises.length,
      },
    }
  },
})

/**
 * Clear all workout data for a user (sets, workouts, mesocycles)
 * Run with: npx convex run seed:clearUserData --args '{"userId": "your-user-id"}'
 */
export const clearUserData = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Delete all sets for user's workouts
    const workouts = await ctx.db
      .query('workouts')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()

    let setsDeleted = 0
    for (const workout of workouts) {
      const sets = await ctx.db
        .query('sets')
        .withIndex('workoutId', (q) => q.eq('workoutId', workout._id))
        .collect()

      for (const set of sets) {
        await ctx.db.delete(set._id)
        setsDeleted++
      }
    }

    // Delete all workouts
    let workoutsDeleted = 0
    for (const workout of workouts) {
      await ctx.db.delete(workout._id)
      workoutsDeleted++
    }

    // Delete all mesocycles
    const mesocycles = await ctx.db
      .query('mesocycles')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()

    let mesocyclesDeleted = 0
    for (const mesocycle of mesocycles) {
      await ctx.db.delete(mesocycle._id)
      mesocyclesDeleted++
    }

    return {
      setsDeleted,
      workoutsDeleted,
      mesocyclesDeleted,
    }
  },
})

/**
 * Seed realistic placeholder workout data for a user
 * Creates 2-3 mesocycles with completed workouts and sets
 * Run with: npx convex run seed:seedUserWorkoutData --args '{"userId": "your-user-id"}'
 */
export const seedUserWorkoutData = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get patterns and exercises
    const patterns = await ctx.db.query('patterns').collect()
    const exercises = await ctx.db.query('exercises').collect()

    if (patterns.length === 0 || exercises.length === 0) {
      throw new Error(
        'Patterns and exercises must be seeded first. Run seed:seedAll',
      )
    }

    const patternMap = new Map(patterns.map((p) => [p.name, p._id]))

    // Validate required patterns exist
    const pushPatternId = patternMap.get('push')
    const pullPatternId = patternMap.get('pull')
    const squatPatternId = patternMap.get('squat')
    const hingePatternId = patternMap.get('hinge')

    if (
      !pushPatternId ||
      !pullPatternId ||
      !squatPatternId ||
      !hingePatternId
    ) {
      throw new Error(
        `Missing required patterns. Found: ${Array.from(patternMap.keys()).join(', ')}`,
      )
    }

    const exerciseMap = new Map<string, any>()
    exercises.forEach((e) => {
      const pattern = patterns.find((p) => p._id === e.patternId)
      if (pattern) {
        const key = `${pattern.name}:${e.name}`
        exerciseMap.set(key, e)
      }
    })

    const now = Date.now()
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000
    const oneDayMs = 24 * 60 * 60 * 1000

    // Mesocycle 1: Push + Pull (6 weeks, completed)
    const meso1Start = now - 8 * oneWeekMs // Started 8 weeks ago
    const meso1Id = await ctx.db.insert('mesocycles', {
      userId: args.userId,
      name: 'Push + Pull Focus',
      startDate: meso1Start,
      durationWeeks: 6,
      primaryPatterns: [pushPatternId, pullPatternId],
      targetSetsPerWeek: 15,
      sessionsPerWeek: 3,
      wasPreviouslyTraining: true,
      restTimeMinutes: 3,
      status: 'completed',
      currentWeek: 6,
    })

    // Create workouts for mesocycle 1 (3 sessions/week for 6 weeks = 18 workouts)
    // Reduced to 2 weeks for faster seeding (6 workouts)
    const meso1Workouts = []
    for (let week = 1; week <= 2; week++) {
      for (let session = 0; session < 3; session++) {
        const workoutDate =
          meso1Start + (week - 1) * oneWeekMs + session * 2 * oneDayMs
        const startedAt = workoutDate
        const completedAt = startedAt + (45 + Math.random() * 30) * 60 * 1000 // 45-75 min workouts

        const workoutId = await ctx.db.insert('workouts', {
          userId: args.userId,
          mesocycleId: meso1Id,
          date: workoutDate,
          weekNumber: week,
          completed: true,
          startedAt,
          completedAt,
        })

        // Add sets for Push pattern (Bench Press)
        const benchPress = exerciseMap.get('push:Bench Press')
        if (benchPress) {
          const baseWeight = 80 + week * 2.5 // Progressive overload
          for (let set = 1; set <= 5; set++) {
            const weight = baseWeight + (set === 1 ? -5 : 0) // First set lighter
            const reps = 8 + Math.floor(Math.random() * 3) // 8-10 reps
            const setStart = startedAt + set * 3 * 60 * 1000 // 3 min between sets
            const setEnd = setStart + (30 + Math.random() * 20) * 1000 // 30-50 sec per set

            await ctx.db.insert('sets', {
              workoutId,
              patternId: pushPatternId,
              exerciseId: benchPress._id,
              weight: Math.round(weight * 10) / 10,
              reps,
              orderInWorkout: (set - 1) * 2 + 1,
              startTime: setStart,
              endTime: setEnd,
              duration: Math.floor((setEnd - setStart) / 1000),
            })
          }
        }

        // Add sets for Pull pattern (Pull-ups)
        const pullUps = exerciseMap.get('pull:Pull-ups')
        if (pullUps) {
          const baseReps = 8 + week // Progressive overload
          for (let set = 1; set <= 4; set++) {
            const reps = baseReps + Math.floor(Math.random() * 2)
            const setStart = startedAt + (5 + set) * 3 * 60 * 1000
            const setEnd = setStart + (20 + Math.random() * 15) * 1000

            await ctx.db.insert('sets', {
              workoutId,
              patternId: pullPatternId,
              exerciseId: pullUps._id,
              weight: 0, // Bodyweight
              reps,
              orderInWorkout: set * 2,
              startTime: setStart,
              endTime: setEnd,
              duration: Math.floor((setEnd - setStart) / 1000),
            })
          }
        }

        meso1Workouts.push(workoutId)
      }
    }

    // Mesocycle 2: Squat + Hinge (4 weeks, completed)
    const meso2Start = now - 4 * oneWeekMs // Started 4 weeks ago
    const meso2Id = await ctx.db.insert('mesocycles', {
      userId: args.userId,
      name: 'Leg Strength Focus',
      startDate: meso2Start,
      durationWeeks: 4,
      primaryPatterns: [squatPatternId, hingePatternId],
      targetSetsPerWeek: 12,
      sessionsPerWeek: 2,
      wasPreviouslyTraining: true,
      restTimeMinutes: 4,
      status: 'completed',
      currentWeek: 4,
    })

    // Create workouts for mesocycle 2 (2 sessions/week for 4 weeks = 8 workouts)
    // Reduced to 2 weeks for faster seeding (4 workouts)
    for (let week = 1; week <= 2; week++) {
      for (let session = 0; session < 2; session++) {
        const workoutDate =
          meso2Start + (week - 1) * oneWeekMs + session * 3 * oneDayMs
        const startedAt = workoutDate
        const completedAt = startedAt + (50 + Math.random() * 25) * 60 * 1000

        const workoutId = await ctx.db.insert('workouts', {
          userId: args.userId,
          mesocycleId: meso2Id,
          date: workoutDate,
          weekNumber: week,
          completed: true,
          startedAt,
          completedAt,
        })

        // Add sets for Squat pattern (Back Squat)
        const backSquat = exerciseMap.get('squat:Back Squat')
        if (backSquat) {
          const baseWeight = 100 + week * 5
          for (let set = 1; set <= 4; set++) {
            const weight = baseWeight + (set === 1 ? -10 : 0)
            const reps = 6 + Math.floor(Math.random() * 2)
            const setStart = startedAt + set * 4 * 60 * 1000 // 4 min rest
            const setEnd = setStart + (40 + Math.random() * 20) * 1000

            await ctx.db.insert('sets', {
              workoutId,
              patternId: squatPatternId,
              exerciseId: backSquat._id,
              weight: Math.round(weight * 10) / 10,
              reps,
              orderInWorkout: set,
              startTime: setStart,
              endTime: setEnd,
              duration: Math.floor((setEnd - setStart) / 1000),
            })
          }
        }

        // Add sets for Hinge pattern (Deadlift)
        const deadlift = exerciseMap.get('hinge:Deadlift')
        if (deadlift) {
          const baseWeight = 140 + week * 5
          for (let set = 1; set <= 3; set++) {
            const weight = baseWeight + (set === 1 ? -10 : 0)
            const reps = 5 + Math.floor(Math.random() * 2)
            const setStart = startedAt + (4 + set) * 4 * 60 * 1000
            const setEnd = setStart + (45 + Math.random() * 25) * 1000

            await ctx.db.insert('sets', {
              workoutId,
              patternId: hingePatternId,
              exerciseId: deadlift._id,
              weight: Math.round(weight * 10) / 10,
              reps,
              orderInWorkout: 4 + set,
              startTime: setStart,
              endTime: setEnd,
              duration: Math.floor((setEnd - setStart) / 1000),
            })
          }
        }
      }
    }

    // Mesocycle 3: Push (6 weeks, active - in progress)
    const meso3Start = now - 2 * oneWeekMs // Started 2 weeks ago
    const meso3Id = await ctx.db.insert('mesocycles', {
      userId: args.userId,
      name: 'Upper Body Hypertrophy',
      startDate: meso3Start,
      durationWeeks: 6,
      primaryPatterns: [pushPatternId],
      targetSetsPerWeek: 18,
      sessionsPerWeek: 3,
      wasPreviouslyTraining: true,
      restTimeMinutes: 2,
      status: 'active',
      currentWeek: 2,
    })

    // Create workouts for mesocycle 3 (3 sessions/week, 2 weeks completed = 6 workouts)
    for (let week = 1; week <= 2; week++) {
      for (let session = 0; session < 3; session++) {
        const workoutDate =
          meso3Start + (week - 1) * oneWeekMs + session * 2 * oneDayMs
        const startedAt = workoutDate
        const completedAt = startedAt + (40 + Math.random() * 20) * 60 * 1000

        const workoutId = await ctx.db.insert('workouts', {
          userId: args.userId,
          mesocycleId: meso3Id,
          date: workoutDate,
          weekNumber: week,
          completed: true,
          startedAt,
          completedAt,
        })

        // Add sets for Push pattern (Incline Bench Press)
        const inclineBench = exerciseMap.get('push:Incline Bench Press')
        if (inclineBench) {
          const baseWeight = 70 + week * 2
          for (let set = 1; set <= 6; set++) {
            const weight = baseWeight
            const reps = 10 + Math.floor(Math.random() * 3)
            const setStart = startedAt + set * 2 * 60 * 1000 // 2 min rest
            const setEnd = setStart + (25 + Math.random() * 15) * 1000

            await ctx.db.insert('sets', {
              workoutId,
              patternId: pushPatternId,
              exerciseId: inclineBench._id,
              weight: Math.round(weight * 10) / 10,
              reps,
              orderInWorkout: set,
              startTime: setStart,
              endTime: setEnd,
              duration: Math.floor((setEnd - setStart) / 1000),
            })
          }
        }
      }
    }

    return {
      mesocyclesCreated: 3,
      mesocycle1Id: meso1Id,
      mesocycle2Id: meso2Id,
      mesocycle3Id: meso3Id,
      workoutsCreated: meso1Workouts.length + 4 + 6,
    }
  },
})

/**
 * Seed many workouts for testing pagination (creates 50+ workouts)
 * Run with: npx convex run seed:seedManyWorkouts --args '{"userId": "your-user-id"}'
 */
export const seedManyWorkouts = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get patterns and exercises
    const patterns = await ctx.db.query('patterns').collect()
    const exercises = await ctx.db.query('exercises').collect()

    if (patterns.length === 0 || exercises.length === 0) {
      throw new Error(
        'Patterns and exercises must be seeded first. Run seed:seedAll',
      )
    }

    const patternMap = new Map(patterns.map((p) => [p.name, p._id]))
    const pushPatternId = patternMap.get('push')
    const pullPatternId = patternMap.get('pull')

    if (!pushPatternId || !pullPatternId) {
      throw new Error('Missing required patterns')
    }

    const exerciseMap = new Map<string, any>()
    exercises.forEach((e) => {
      const pattern = patterns.find((p) => p._id === e.patternId)
      if (pattern) {
        const key = `${pattern.name}:${e.name}`
        exerciseMap.set(key, e)
      }
    })

    const now = Date.now()
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000
    const oneDayMs = 24 * 60 * 60 * 1000

    // Create a completed mesocycle for these workouts
    const mesoStart = now - 20 * oneWeekMs // Started 20 weeks ago
    const mesoId = await ctx.db.insert('mesocycles', {
      userId: args.userId,
      name: 'Pagination Test Mesocycle',
      startDate: mesoStart,
      durationWeeks: 20,
      primaryPatterns: [pushPatternId, pullPatternId],
      targetSetsPerWeek: 15,
      sessionsPerWeek: 3,
      wasPreviouslyTraining: true,
      restTimeMinutes: 3,
      status: 'completed',
      currentWeek: 20,
    })

    // Create 50+ workouts (3 sessions/week for 20 weeks = 60 workouts)
    let workoutsCreated = 0
    const benchPress = exerciseMap.get('push:Bench Press')
    const pullUps = exerciseMap.get('pull:Pull-ups')

    for (let week = 1; week <= 20; week++) {
      for (let session = 0; session < 3; session++) {
        const workoutDate =
          mesoStart + (week - 1) * oneWeekMs + session * 2 * oneDayMs
        const startedAt = workoutDate
        const completedAt = startedAt + (45 + Math.random() * 30) * 60 * 1000

        const workoutId = await ctx.db.insert('workouts', {
          userId: args.userId,
          mesocycleId: mesoId,
          date: workoutDate,
          weekNumber: week,
          completed: true,
          startedAt,
          completedAt,
        })

        // Add sets for Push pattern
        if (benchPress) {
          const baseWeight = 80 + week * 2.5
          for (let set = 1; set <= 5; set++) {
            const weight = baseWeight + (set === 1 ? -5 : 0)
            const reps = 8 + Math.floor(Math.random() * 3)
            const setStart = startedAt + set * 3 * 60 * 1000
            const setEnd = setStart + (30 + Math.random() * 20) * 1000

            await ctx.db.insert('sets', {
              workoutId,
              patternId: pushPatternId,
              exerciseId: benchPress._id,
              weight: Math.round(weight * 10) / 10,
              reps,
              orderInWorkout: (set - 1) * 2 + 1,
              startTime: setStart,
              endTime: setEnd,
              duration: Math.floor((setEnd - setStart) / 1000),
            })
          }
        }

        // Add sets for Pull pattern
        if (pullUps) {
          const baseReps = 8 + week
          for (let set = 1; set <= 4; set++) {
            const reps = baseReps + Math.floor(Math.random() * 2)
            const setStart = startedAt + (5 + set) * 3 * 60 * 1000
            const setEnd = setStart + (20 + Math.random() * 15) * 1000

            await ctx.db.insert('sets', {
              workoutId,
              patternId: pullPatternId,
              exerciseId: pullUps._id,
              weight: 0,
              reps,
              orderInWorkout: set * 2,
              startTime: setStart,
              endTime: setEnd,
              duration: Math.floor((setEnd - setStart) / 1000),
            })
          }
        }

        workoutsCreated++
      }
    }

    return {
      mesocycleId: mesoId,
      workoutsCreated,
    }
  },
})
