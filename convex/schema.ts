import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Movement patterns (Push, Pull, Squat, Hinge, Lunge, Twist)
  patterns: defineTable({
    name: v.string(), // "push", "pull", etc.
    displayName: v.string(), // "Push", "Pull", etc.
    order: v.number(), // Used for workout template ordering - primary patterns come first
    description: v.optional(v.string()),
  }).index('name', ['name']),

  // Exercises within each pattern
  exercises: defineTable({
    name: v.string(), // "Bench Press"
    patternId: v.id('patterns'),
    metadata: v.optional(v.any()), // extensible for future features (form cues, equipment, etc.)
  })
    .index('patternId', ['patternId'])
    .index('patternId_name', ['patternId', 'name']),

  // Training mesocycles (user's training blocks)
  mesocycles: defineTable({
    userId: v.string(), // from Better Auth
    name: v.optional(v.string()), // "Winter Bulk", etc.
    startDate: v.optional(v.number()), // timestamp (set during activation)
    durationWeeks: v.number(), // default 6
    primaryPatterns: v.array(v.id('patterns')), // 1-2 patterns
    targetSetsPerWeek: v.optional(v.number()), // 12, 15, or 18 (divisible by sessionsPerWeek, set during activation)
    sessionsPerWeek: v.optional(v.number()), // 2-7 (set during activation)
    wasPreviouslyTraining: v.optional(v.boolean()), // affects build-up (set during activation)
    restTimeMinutes: v.optional(v.number()), // default 3 min rest between sets (set during activation)
    status: v.string(), // "active", "completed", "deload", "planned"
    currentWeek: v.optional(v.number()), // calculated field for progress (only relevant when active)
    order: v.optional(v.number()), // for drag-and-drop reordering of inactive mesocycles
  })
    .index('userId', ['userId'])
    .index('userId_status', ['userId', 'status']),

  // Individual workout sessions
  workouts: defineTable({
    userId: v.string(),
    mesocycleId: v.id('mesocycles'),
    date: v.number(), // timestamp
    weekNumber: v.number(), // week within mesocycle
    completed: v.boolean(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index('userId', ['userId'])
    .index('mesocycleId', ['mesocycleId'])
    .index('userId_date', ['userId', 'date']),

  // Individual sets within a workout
  sets: defineTable({
    workoutId: v.id('workouts'),
    patternId: v.id('patterns'),
    exerciseId: v.id('exercises'),
    weight: v.number(), // in kg or lbs
    reps: v.number(),
    orderInWorkout: v.number(), // 1, 2, 3... for sequence
    startTime: v.number(), // when set started
    endTime: v.number(), // when set completed
    duration: v.number(), // actual time taken in seconds
    suggestedWeightChange: v.optional(v.string()), // "increase", "decrease", "maintain"
  })
    .index('workoutId', ['workoutId'])
    .index('patternId', ['patternId'])
    .index('exerciseId', ['exerciseId'])
    .index('workoutId_order', ['workoutId', 'orderInWorkout']),
})
