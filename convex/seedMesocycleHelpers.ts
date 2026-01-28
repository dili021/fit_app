import type { Doc, Id } from './_generated/dataModel'

interface MesocycleInsertData {
  userId: string
  name: string
  startDate: number
  durationWeeks: number
  primaryPatterns: Array<Id<'patterns'>>
  targetSetsPerWeek: number
  sessionsPerWeek: number
  wasPreviouslyTraining: boolean
  restTimeMinutes: number
  status: 'completed' | 'active'
  currentWeek: number
}

interface DatabaseContext {
  db: {
    insert: (
      table: string,
      data: MesocycleInsertData,
    ) => Promise<Id<'mesocycles'>>
    query: (table: 'patterns' | 'exercises') => {
      collect: () => Promise<Array<Doc<'patterns'>> | Array<Doc<'exercises'>>>
    }
    patch?: (id: Id<'mesocycles'>, patch: { userId: string }) => Promise<void>
    [key: string]: unknown // Allow other properties from Convex context
  }
}

/**
 * Validate patterns exist
 */
export function validatePatterns(patternMap: Map<string, Id<'patterns'>>): {
  pushPatternId: Id<'patterns'>
  pullPatternId: Id<'patterns'>
  squatPatternId: Id<'patterns'>
  hingePatternId: Id<'patterns'>
} {
  const pushPatternId = patternMap.get('push')
  const pullPatternId = patternMap.get('pull')
  const squatPatternId = patternMap.get('squat')
  const hingePatternId = patternMap.get('hinge')

  if (!pushPatternId || !pullPatternId || !squatPatternId || !hingePatternId) {
    throw new Error(
      `Missing required patterns. Found: ${Array.from(patternMap.keys()).join(', ')}`,
    )
  }

  return { pushPatternId, pullPatternId, squatPatternId, hingePatternId }
}

/**
 * Build exercise map from exercises and patterns
 */
export function buildExerciseMap(
  exercises: Array<Doc<'exercises'>>,
  patterns: Array<Doc<'patterns'>>,
): Map<string, Doc<'exercises'>> {
  const exerciseMap = new Map<string, Doc<'exercises'>>()
  exercises.forEach((e) => {
    const pattern = patterns.find((p) => p._id === e.patternId)
    if (pattern) {
      const key = `${pattern.name}:${e.name}`
      exerciseMap.set(key, e)
    }
  })
  return exerciseMap
}

/**
 * Create mesocycle 1 (Push + Pull)
 */
export async function createMesocycle1(
  ctx: DatabaseContext,
  params: {
    userId: string
    meso1Start: number
    pushPatternId: Id<'patterns'>
    pullPatternId: Id<'patterns'>
  },
): Promise<Id<'mesocycles'>> {
  return await ctx.db.insert('mesocycles', {
    userId: params.userId,
    name: 'Push + Pull Focus',
    startDate: params.meso1Start,
    durationWeeks: 6,
    primaryPatterns: [params.pushPatternId, params.pullPatternId],
    targetSetsPerWeek: 15,
    sessionsPerWeek: 3,
    wasPreviouslyTraining: true,
    restTimeMinutes: 3,
    status: 'completed',
    currentWeek: 6,
  })
}

/**
 * Create mesocycle 2 (Squat + Hinge)
 */
export async function createMesocycle2(
  ctx: DatabaseContext,
  params: {
    userId: string
    meso2Start: number
    squatPatternId: Id<'patterns'>
    hingePatternId: Id<'patterns'>
  },
): Promise<Id<'mesocycles'>> {
  return await ctx.db.insert('mesocycles', {
    userId: params.userId,
    name: 'Leg Strength Focus',
    startDate: params.meso2Start,
    durationWeeks: 4,
    primaryPatterns: [params.squatPatternId, params.hingePatternId],
    targetSetsPerWeek: 12,
    sessionsPerWeek: 2,
    wasPreviouslyTraining: true,
    restTimeMinutes: 4,
    status: 'completed',
    currentWeek: 4,
  })
}

/**
 * Create mesocycle 3 (Push - active)
 */
export async function createMesocycle3(
  ctx: DatabaseContext,
  params: {
    userId: string
    meso3Start: number
    pushPatternId: Id<'patterns'>
  },
): Promise<Id<'mesocycles'>> {
  return await ctx.db.insert('mesocycles', {
    userId: params.userId,
    name: 'Upper Body Hypertrophy',
    startDate: params.meso3Start,
    durationWeeks: 6,
    primaryPatterns: [params.pushPatternId],
    targetSetsPerWeek: 18,
    sessionsPerWeek: 3,
    wasPreviouslyTraining: true,
    restTimeMinutes: 2,
    status: 'active',
    currentWeek: 2,
  })
}
