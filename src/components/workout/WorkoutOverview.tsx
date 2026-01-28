import { Check } from 'lucide-react'
import type { Id } from '../../../convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Set {
  _id: Id<'sets'>
  exerciseId: Id<'exercises'>
  patternId: Id<'patterns'>
  weight: number
  reps: number
  duration: number
  orderInWorkout: number
  startTime: number
  endTime: number
}

interface Exercise {
  _id: Id<'exercises'>
  name: string
  patternId: Id<'patterns'>
}

interface Pattern {
  _id: Id<'patterns'>
  displayName: string
}

interface WorkoutOverviewProps {
  sets: Array<Set>
  exercises: Array<Exercise>
  patterns: Array<Pattern>
  totalSessionTime: number // Total session time in seconds
  onComplete: () => void
}

export function WorkoutOverview({
  sets,
  exercises,
  patterns,
  totalSessionTime,
  onComplete,
}: WorkoutOverviewProps) {
  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Group sets by pattern, then by exercise
  const groupedByPattern = sets.reduce(
    (acc, set) => {
      const exercise = exercises.find((e) => e._id === set.exerciseId)
      const pattern = patterns.find((p) => p._id === set.patternId)

      if (!exercise || !pattern) return acc

      if (!set.patternId) {
        acc[set.patternId] = {
          patternId: set.patternId,
          patternName: pattern.displayName,
          exercises: {},
        }
      }

      if (!(set.exerciseId in acc[set.patternId].exercises)) {
        acc[set.patternId].exercises[set.exerciseId] = {
          exerciseId: set.exerciseId,
          exerciseName: exercise.name,
          sets: [],
        }
      }

      acc[set.patternId].exercises[set.exerciseId].sets.push(set)
      return acc
    },
    {} as Record<
      Id<'patterns'>,
      {
        patternId: Id<'patterns'>
        patternName: string
        exercises: Record<
          Id<'exercises'>,
          {
            exerciseId: Id<'exercises'>
            exerciseName: string
            sets: Array<Set>
          }
        >
      }
    >,
  )

  // Calculate totals
  const totalSets = sets.length
  const totalVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0)

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Workout Complete!</h1>
            <p className="text-muted-foreground">Review your workout summary</p>
          </div>

          {/* Summary Stats */}
          <div className="space-y-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total Sets
                  </div>
                  <div className="text-2xl font-bold">{totalSets}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total Volume
                  </div>
                  <div className="text-2xl font-bold">
                    {totalVolume.toFixed(0)} kg
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total Time
                  </div>
                  <div className="text-2xl font-bold">
                    {formatTime(totalSessionTime)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exercise Breakdown - Grouped by Pattern */}
          <div className="space-y-6">
            {Object.values(groupedByPattern).map((patternGroup) => {
              const patternSets = Object.values(patternGroup.exercises).flatMap(
                (e) => e.sets,
              )
              const patternTotalSets = patternSets.length

              return (
                <div key={patternGroup.patternId} className="space-y-3">
                  {/* Pattern Header */}
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h2 className="text-xl font-semibold">
                      {patternGroup.patternName}
                    </h2>
                    <div className="text-sm text-muted-foreground">
                      {patternTotalSets}{' '}
                      {patternTotalSets === 1 ? 'set' : 'sets'}
                    </div>
                  </div>

                  {/* Exercises in this pattern */}
                  <div className="space-y-3">
                    {Object.values(patternGroup.exercises).map(
                      (exerciseGroup) => (
                        <Card key={exerciseGroup.exerciseId}>
                          <CardHeader>
                            <CardTitle>
                              <div className="flex items-center justify-between">
                                <div className="font-semibold">
                                  {exerciseGroup.exerciseName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {exerciseGroup.sets.length}{' '}
                                  {exerciseGroup.sets.length === 1
                                    ? 'set'
                                    : 'sets'}
                                </div>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {exerciseGroup.sets
                                .sort(
                                  (a, b) => a.orderInWorkout - b.orderInWorkout,
                                )
                                .map((set, setIdx) => (
                                  <div
                                    key={set._id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                  >
                                    <div className="flex items-center gap-4">
                                      <span className="text-sm font-medium w-8">
                                        #{setIdx + 1}
                                      </span>
                                      <div className="text-sm">
                                        <span className="font-medium">
                                          {set.weight}kg
                                        </span>
                                        <span className="text-muted-foreground mx-2">
                                          ×
                                        </span>
                                        <span className="font-medium">
                                          {set.reps}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {' '}
                                          reps
                                        </span>
                                      </div>
                                    </div>
                                    {set.duration > 0 && (
                                      <div className="text-sm text-muted-foreground">
                                        {formatTime(set.duration)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onComplete} className="w-full">
            <Check className="h-4 w-4 mr-2" />
            Complete Workout
          </Button>
        </div>
      </div>
    </div>
  )
}
