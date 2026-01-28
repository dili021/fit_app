import type { Doc, Id } from './_generated/dataModel'

export interface TemplateItem {
  patternId: Id<'patterns'>
  patternName: string
  sets: number
  isPrimary: boolean
}

export interface WorkoutTemplateResult {
  template: Array<TemplateItem>
  currentWeek: number
  setsPerPrimaryPatternPerSession: number
  totalSetsPerSession: number
  isDeloadWeek: boolean
}

/**
 * Calculate sets multiplier based on build-up and deload logic
 */
export function calculateSetsMultiplier(
  wasPreviouslyTraining: boolean,
  currentWeek: number,
  isDeloadWeek: boolean,
): number {
  let multiplier = 1.0

  if (!wasPreviouslyTraining) {
    if (currentWeek <= 2) {
      multiplier = 0.5
    } else if (currentWeek <= 4) {
      multiplier = 0.75
    }
    // Week 5+ uses 1.0 (full volume)
  }

  // Apply deload reduction (50% of current volume) in final week
  if (isDeloadWeek) {
    multiplier *= 0.5
  }

  return multiplier
}

/**
 * Build template for week 1 (before mesocycle starts)
 */
export function buildWeek1Template(
  mesocycle: Doc<'mesocycles'>,
  allPatterns: Array<Doc<'patterns'>>,
  targetSetsPerWeek: number,
  sessionsPerWeek: number,
): Array<TemplateItem> {
  const numPrimaryPatterns = mesocycle.primaryPatterns.length
  const setsPerPrimaryPatternPerWeek = Math.round(
    targetSetsPerWeek / numPrimaryPatterns,
  )
  const setsPerPrimaryPatternPerSession = Math.floor(
    setsPerPrimaryPatternPerWeek / sessionsPerWeek,
  )

  const template: Array<TemplateItem> = []

  // Add primary patterns
  for (const patternId of mesocycle.primaryPatterns) {
    const pattern = allPatterns.find((p) => p._id === patternId)
    if (pattern) {
      template.push({
        patternId,
        patternName: pattern.displayName,
        sets: setsPerPrimaryPatternPerSession,
        isPrimary: true,
      })
    }
  }

  // Add maintenance patterns
  const maintenancePatterns = allPatterns.filter(
    (p) => !mesocycle.primaryPatterns.includes(p._id),
  )
  for (const pattern of maintenancePatterns) {
    template.push({
      patternId: pattern._id,
      patternName: pattern.displayName,
      sets: 1,
      isPrimary: false,
    })
  }

  return template
}

interface BuildCurrentWeekTemplateParams {
  mesocycle: Doc<'mesocycles'>
  allPatterns: Array<Doc<'patterns'>>
  targetSetsPerWeek: number
  sessionsPerWeek: number
  setsMultiplier: number
}

/**
 * Build template for current week
 */
export function buildCurrentWeekTemplate({
  mesocycle,
  allPatterns,
  targetSetsPerWeek,
  sessionsPerWeek,
  setsMultiplier,
}: BuildCurrentWeekTemplateParams): Array<TemplateItem> {
  const numPrimaryPatterns = mesocycle.primaryPatterns.length
  const setsPerPrimaryPatternPerWeek = Math.round(
    (targetSetsPerWeek / numPrimaryPatterns) * setsMultiplier,
  )
  const setsPerPrimaryPatternPerSession = Math.floor(
    setsPerPrimaryPatternPerWeek / sessionsPerWeek,
  )

  const template: Array<TemplateItem> = []

  // Add primary patterns
  for (const patternId of mesocycle.primaryPatterns) {
    const pattern = allPatterns.find((p) => p._id === patternId)
    if (pattern) {
      template.push({
        patternId,
        patternName: pattern.displayName,
        sets: setsPerPrimaryPatternPerSession,
        isPrimary: true,
      })
    }
  }

  // Add maintenance patterns
  const maintenancePatterns = allPatterns.filter(
    (p) => !mesocycle.primaryPatterns.includes(p._id),
  )
  for (const pattern of maintenancePatterns) {
    template.push({
      patternId: pattern._id,
      patternName: pattern.displayName,
      sets: 1,
      isPrimary: false,
    })
  }

  return template
}
