import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import {
  useExpandedWorkoutSets,
  useHistoryQueries,
  useSelectedDateSets,
} from '@/features/history/hooks/api/useHistoryQueries'
import { useCalendarNavigation } from '@/features/history/hooks/useCalendarNavigation'
import { useInfiniteScroll } from '@/features/history/hooks/useInfiniteScroll'
import { useHistoryViewState } from '@/features/history/hooks/useHistoryViewState'
import { useHistoryCalendarData } from '@/features/history/hooks/useHistoryCalendarData'
import { ViewToggle } from '@/features/history/components/ViewToggle'
import { WorkoutListView } from '@/features/history/components/WorkoutListView'
import { CalendarView } from '@/features/history/components/CalendarView'
import { DateWorkoutDialog } from '@/features/history/components/DateWorkoutDialog'
import { ChartsView } from '@/features/history/components/ChartsView'
import { HistoryLoadingState } from '@/features/history/components/HistoryLoadingState'
import { HistoryEmptyState } from '@/features/history/components/HistoryEmptyState'

export const Route = createFileRoute('/history/')({
  component: History,
})

function History() {
  const { userId, isPending } = useAuth()

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <HistoryContent userId={userId!} />
    </ProtectedRoute>
  )
}

function HistoryContent({ userId }: { userId: string }) {
  const {
    selectedView,
    setSelectedView,
    expandedWorkout,
    handleToggleExpand,
    selectedDate,
    handleDateClick,
    isDateDialogOpen,
    setIsDateDialogOpen,
  } = useHistoryViewState()

  // Data fetching hooks
  const {
    workouts,
    allWorkouts,
    mesocycles,
    patterns,
    exercises,
    status,
    loadMore,
    isLoadingMore,
  } = useHistoryQueries(userId)

  // Calendar navigation hook
  const {
    calendarMonth,
    calendarYear,
    handlePreviousMonth,
    handleNextMonth,
    handleToday,
    isCurrentMonth,
    canNavigateNext,
  } = useCalendarNavigation()

  // Infinite scroll hook
  const loadMoreRef = useInfiniteScroll(
    selectedView,
    status,
    isLoadingMore,
    loadMore,
  )

  // Expanded workout sets
  const expandedWorkoutSets = useExpandedWorkoutSets(expandedWorkout)

  // Calendar data
  const {
    selectedDateWorkouts,
    workoutsInSelectedMonth,
    calendarDates,
    monthYearDisplay,
  } = useHistoryCalendarData({
    allWorkouts,
    calendarYear,
    calendarMonth,
    selectedDate,
  })

  // Get sets for selected date workouts
  const selectedDateWorkoutIds = selectedDateWorkouts.map((w) => w._id)
  const allSetsForSelectedDate = useSelectedDateSets(selectedDateWorkoutIds)

  // Handle loading state
  if (status === 'LoadingFirstPage') {
    return <HistoryLoadingState />
  }

  if (workouts.length === 0) {
    return <HistoryEmptyState />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workout History</h1>
        <p className="text-muted-foreground">
          View your training progress and statistics
        </p>
      </div>

      {/* View Toggle */}
      <ViewToggle selectedView={selectedView} onViewChange={setSelectedView} />

      {/* List View */}
      {selectedView === 'list' && (
        <WorkoutListView
          workouts={workouts}
          mesocycles={mesocycles}
          patterns={patterns}
          exercises={exercises}
          expandedWorkout={expandedWorkout}
          expandedWorkoutSets={expandedWorkoutSets || undefined}
          onToggleExpand={handleToggleExpand}
          status={status}
          isLoadingMore={isLoadingMore}
          loadMore={loadMore}
          loadMoreRef={loadMoreRef}
        />
      )}

      {/* Calendar View */}
      {selectedView === 'calendar' && (
        <CalendarView
          calendarDates={calendarDates}
          monthYearDisplay={monthYearDisplay}
          workoutsInSelectedMonth={workoutsInSelectedMonth}
          isCurrentMonth={isCurrentMonth}
          canNavigateNext={canNavigateNext}
          handlePreviousMonth={handlePreviousMonth}
          handleNextMonth={handleNextMonth}
          handleToday={handleToday}
          onDateClick={handleDateClick}
          totalWorkouts={allWorkouts?.length || 0}
        />
      )}

      {/* Date Workout Dialog */}
      <DateWorkoutDialog
        open={isDateDialogOpen}
        onOpenChange={setIsDateDialogOpen}
        selectedDate={selectedDate}
        selectedDateWorkouts={selectedDateWorkouts}
        allSetsForSelectedDate={allSetsForSelectedDate}
        mesocycles={mesocycles}
        patterns={patterns}
        exercises={exercises}
      />

      {/* Charts View */}
      {selectedView === 'charts' && (
        <ChartsView
          userId={userId}
          workouts={workouts}
          mesocycles={mesocycles}
          patterns={patterns}
          exercises={exercises}
        />
      )}
    </div>
  )
}
