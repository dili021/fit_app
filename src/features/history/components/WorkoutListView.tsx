import { WorkoutCard } from './WorkoutCard'
import { ExpandedSetsDisplay } from './ExpandedSetsDisplay'
import type { Doc, Id } from '@db/_generated/dataModel'
import { Button } from '@/components/ui/button'

interface WorkoutListViewProps {
  workouts: Array<Doc<'workouts'>>
  mesocycles: Array<Doc<'mesocycles'>> | undefined
  patterns: Array<Doc<'patterns'>> | undefined
  exercises: Array<Doc<'exercises'>> | undefined
  expandedWorkout: Id<'workouts'> | null
  expandedWorkoutSets: Array<Doc<'sets'>> | undefined
  onToggleExpand: (workoutId: Id<'workouts'>) => void
  status: 'CanLoadMore' | 'LoadingMore' | 'LoadingFirstPage' | 'Exhausted'
  isLoadingMore: boolean
  loadMore: (numItems: number) => void
  loadMoreRef: React.RefObject<HTMLDivElement | null>
}

export function WorkoutListView({
  workouts,
  mesocycles,
  patterns,
  exercises,
  expandedWorkout,
  expandedWorkoutSets,
  onToggleExpand,
  status,
  isLoadingMore,
  loadMore,
  loadMoreRef,
}: WorkoutListViewProps) {
  return (
    <div className="space-y-4">
      {workouts.map((workout) => {
        const mesocycle = mesocycles?.find((m) => m._id === workout.mesocycleId)
        const isExpanded = expandedWorkout === workout._id

        return (
          <WorkoutCard
            key={workout._id}
            workout={workout}
            mesocycle={mesocycle}
            patterns={patterns}
            isExpanded={isExpanded}
            onToggleExpand={() => onToggleExpand(workout._id)}
            workoutSets={isExpanded ? expandedWorkoutSets || null : null}
            expandedContent={
              isExpanded &&
              expandedWorkoutSets &&
              expandedWorkoutSets.length > 0 ? (
                <ExpandedSetsDisplay
                  workoutSets={expandedWorkoutSets}
                  exercises={exercises}
                  patterns={patterns}
                />
              ) : null
            }
          />
        )
      })}

      {/* Load More Trigger */}
      {status === 'CanLoadMore' && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => loadMore(10)}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {status === 'LoadingMore' && (
        <div className="flex justify-center py-4">
          <p className="text-sm text-muted-foreground">
            Loading more workouts...
          </p>
        </div>
      )}

      {status === 'Exhausted' && workouts.length > 0 && (
        <div className="flex justify-center py-4">
          <p className="text-sm text-muted-foreground">
            No more workouts to load
          </p>
        </div>
      )}
    </div>
  )
}
