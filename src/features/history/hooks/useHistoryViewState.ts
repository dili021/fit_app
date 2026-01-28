import { useState } from 'react'
import type { Id } from '../../../../convex/_generated/dataModel'

/**
 * Hook for managing history view state (selected view, expanded workout, date dialog)
 */
export function useHistoryViewState() {
  const [selectedView, setSelectedView] = useState<
    'list' | 'calendar' | 'charts'
  >('list')
  const [expandedWorkout, setExpandedWorkout] = useState<Id<'workouts'> | null>(
    null,
  )
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false)

  const handleToggleExpand = (workoutId: Id<'workouts'>) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsDateDialogOpen(true)
  }

  return {
    selectedView,
    setSelectedView,
    expandedWorkout,
    handleToggleExpand,
    selectedDate,
    handleDateClick,
    isDateDialogOpen,
    setIsDateDialogOpen,
  }
}
