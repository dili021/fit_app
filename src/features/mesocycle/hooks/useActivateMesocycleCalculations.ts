/**
 * Hook for calculating mesocycle activation values
 */
export function useActivateMesocycleCalculations(params: {
  mesocycle: { primaryPatterns: Array<unknown> } | null | undefined
  patterns: Array<unknown> | undefined
  setsPerPrimaryPatternPerWeek: number | null
  sessionsPerWeek: number | null
}) {
  const { mesocycle, patterns, setsPerPrimaryPatternPerWeek, sessionsPerWeek } =
    params

  const numPrimaryPatterns = mesocycle?.primaryPatterns.length || 1
  const totalSetsPerWeek =
    setsPerPrimaryPatternPerWeek && numPrimaryPatterns > 0
      ? setsPerPrimaryPatternPerWeek * numPrimaryPatterns
      : null

  const setsPerPrimaryPatternPerSession =
    setsPerPrimaryPatternPerWeek && sessionsPerWeek
      ? Math.floor(setsPerPrimaryPatternPerWeek / sessionsPerWeek)
      : null

  const totalSetsPerSession =
    totalSetsPerWeek && sessionsPerWeek
      ? Math.floor(totalSetsPerWeek / sessionsPerWeek)
      : null

  const numSecondaryPatterns =
    mesocycle && patterns
      ? patterns.length - mesocycle.primaryPatterns.length
      : 0

  const totalSetsPerSessionWithSecondary =
    totalSetsPerSession !== null
      ? totalSetsPerSession + numSecondaryPatterns
      : null

  const isValidDistribution =
    setsPerPrimaryPatternPerWeek && sessionsPerWeek
      ? setsPerPrimaryPatternPerWeek % sessionsPerWeek === 0
      : true

  return {
    numPrimaryPatterns,
    totalSetsPerWeek,
    setsPerPrimaryPatternPerSession,
    totalSetsPerSession,
    numSecondaryPatterns,
    totalSetsPerSessionWithSecondary,
    isValidDistribution,
  }
}
