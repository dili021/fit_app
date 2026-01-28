import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import {
  calculateCurrentWeekFromStart,
  shouldCompleteDeloadWeek,
  shouldEnterDeloadWeek,
  shouldUpdateCurrentWeek,
} from './mesocycleStatusHelpers'
import { compareMesocycles } from './mesocycleSortHelpers'
import {
  activateMesocycleWithParams,
  canActivateMesocycle,
  hasActiveMesocycle,
} from './mesocycleActivationHelpers'
import {
  buildUserIdQuery,
  buildUserIdStatusQuery,
} from './mesocycleQueryHelpers'
import {
  getStatusInfoBeforeStart,
  getStatusInfoForActiveMesocycle,
  getStatusInfoWithoutStartDate,
} from './mesocycleStatusInfoHelpers'

const ERROR_MESOCYCLE_NOT_FOUND = 'Mesocycle not found'

/**
 * Get the active mesocycle for a user
 */
export const getActiveMesocycle = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const mesocycleQuery = ctx.db.query('mesocycles')
    const indexedQuery = mesocycleQuery.withIndex('userId_status', (q) =>
      buildUserIdStatusQuery(q, args.userId, 'active'),
    )
    return await indexedQuery.first()
  },
})

/**
 * Get mesocycle by ID
 */
export const getMesocycleById = query({
  args: { id: v.id('mesocycles') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Get all mesocycles for a user
 * Returns active first, then planned/completed ordered by order field
 */
export const getAllMesocycles = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const mesocycleQuery = ctx.db.query('mesocycles')
    const indexedQuery = mesocycleQuery.withIndex('userId', (q) =>
      buildUserIdQuery(q, args.userId),
    )
    const allMesocycles = await indexedQuery.collect()

    // Sort: active first, then by order field (ascending), then by creation time
    return allMesocycles.sort(compareMesocycles)
  },
})

/**
 * Create a new mesocycle (simplified - only duration and patterns)
 * Creates mesocycle with status "planned"
 */
export const createMesocycle = mutation({
  args: {
    userId: v.string(),
    durationWeeks: v.number(),
    primaryPatterns: v.array(v.id('patterns')),
  },
  handler: async (ctx, args) => {
    // Get the highest order value for inactive mesocycles to append new one
    const mesocycleQuery = ctx.db.query('mesocycles')
    const indexedQuery = mesocycleQuery.withIndex('userId', (q) =>
      buildUserIdQuery(q, args.userId),
    )
    const inactiveMesocycles = await indexedQuery.collect()

    const inactiveOrders = inactiveMesocycles
      .filter((m) => m.status !== 'active' && m.order !== undefined)
      .map((m) => m.order!)

    const nextOrder =
      inactiveOrders.length > 0 ? Math.max(...inactiveOrders) + 1 : 0

    // Create new mesocycle with "planned" status
    return await ctx.db.insert('mesocycles', {
      userId: args.userId,
      durationWeeks: args.durationWeeks,
      primaryPatterns: args.primaryPatterns,
      status: 'planned',
      order: nextOrder,
    })
  },
})

/**
 * Activate a planned mesocycle
 * Sets activation fields and changes status from "planned" to "active"
 * Requires that no active mesocycle exists
 */
export const activateMesocycle = mutation({
  args: {
    mesocycleId: v.id('mesocycles'),
    sessionsPerWeek: v.number(),
    targetSetsPerWeek: v.number(),
    restTimeMinutes: v.number(),
    wasPreviouslyTraining: v.boolean(),
  },
  handler: async (ctx, args) => {
    const mesocycle = await ctx.db.get(args.mesocycleId)
    if (!mesocycle) {
      throw new Error(ERROR_MESOCYCLE_NOT_FOUND)
    }

    if (!canActivateMesocycle(mesocycle)) {
      throw new Error('Can only activate planned mesocycles')
    }

    // Check if there's already an active mesocycle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (await hasActiveMesocycle(ctx as any, mesocycle.userId)) {
      throw new Error(
        'Cannot activate a mesocycle while another is active. Please conclude the active mesocycle first.',
      )
    }

    // Activate the mesocycle
    await activateMesocycleWithParams(ctx, args.mesocycleId, {
      sessionsPerWeek: args.sessionsPerWeek,
      targetSetsPerWeek: args.targetSetsPerWeek,
      restTimeMinutes: args.restTimeMinutes,
      wasPreviouslyTraining: args.wasPreviouslyTraining,
    })

    return args.mesocycleId
  },
})

