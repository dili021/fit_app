import { getMonthYearDisplay } from '../utils/dateFormatters'
import {
  getCalendarDates,
  getWorkoutsInSelectedMonth,
  groupWorkoutsByDate,
} from '../utils/workoutGrouping'
import type { Doc } from '../../../../convex/_generated/dataModel'

interface UseHistoryCalendarDataProps {
  allWorkouts: Array<Doc<'workouts'>> | undefined
  calendarYear: number
  calendarMonth: number
  selectedDate: Date | null
}

/**
 * Hook for preparing calendar-related data
 */
export function useHistoryCalendarData({
  allWorkouts,
  calendarYear,
  calendarMonth,
  selectedDate,
}: UseHistoryCalendarDataProps) {
  const workoutsByDate = groupWorkoutsByDate(allWorkouts)

  const selectedDateKey = selectedDate?.toDateString()
  const selectedDateWorkouts =
    selectedDateKey && selectedDateKey in workoutsByDate
      ? workoutsByDate[selectedDateKey]
      : []

  const workoutsInSelectedMonth = getWorkoutsInSelectedMonth(
    allWorkouts,
    calendarYear,
    calendarMonth,
  )
  const calendarDates = getCalendarDates(
    calendarYear,
    calendarMonth,
    workoutsByDate,
  )
  const monthYearDisplay = getMonthYearDisplay(calendarYear, calendarMonth)

  return {
    workoutsByDate,
    selectedDateWorkouts,
    workoutsInSelectedMonth,
    calendarDates,
    monthYearDisplay,
  }
}
