import { Check } from 'lucide-react'
import { WorkoutSummaryStats } from './WorkoutSummaryStats'
import { PatternGroupSection } from './PatternGroupSection'
import { groupSetsByPattern } from './utils/workoutGrouping'
import type { Id } from '../../../convex/_generated/dataModel'
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
  const groupedByPattern = groupSetsByPattern(sets, exercises, patterns)

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
          <WorkoutSummaryStats
            totalSets={totalSets}
            totalVolume={totalVolume}
            totalSessionTime={totalSessionTime}
            formatTime={formatTime}
          />

          {/* Exercise Breakdown - Grouped by Pattern */}
          <div className="space-y-6">
            {Object.values(groupedByPattern).map((patternGroup) => (
              <PatternGroupSection
                key={patternGroup.patternId}
                patternName={patternGroup.patternName}
                exercises={patternGroup.exercises}
                formatTime={formatTime}
              />
            ))}
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