/**
 * Conclude (manually complete) an active mesocycle
 */
export const concludeMesocycle = mutation({
  args: {
    mesocycleId: v.id('mesocycles'),
  },
  handler: async (ctx, args) => {
    const mesocycle = await ctx.db.get(args.mesocycleId)
    if (!mesocycle) {
      throw new Error(ERROR_MESOCYCLE_NOT_FOUND)
    }

    if (mesocycle.status !== 'active' && mesocycle.status !== 'deload') {
      throw new Error('Can only conclude active or deload mesocycles')
    }

    // Mark as completed
    await ctx.db.patch(args.mesocycleId, {
      status: 'completed',
      currentWeek: mesocycle.durationWeeks,
    })

    return args.mesocycleId
  },
})

/**
 * Reorder inactive mesocycles
 */
export const reorderMesocycles = mutation({
  args: {
    userId: v.string(),
    mesocycleOrders: v.array(
      v.object({
        mesocycleId: v.id('mesocycles'),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Verify all mesocycles belong to the user and are not active
    for (const { mesocycleId } of args.mesocycleOrders) {
      const mesocycle = await ctx.db.get(mesocycleId)
      if (!mesocycle || mesocycle.userId !== args.userId) {
        throw new Error('Invalid mesocycle')
      }
      if (mesocycle.status === 'active') {
        throw new Error('Cannot reorder active mesocycle')
      }
    }

    // Update order for each mesocycle
    for (const { mesocycleId, order } of args.mesocycleOrders) {
      await ctx.db.patch(mesocycleId, { order })
    }

    return { success: true }
  },
})

/**
 * Get rest time from most recent completed mesocycle, or return default (3)
 */
export const getPreviousMesocycleRestTime = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const mesocycleQuery = ctx.db.query('mesocycles')
    const indexedQuery = mesocycleQuery.withIndex('userId', (q) =>
      buildUserIdQuery(q, args.userId),
    )
    const mesocycles = await indexedQuery.collect()

    // Find most recent completed mesocycle with restTimeMinutes
    const completedMesocycles = mesocycles
      .filter(
        (m) => m.status === 'completed' && m.restTimeMinutes !== undefined,
      )
      .sort((a, b) => (b.startDate ?? 0) - (a.startDate ?? 0))

    if (
      completedMesocycles.length > 0 &&
      completedMesocycles[0].restTimeMinutes !== undefined
    ) {
      return completedMesocycles[0].restTimeMinutes
    }

    return 3 // Default rest time
  },
})

/**
 * Calculate set distribution for a mesocycle and week
 */
export const calculateSetDistribution = query({
  args: {
    mesocycleId: v.id('mesocycles'),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const mesocycle = await ctx.db.get(args.mesocycleId)
    if (!mesocycle) {
      throw new Error(ERROR_MESOCYCLE_NOT_FOUND)
    }

    // Check if it's the final week (deload week)
    const isDeloadWeek = args.weekNumber === mesocycle.durationWeeks

    // Calculate build-up percentage if needed
    let setsMultiplier = 1.0
    if (!mesocycle.wasPreviouslyTraining) {
      if (args.weekNumber <= 2) {
        setsMultiplier = 0.5
      } else if (args.weekNumber <= 4) {
        setsMultiplier = 0.75
      }
      // Week 5+ uses 1.0 (full volume)
    }

    // Apply deload reduction (50% of current volume) in final week
    if (isDeloadWeek) {
      setsMultiplier *= 0.5
    }

    if (!mesocycle.targetSetsPerWeek || !mesocycle.sessionsPerWeek) {
      throw new Error('Mesocycle is not activated')
    }

    const adjustedSetsPerWeek = Math.round(
      mesocycle.targetSetsPerWeek * setsMultiplier,
    )
    const setsPerSession = Math.floor(
      adjustedSetsPerWeek / mesocycle.sessionsPerWeek,
    )
    const extraSets = adjustedSetsPerWeek % mesocycle.sessionsPerWeek

    return {
      setsPerSession,
      extraSets,
      totalSetsPerWeek: adjustedSetsPerWeek,
      sessionsPerWeek: mesocycle.sessionsPerWeek,
      isDeloadWeek,
    }
  },
})

