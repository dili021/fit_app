import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Get the active mesocycle for a user
 */
export const getActiveMesocycle = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('mesocycles')
      .withIndex('userId_status', (q) =>
        q.eq('userId', args.userId).eq('status', 'active'),
      )
      .first()
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
    const allMesocycles = await ctx.db
      .query('mesocycles')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()

    // Sort: active first, then by order field (ascending), then by creation time
    return allMesocycles.sort((a, b) => {
      // Active mesocycle always first
      if (a.status === 'active' && b.status !== 'active') return -1
      if (b.status === 'active' && a.status !== 'active') return 1

      // For non-active mesocycles, sort by order field
      if (a.status !== 'active' && b.status !== 'active') {
        const orderA = a.order ?? 0
        const orderB = b.order ?? 0
        if (orderA !== orderB) return orderA - orderB
      }

      // Fallback to creation time (descending)
      return b._creationTime - a._creationTime
    })
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
    const inactiveMesocycles = await ctx.db
      .query('mesocycles')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()

    const inactiveOrders = inactiveMesocycles
      .filter((m) => m.status !== 'active' && m.order !== undefined)
      .map((m) => m.order!)

    const nextOrder =
      inactiveOrders.length > 0 ? Math.max(...inactiveOrders) + 1 : 0

    // Create new mesocycle with "planned" status
    const mesocycleId = await ctx.db.insert('mesocycles', {
      userId: args.userId,
      durationWeeks: args.durationWeeks,
      primaryPatterns: args.primaryPatterns,
      status: 'planned',
      order: nextOrder,
    })

    return mesocycleId
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
      throw new Error('Mesocycle not found')
    }

    if (mesocycle.status !== 'planned') {
      throw new Error('Can only activate planned mesocycles')
    }

    // Check if there's already an active mesocycle
    const existingActive = await ctx.db
      .query('mesocycles')
      .withIndex('userId_status', (q) =>
        q.eq('userId', mesocycle.userId).eq('status', 'active'),
      )
      .first()

    if (existingActive) {
      throw new Error(
        'Cannot activate a mesocycle while another is active. Please conclude the active mesocycle first.',
      )
    }

    // Activate the mesocycle
    await ctx.db.patch(args.mesocycleId, {
      status: 'active',
      startDate: Date.now(),
      sessionsPerWeek: args.sessionsPerWeek,
      targetSetsPerWeek: args.targetSetsPerWeek,
      restTimeMinutes: args.restTimeMinutes,
      wasPreviouslyTraining: args.wasPreviouslyTraining,
      currentWeek: 1,
      order: undefined, // Clear order when activated (active is always first)
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
      throw new Error('Mesocycle not found')
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
    const mesocycles = await ctx.db
      .query('mesocycles')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()

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
      throw new Error('Mesocycle not found')
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
      throw new Error('Mesocycle not found')
    }

    if (mesocycle.status === 'completed') {
      return {
        status: 'completed',
        action: 'none',
        currentWeek: mesocycle.currentWeek,
      }
    }

    // Can only check status for active or deload mesocycles with startDate
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

    // Calculate current week
    const now = Date.now()
    const elapsed = now - mesocycle.startDate

    // If mesocycle hasn't started yet (startDate is in the future), don't update status
    if (elapsed < 0) {
      return {
        status: mesocycle.status,
        action: 'none',
        currentWeek: mesocycle.currentWeek ?? 1,
      }
    }

    const weeksElapsed = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000))
    const currentWeek = Math.min(weeksElapsed + 1, mesocycle.durationWeeks)

    // Check if we've entered the final week (deload week)
    if (
      currentWeek === mesocycle.durationWeeks &&
      mesocycle.status === 'active'
    ) {
      await ctx.db.patch(args.mesocycleId, {
        status: 'deload',
        currentWeek,
      })
      return { status: 'deload', action: 'entered_deload', currentWeek }
    }

    // Check if deload week has ended (more than durationWeeks weeks have passed)
    // Only mark as completed if we're actually past the end date
    // Refetch mesocycle to get updated status (in case it was just changed to deload above)
    const updatedMesocycle = await ctx.db.get(args.mesocycleId)
    if (
      updatedMesocycle &&
      weeksElapsed >= updatedMesocycle.durationWeeks &&
      updatedMesocycle.status === 'deload'
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

    // Update current week if still active
    if (
      mesocycle.status === 'active' &&
      currentWeek !== mesocycle.currentWeek
    ) {
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
      throw new Error('Mesocycle not found')
    }

    // Calculate current week (only if mesocycle is active)
    if (!mesocycle.startDate) {
      return {
        status: mesocycle.status,
        currentWeek: undefined,
        durationWeeks: mesocycle.durationWeeks,
        isDeloadWeek: false,
        isPastDeload: false,
        needsCompletion: false,
      }
    }

    const now = Date.now()
    const elapsed = now - mesocycle.startDate

    // If mesocycle hasn't started yet (startDate is in the future), return early
    if (elapsed < 0) {
      return {
        status: mesocycle.status,
        currentWeek: 1,
        durationWeeks: mesocycle.durationWeeks,
        isDeloadWeek: false,
        isPastDeload: false,
        needsCompletion: false,
      }
    }

    const weeksElapsed = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000))
    const currentWeek = Math.min(weeksElapsed + 1, mesocycle.durationWeeks)
    const isDeloadWeek = currentWeek === mesocycle.durationWeeks
    const isPastDeload = weeksElapsed >= mesocycle.durationWeeks

    return {
      status: mesocycle.status,
      currentWeek,
      durationWeeks: mesocycle.durationWeeks,
      isDeloadWeek,
      isPastDeload,
      needsCompletion: mesocycle.status === 'deload' && isPastDeload,
    }
  },
})
