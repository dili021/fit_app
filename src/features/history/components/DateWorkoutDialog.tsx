import {
  formatTime,
  formatWorkoutDate,
  getWorkoutDuration,
} from '../utils/dateFormatters'
import { ExpandedSetsDisplay } from './ExpandedSetsDisplay'
import type { Doc } from '../../../../convex/_generated/dataModel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DateWorkoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  selectedDateWorkouts: Array<Doc<'workouts'>>
  allSetsForSelectedDate: Array<Doc<'sets'>> | undefined
  mesocycles: Array<Doc<'mesocycles'>> | undefined
  patterns: Array<Doc<'patterns'>> | undefined
  exercises: Array<Doc<'exercises'>> | undefined
}

export function DateWorkoutDialog({
  open,
  onOpenChange,
  selectedDate,
  selectedDateWorkouts,
  allSetsForSelectedDate,
  mesocycles,
  patterns,
  exercises,
}: DateWorkoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && formatWorkoutDate(selectedDate.getTime())}
            </DialogTitle>
            <DialogDescription>
              {selectedDateWorkouts.length}{' '}
              {selectedDateWorkouts.length === 1 ? 'workout' : 'workouts'}{' '}
              completed
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <div className="space-y-4">
            {selectedDateWorkouts.map((workout) => {
              const mesocycle = mesocycles?.find(
                (m) => m._id === workout.mesocycleId,
              )
              const duration = getWorkoutDuration(workout)
              const workoutSets =
                allSetsForSelectedDate?.filter(
                  (s) => s.workoutId === workout._id,
                ) || []

              // Calculate stats
              const stats =
                workoutSets.length > 0
                  ? {
                      totalSets: workoutSets.length,
                      totalVolume: workoutSets.reduce(
                        (sum, s) => sum + s.weight * s.reps,
                        0,
                      ),
                      exercises: new Set(workoutSets.map((s) => s.exerciseId))
                        .size,
                    }
                  : null

              return (
                <Card key={workout._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {workout.startedAt && formatTime(workout.startedAt)}
                          {duration && ` • ${duration}`}
                        </CardTitle>
                        {mesocycle && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {patterns?.find((p) =>
                                mesocycle.primaryPatterns.includes(p._id),
                              )?.displayName || 'Mesocycle'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Week {workout.weekNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {stats && (
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-2xl font-bold">
                            {stats.totalSets}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total Sets
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {Math.round(stats.totalVolume)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total Volume (kg)
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {stats.exercises}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Exercises
                          </div>
                        </div>
                      </div>

                      {workoutSets.length > 0 && (
                        <ExpandedSetsDisplay
                          workoutSets={workoutSets}
                          exercises={exercises}
                          patterns={patterns}
                        />
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
