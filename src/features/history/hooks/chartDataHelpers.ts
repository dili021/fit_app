import type { Doc } from '../../../../convex/_generated/dataModel'

/**
 * Transform pattern volume data for charts
 */
export function transformPatternVolumeData(
  patternVolume: Array<{
    workoutId: string
    date: number
    weekNumber: number
    sets: number
    totalVolume: number
  }>,
): Array<{ date: number; volume: number; sets: number }> {
  return patternVolume.map((item) => ({
    date: item.date,
    volume: item.totalVolume,
    sets: item.sets,
  }))
}

/**
 * Transform exercise progress data for charts
 */
export function transformExerciseProgressData(
  exerciseProgress: Array<{
    workoutId: string
    date: number
    weekNumber: number
    sets: Array<{
      weight: number
      reps: number
      orderInWorkout: number
    }>
  }>,
): Array<{
  date: number
  sets: Array<{
    weight: number
    reps: number
    orderInWorkout: number
  }>
}> {
  return exerciseProgress.map((item) => ({
    date: item.date,
    sets: item.sets,
  }))
}

/**
 * Transform mesocycle comparison data for charts
 */
export function transformMesocycleComparisonData(
  mesocycles: Array<Doc<'mesocycles'>>,
  patternVolumeMap: Map<
    string,
    Array<{
      workoutId: string
      date: number
      weekNumber: number
      sets: number
      totalVolume: number
    }>
  >,
): Array<{
  mesocycleId: string
  mesocycleName: string
  totalVolume: number
  totalSets: number
  averageVolumePerWorkout: number
  averageSetsPerWorkout: number
}> {
  return mesocycles.map((mesocycle) => {
    const volumeData = patternVolumeMap.get(mesocycle._id) || []
    const totalVolume = volumeData.reduce((sum, d) => sum + d.totalVolume, 0)
    const totalSets = volumeData.reduce((sum, d) => sum + d.sets, 0)
    const workoutCount = volumeData.length

    return {
      mesocycleId: mesocycle._id,
      mesocycleName: mesocycle.name || `Mesocycle ${mesocycle._id}`,
      totalVolume,
      totalSets,
      averageVolumePerWorkout:
        workoutCount > 0 ? totalVolume / workoutCount : 0,
      averageSetsPerWorkout: workoutCount > 0 ? totalSets / workoutCount : 0,
    }
  })
}
