import type { Doc } from './_generated/dataModel'

/**
 * Calculate current week from start date
 */
export function calculateCurrentWeekFromStart(
  startDate: number,
  durationWeeks: number,
): number {
  const now = Date.now()
  const elapsed = now - startDate
  if (elapsed < 0) {
    return 1
  }
  const weeksElapsed = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000))
  return Math.min(weeksElapsed + 1, durationWeeks)
}

/**
 * Check if mesocycle should enter deload week
 */
export function shouldEnterDeloadWeek(
  mesocycle: Doc<'mesocycles'>,
  currentWeek: number,
): boolean {
  return (
    currentWeek === mesocycle.durationWeeks && mesocycle.status === 'active'
  )
}

/**
 * Check if deload week has ended and mesocycle should be completed
 */
export function shouldCompleteDeloadWeek(
  mesocycle: Doc<'mesocycles'>,
  weeksElapsed: number,
): boolean {
  return (
    weeksElapsed >= mesocycle.durationWeeks && mesocycle.status === 'deload'
  )
}

/**
 * Check if current week needs updating
 */
export function shouldUpdateCurrentWeek(
  mesocycle: Doc<'mesocycles'>,
  currentWeek: number,
): boolean {
  return mesocycle.status === 'active' && currentWeek !== mesocycle.currentWeek
}
