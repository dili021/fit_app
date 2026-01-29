import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CalendarViewProps {
  calendarDates: Array<{
    date: Date
    hasWorkout: boolean
    workoutCount: number
  }>
  monthYearDisplay: string
  workoutsInSelectedMonth: number
  isCurrentMonth: () => boolean
  canNavigateNext: () => boolean
  handlePreviousMonth: () => void
  handleNextMonth: () => void
  handleToday: () => void
  onDateClick: (date: Date) => void
  totalWorkouts: number
}

export function CalendarView({
  calendarDates,
  monthYearDisplay,
  workoutsInSelectedMonth,
  isCurrentMonth,
  canNavigateNext,
  handlePreviousMonth,
  handleNextMonth,
  handleToday,
  onDateClick,
  totalWorkouts,
}: CalendarViewProps) {
  return (
    <Card>
      <CardContent>
        {/* Month/Year Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            className="min-h-[48px] min-w-[48px]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-lg font-semibold">{monthYearDisplay}</h3>
            <p className="text-sm text-muted-foreground">
              {workoutsInSelectedMonth}{' '}
              {workoutsInSelectedMonth === 1 ? 'workout' : 'workouts'}
            </p>
            {!isCurrentMonth() && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="text-xs mt-1"
              >
                Today
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={!canNavigateNext()}
            className="min-h-[48px] min-w-[48px]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}
          {calendarDates.map((item, index) => (
            <Button
              key={index}
              onClick={(e) => {
                if (item.hasWorkout) {
                  e.currentTarget.blur()
                  onDateClick(item.date)
                }
              }}
              variant={item.hasWorkout ? 'secondary' : 'ghost'}
              disabled={!item.hasWorkout}
              className="aspect-square p-1 h-auto"
            >
              <div
                className={`text-sm ${item.hasWorkout ? 'font-semibold' : 'text-muted-foreground'}`}
              >
                {item.date.getDate()}
              </div>
            </Button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 rounded" />
              <span className="text-muted-foreground">Workout day</span>
            </div>
            <div className="text-muted-foreground">
              Total workouts:{' '}
              <span className="font-semibold">{totalWorkouts}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
