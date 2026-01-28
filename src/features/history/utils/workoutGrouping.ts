import type { Doc } from '@db/_generated/dataModel'

/**
 * Group workouts by date for calendar view
 */
export function groupWorkoutsByDate(
  workouts: Array<Doc<'workouts'>> | undefined,
): Record<string, Array<Doc<'workouts'>>> {
  if (!workouts) return {}

  return workouts.reduce(
    (acc, workout) => {
      const dateKey = new Date(workout.date).toDateString()
      if (!(dateKey in acc)) {
        acc[dateKey] = []
      }
      acc[dateKey].push(workout)
      return acc
    },
    {} as Record<string, Array<Doc<'workouts'>>>,
  )
}

/**
 * Get workouts count for selected month
 */
export function getWorkoutsInSelectedMonth(
  workouts: Array<Doc<'workouts'>> | undefined,
  year: number,
  month: number,
): number {
  if (!workouts) return 0

  const firstDay = new Date(year, month, 1).getTime()
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime()

  return workouts.filter((workout) => {
    const workoutDate = workout.date
    return workoutDate >= firstDay && workoutDate <= lastDay
  }).length
}

/**
 * Get calendar dates for selected month
 */
export function getCalendarDates(
  year: number,
  month: number,
  workoutsByDate: Record<string, Array<Doc<'workouts'>>>,
): Array<{
  date: Date
  hasWorkout: boolean
  workoutCount: number
}> {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const dates: Array<{
    date: Date
    hasWorkout: boolean
    workoutCount: number
  }> = []

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    dates.push({
      date: new Date(year, month, -startingDayOfWeek + i + 1),
      hasWorkout: false,
      workoutCount: 0,
    })
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateKey = date.toDateString()
    const workoutCount =
      dateKey in workoutsByDate ? workoutsByDate[dateKey].length : 0
    dates.push({
      date,
      hasWorkout: workoutCount > 0,
      workoutCount,
    })
  }

  return dates
}
