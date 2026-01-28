import { Activity, ChevronDown, ChevronUp } from 'lucide-react'
import {
  formatTime,
  formatWorkoutDate,
  getWorkoutDuration,
} from '../utils/dateFormatters'
import type { Doc } from '@db/_generated/dataModel'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WorkoutCardProps {
  workout: Doc<'workouts'>
  mesocycle: Doc<'mesocycles'> | undefined
  patterns: Array<Doc<'patterns'>> | undefined
  isExpanded: boolean
  onToggleExpand: () => void
  workoutSets: Array<Doc<'sets'>> | null
  expandedContent?: React.ReactNode
}

export function WorkoutCard({
  workout,
  mesocycle,
  patterns,
  isExpanded,
  onToggleExpand,
  workoutSets,
  expandedContent,
}: WorkoutCardProps) {
  const duration = getWorkoutDuration(workout)

  // Calculate stats if sets are loaded
  const stats = workoutSets
    ? {
        totalSets: workoutSets.length,
        totalVolume: workoutSets.reduce((sum, s) => sum + s.weight * s.reps, 0),
        exercises: new Set(workoutSets.map((s) => s.exerciseId)).size,
      }
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {formatWorkoutDate(workout.date)}
            </CardTitle>
            <CardDescription>
              {formatTime(workout.date)}
              {mesocycle &&
                ` • Week ${workout.weekNumber} of ${mesocycle.durationWeeks}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {duration && (
              <Badge variant="secondary">
                <Activity className="w-3 h-3 mr-1" />
                {duration}
              </Badge>
            )}
            <button
              onClick={onToggleExpand}
              className="p-2 active:bg-muted rounded-md transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mesocycle && (
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">
              {patterns?.find((p) => mesocycle.primaryPatterns.includes(p._id))
                ?.displayName || 'Mesocycle'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {mesocycle.targetSetsPerWeek} sets/week •{' '}
              {mesocycle.sessionsPerWeek} sessions/week
            </span>
          </div>
        )}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <div className="text-2xl font-bold">{stats.totalSets}</div>
              <div className="text-xs text-muted-foreground">Total Sets</div>
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
              <div className="text-2xl font-bold">{stats.exercises}</div>
              <div className="text-xs text-muted-foreground">Exercises</div>
            </div>
          </div>
        )}
        {isExpanded && expandedContent}
      </CardContent>
    </Card>
  )
}
