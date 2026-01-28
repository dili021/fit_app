import type { Doc } from './_generated/dataModel'

/**
 * Calculate mesocycle status info when mesocycle has no start date
 */
export function getStatusInfoWithoutStartDate(mesocycle: Doc<'mesocycles'>) {
  return {
    status: mesocycle.status,
    currentWeek: undefined,
    durationWeeks: mesocycle.durationWeeks,
    isDeloadWeek: false,
    isPastDeload: false,
    needsCompletion: false,
  }
}

/**
 * Calculate mesocycle status info when mesocycle hasn't started yet
 */
export function getStatusInfoBeforeStart(mesocycle: Doc<'mesocycles'>) {
  return {
    status: mesocycle.status,
    currentWeek: 1,
    durationWeeks: mesocycle.durationWeeks,
    isDeloadWeek: false,
    isPastDeload: false,
    needsCompletion: false,
  }
}

/**
 * Calculate mesocycle status info for active mesocycle
 */
export function getStatusInfoForActiveMesocycle(
  mesocycle: Doc<'mesocycles'>,
  elapsed: number,
) {
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
}
