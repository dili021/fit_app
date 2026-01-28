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
    query: <T extends 'patterns' | 'exercises'>(
      table: T,
    ) => {
      collect: () => Promise<
        T extends 'patterns'
          ? Array<Doc<'patterns'>>
          : T extends 'exercises'
            ? Array<Doc<'exercises'>>
            : never
      >
    }
    insert: (
      table: string,
      data: MesocycleInsertData,
    ) => Promise<Id<'mesocycles'>>
    patch: (id: Id<'mesocycles'>, patch: { userId: string }) => Promise<void>
    [key: string]: unknown // Allow other properties from Convex context
  }
}

/**
 * Setup data for seedManyWorkouts
 */
export async function setupSeedManyWorkoutsData(ctx: DatabaseContext): Promise<{
  patternMap: Map<string, Id<'patterns'>>
  pushPatternId: Id<'patterns'>
  pullPatternId: Id<'patterns'>
  exerciseMap: Map<string, Doc<'exercises'>>
  mesoId: Id<'mesocycles'>
  mesoStart: number
  oneWeekMs: number
  oneDayMs: number
}> {
  const patterns = await ctx.db.query<'patterns'>('patterns').collect()
  const exercises = await ctx.db.query<'exercises'>('exercises').collect()

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

  const exerciseMap = new Map<string, Doc<'exercises'>>()
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

  const mesoStart = now - 20 * oneWeekMs
  const mesocycleData: MesocycleInsertData = {
    userId: '', // Will be set by caller
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
  }
  const mesoId = await ctx.db.insert('mesocycles', mesocycleData)

  return {
    patternMap,
    pushPatternId,
    pullPatternId,
    exerciseMap,
    mesoId,
    mesoStart,
    oneWeekMs,
    oneDayMs,
  }
}
