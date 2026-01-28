import type { Doc, Id } from '../../../../convex/_generated/dataModel'

/**
 * Get sets for a specific mesocycle
 */
function getMesocycleSets(
  allSets: Array<Doc<'sets'>>,
  workouts: Array<Doc<'workouts'>> | undefined,
  mesocycleId: Id<'mesocycles'>,
): Array<Doc<'sets'>> {
  if (!workouts) return []

  const workoutIds = new Set(
    workouts.filter((w) => w.mesocycleId === mesocycleId).map((w) => w._id),
  )

  return allSets.filter((set) => workoutIds.has(set.workoutId))
}

/**
 * Calculate mesocycle statistics
 */
function calculateMesocycleStats(
  mesocycleSets: Array<Doc<'sets'>>,
  workouts: Array<Doc<'workouts'>> | undefined,
  mesocycleId: Id<'mesocycles'>,
): {
  totalVolume: number
  totalSets: number
  avgVolumePerWorkout: number
} {
  const totalVolume = mesocycleSets.reduce(
    (sum, s) => sum + s.weight * s.reps,
    0,
  )
  const totalSets = mesocycleSets.length

  const mesocycleWorkouts = workouts
    ? workouts.filter((w) => w.mesocycleId === mesocycleId && w.completed)
    : []

  const avgVolumePerWorkout =
    mesocycleWorkouts.length > 0 ? totalVolume / mesocycleWorkouts.length : 0

  return { totalVolume, totalSets, avgVolumePerWorkout }
}

/**
 * Create mesocycle name from patterns
 */
function createMesocycleName(
  mesocycle: Doc<'mesocycles'>,
  patterns: Array<Doc<'patterns'>>,
): string {
  if (mesocycle.name) return mesocycle.name

  const primaryPatternNames = mesocycle.primaryPatterns
    .map((patternId) => {
      const pattern = patterns.find((p) => p._id === patternId)
      return pattern?.displayName ?? null
    })
    .filter((name): name is string => name !== null)
    .join(' + ')

  return primaryPatternNames || `Mesocycle ${mesocycle._id.slice(-6)}`
}

/**
 * Transform mesocycle to comparison data
 */
export function transformMesocycleToComparisonData(
  mesocycle: Doc<'mesocycles'>,
  allSets: Array<Doc<'sets'>>,
  workouts: Array<Doc<'workouts'>> | undefined,
  patterns: Array<Doc<'patterns'>>,
): {
  name: string
  totalVolume: number
  totalSets: number
  avgVolumePerWorkout: number
  duration: number
} {
  const mesocycleSets = getMesocycleSets(allSets, workouts, mesocycle._id)
  const stats = calculateMesocycleStats(mesocycleSets, workouts, mesocycle._id)
  const name = createMesocycleName(mesocycle, patterns)

  return {
    name,
    totalVolume: stats.totalVolume,
    totalSets: stats.totalSets,
    avgVolumePerWorkout: stats.avgVolumePerWorkout,
    duration: mesocycle.durationWeeks,
  }
}
