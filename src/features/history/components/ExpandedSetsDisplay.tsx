import type { Doc, Id } from '../../../../convex/_generated/dataModel'

interface ExpandedSetsDisplayProps {
  workoutSets: Array<Doc<'sets'>>
  exercises: Array<Doc<'exercises'>> | undefined
  patterns: Array<Doc<'patterns'>> | undefined
}

/**
 * Component for displaying expanded workout sets grouped by pattern and exercise
 */
export function ExpandedSetsDisplay({
  workoutSets,
  exercises,
  patterns,
}: ExpandedSetsDisplayProps) {
  // Group sets by pattern, then by exercise
  const groupedByPattern = workoutSets.reduce(
    (acc, set) => {
      const exercise = exercises?.find((e) => e._id === set.exerciseId)
      const pattern = patterns?.find((p) => p._id === set.patternId)

      if (!exercise || !pattern) return acc

      if (!(set.patternId in acc)) {
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
            sets: typeof workoutSets
          }
        >
      }
    >,
  )

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-semibold mb-3">Sets</h4>
      <div className="space-y-4">
        {Object.values(groupedByPattern).map((patternGroup) => {
          const patternSets = Object.values(patternGroup.exercises).flatMap(
            (e) => e.sets,
          )
          const patternTotalSets = patternSets.length

          return (
            <div key={patternGroup.patternId} className="space-y-2">
              {/* Pattern Header */}
              <div className="flex items-center justify-between pb-1 border-b">
                <h5 className="text-sm font-semibold">
                  {patternGroup.patternName}
                </h5>
                <div className="text-xs text-muted-foreground">
                  {patternTotalSets} {patternTotalSets === 1 ? 'set' : 'sets'}
                </div>
              </div>

              {/* Exercises in this pattern */}
              <div className="space-y-2 ml-2">
                {Object.values(patternGroup.exercises).map((exerciseGroup) => (
                  <div key={exerciseGroup.exerciseId} className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      {exerciseGroup.exerciseName}
                    </div>
                    <div className="space-y-1">
                      {exerciseGroup.sets
                        .sort((a, b) => a.orderInWorkout - b.orderInWorkout)
                        .map((set) => (
                          <div
                            key={set._id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium w-8">
                                #{set.orderInWorkout}
                              </span>
                              <div className="font-medium">
                                {set.weight}kg × {set.reps} reps
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(set.weight * set.reps)} kg
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
