import type { Doc } from '@db/_generated/dataModel'

/**
 * Hook to calculate macrocycle completion time
 */
export function useMacrocycleCompletion(
  planningMesocycles: Array<Doc<'mesocycles'>>,
) {
  if (planningMesocycles.length === 0) {
    return null
  }

  const activeMesocycle = planningMesocycles.find((m) => m.status === 'active')
  const plannedMesocycles = planningMesocycles.filter(
    (m) => m.status === 'planned',
  )

  if (!activeMesocycle && plannedMesocycles.length === 0) {
    return null
  }

  let startDate: number
  let totalWeeks = 0

  if (activeMesocycle?.startDate) {
    startDate = activeMesocycle.startDate
    totalWeeks += activeMesocycle.durationWeeks

    plannedMesocycles.forEach((m) => {
      totalWeeks += m.durationWeeks
    })
  } else if (plannedMesocycles.length > 0) {
    startDate = Date.now()
    plannedMesocycles.forEach((m) => {
      totalWeeks += m.durationWeeks
    })
  } else {
    return null
  }

  return startDate + totalWeeks * 7 * 24 * 60 * 60 * 1000
}
