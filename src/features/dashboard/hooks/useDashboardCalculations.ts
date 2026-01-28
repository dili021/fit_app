import type { Doc } from '@db/_generated/dataModel'

interface UseDashboardCalculationsProps {
  activeMesocycle: Doc<'mesocycles'> | null | undefined
  mesocycleSets: Array<Doc<'sets'>> | undefined
  mesocycleStatusInfo:
    | {
        currentWeek?: number
        isDeloadWeek?: boolean
        status?: string
      }
    | null
    | undefined
  patterns: Array<Doc<'patterns'>> | undefined
}

/**
 * Hook for dashboard calculations
 */
export function useDashboardCalculations({
  activeMesocycle,
  mesocycleSets,
  mesocycleStatusInfo,
  patterns,
}: UseDashboardCalculationsProps) {
  const calculateCurrentWeek = (
    startDate: number,
    durationWeeks: number,
  ): number => {
    const now = Date.now()
    const elapsed = now - startDate
    const weeksElapsed = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000))
    return Math.min(weeksElapsed + 1, durationWeeks)
  }

  const getCurrentWeek = () => {
    if (mesocycleStatusInfo?.currentWeek !== undefined) {
      return mesocycleStatusInfo.currentWeek
    }
    if (activeMesocycle && activeMesocycle.startDate) {
      return calculateCurrentWeek(
        activeMesocycle.startDate,
        activeMesocycle.durationWeeks,
      )
    }
    return 0
  }

  const currentWeek = getCurrentWeek()

  const isDeloadWeek: boolean =
    mesocycleStatusInfo?.isDeloadWeek ??
    (activeMesocycle && currentWeek === activeMesocycle.durationWeeks) ??
    false
  const isCompleted: boolean =
    activeMesocycle?.status === 'completed' ||
    mesocycleStatusInfo?.status === 'completed' ||
    false

  const mesocycleProgress =
    activeMesocycle && mesocycleSets && activeMesocycle.targetSetsPerWeek
      ? (() => {
          const totalExpectedSets =
            activeMesocycle.targetSetsPerWeek * activeMesocycle.durationWeeks
          const completedSets = mesocycleSets.length
          return totalExpectedSets > 0
            ? (completedSets / totalExpectedSets) * 100
            : 0
        })()
      : 0

  const primaryPatternNames =
    activeMesocycle && patterns
      ? patterns
          .filter((p) => activeMesocycle.primaryPatterns.includes(p._id))
          .map((p) => p.displayName)
      : []

  const mesocycleTitle =
    primaryPatternNames.length > 0
      ? `${primaryPatternNames.join(' and ')} mesocycle`
      : 'Active Mesocycle'

  const formatWorkoutDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  return {
    currentWeek,
    isDeloadWeek,
    isCompleted,
    mesocycleProgress,
    mesocycleTitle,
    formatWorkoutDate,
  }
}