/**
 * Check and update mesocycle status based on current week
 * Automatically transitions to "deload" when entering final week
 * and "completed" after deload week ends
 */
export const checkAndUpdateMesocycleStatus = mutation({
  args: {
    mesocycleId: v.id('mesocycles'),
  },
  handler: async (ctx, args) => {
    const mesocycle = await ctx.db.get(args.mesocycleId)
    if (!mesocycle) {
      throw new Error(ERROR_MESOCYCLE_NOT_FOUND)
    }

    if (mesocycle.status === 'completed') {
      return {
        status: 'completed',
        action: 'none',
        currentWeek: mesocycle.currentWeek,
      }
    }

    if (
      !mesocycle.startDate ||
      (mesocycle.status !== 'active' && mesocycle.status !== 'deload')
    ) {
      return {
        status: mesocycle.status,
        action: 'none',
        currentWeek: mesocycle.currentWeek,
      }
    }

    const now = Date.now()
    const elapsed = now - mesocycle.startDate

    if (elapsed < 0) {
      return {
        status: mesocycle.status,
        action: 'none',
        currentWeek: mesocycle.currentWeek ?? 1,
      }
    }

    const weeksElapsed = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000))
    const currentWeek = calculateCurrentWeekFromStart(
      mesocycle.startDate,
      mesocycle.durationWeeks,
    )

    if (shouldEnterDeloadWeek(mesocycle, currentWeek)) {
      await ctx.db.patch(args.mesocycleId, {
        status: 'deload',
        currentWeek,
      })
      return { status: 'deload', action: 'entered_deload', currentWeek }
    }

    const updatedMesocycle = await ctx.db.get(args.mesocycleId)
    if (
      updatedMesocycle &&
      shouldCompleteDeloadWeek(updatedMesocycle, weeksElapsed)
    ) {
      await ctx.db.patch(args.mesocycleId, {
        status: 'completed',
        currentWeek: updatedMesocycle.durationWeeks,
      })
      return {
        status: 'completed',
        action: 'completed',
        currentWeek: updatedMesocycle.durationWeeks,
      }
    }

    if (shouldUpdateCurrentWeek(mesocycle, currentWeek)) {
      await ctx.db.patch(args.mesocycleId, { currentWeek })
      return { status: 'active', action: 'updated_week', currentWeek }
    }

    return { status: mesocycle.status, action: 'none', currentWeek }
  },
})

/**
 * Get mesocycle status info including whether it needs completion
 */
export const getMesocycleStatusInfo = query({
  args: {
    mesocycleId: v.id('mesocycles'),
  },
  handler: async (ctx, args) => {
    const mesocycle = await ctx.db.get(args.mesocycleId)
    if (!mesocycle) {
      throw new Error(ERROR_MESOCYCLE_NOT_FOUND)
    }

    if (!mesocycle.startDate) {
      return getStatusInfoWithoutStartDate(mesocycle)
    }

    const now = Date.now()
    const elapsed = now - mesocycle.startDate

    if (elapsed < 0) {
      return getStatusInfoBeforeStart(mesocycle)
    }

    return getStatusInfoForActiveMesocycle(mesocycle, elapsed)
  },
})
