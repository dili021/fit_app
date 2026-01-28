import { buildUserIdStatusQuery } from './mesocycleQueryHelpers'
import type { Doc, Id } from './_generated/dataModel'
import type { IndexRange, IndexRangeBuilder } from 'convex/server'

interface DatabaseContext {
  db: {
    query: (table: string) => {
      withIndex: (
        index: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (q: IndexRangeBuilder<any, any, any>) => IndexRange,
      ) => { first: () => Promise<unknown> }
    }
  }
}

/**
 * Check if mesocycle can be activated
 */
export function canActivateMesocycle(
  mesocycle: Doc<'mesocycles'> | null,
): boolean {
  return mesocycle !== null && mesocycle.status === 'planned'
}

/**
 * Check if there's already an active mesocycle for a user
 */
export async function hasActiveMesocycle(
  ctx: DatabaseContext,
  userId: string,
): Promise<boolean> {
  const query = ctx.db.query('mesocycles')
  const indexedQuery = query.withIndex('userId_status', (q) =>
    buildUserIdStatusQuery(q, userId, 'active'),
  )
  const existingActive = await indexedQuery.first()
  return existingActive !== null
}

/**
 * Activate mesocycle with given parameters
 */
interface MesocyclePatch {
  status: 'active'
  startDate: number
  sessionsPerWeek: number
  targetSetsPerWeek: number
  restTimeMinutes: number
  wasPreviouslyTraining: boolean
  currentWeek: number
  order: undefined
}

export async function activateMesocycleWithParams(
  ctx: {
    db: {
      patch: (id: Id<'mesocycles'>, patch: MesocyclePatch) => Promise<void>
    }
  },
  mesocycleId: Id<'mesocycles'>,
  params: {
    sessionsPerWeek: number
    targetSetsPerWeek: number
    restTimeMinutes: number
    wasPreviouslyTraining: boolean
  },
): Promise<void> {
  await ctx.db.patch(mesocycleId, {
    status: 'active',
    startDate: Date.now(),
    sessionsPerWeek: params.sessionsPerWeek,
    targetSetsPerWeek: params.targetSetsPerWeek,
    restTimeMinutes: params.restTimeMinutes,
    wasPreviouslyTraining: params.wasPreviouslyTraining,
    currentWeek: 1,
    order: undefined, // Clear order when activated (active is always first)
  })
}
