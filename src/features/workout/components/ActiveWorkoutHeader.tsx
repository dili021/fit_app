import { Clock } from 'lucide-react'
import type { Id } from '../../../../convex/_generated/dataModel'

interface ActiveWorkoutHeaderProps {
  currentPattern: {
    patternId: Id<'patterns'>
    patternName: string
    sets: number
    isPrimary: boolean
  }
  workoutTemplate: {
    template: Array<{
      patternId: Id<'patterns'>
      patternName: string
      sets: number
      isPrimary: boolean
    }>
  }
  currentPatternIndex: number
  sessionElapsedSeconds: number
  getDotClassName: (isCurrent: boolean, isCompleted: boolean) => string
}

export function ActiveWorkoutHeader({
  currentPattern,
  workoutTemplate,
  currentPatternIndex,
  sessionElapsedSeconds,
  getDotClassName,
}: ActiveWorkoutHeaderProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate completed patterns based on workout sets
  const getPatternCompletionStatus = (patternIndex: number) => {
    if (patternIndex < currentPatternIndex) {
      return 'completed'
    }
    if (patternIndex === currentPatternIndex) {
      return 'current'
    }
    return 'upcoming'
  }

  return (
    <div className="sticky top-0 z-20 bg-background border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">
            {currentPattern.patternName}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">Patterns</span>
            <div className="flex items-center gap-1">
              {workoutTemplate.template.map((pattern, index) => {
                const status = getPatternCompletionStatus(index)
                const isCurrent = status === 'current'
                const isCompleted = status === 'completed'
                const patternName = pattern.patternName

                const getStatusLabel = () => {
                  if (isCompleted) return 'Completed'
                  if (isCurrent) return 'Current'
                  return 'Upcoming'
                }

                return (
                  <div
                    key={pattern.patternId}
                    className={`w-2 h-2 rounded-full transition-all ${getDotClassName(
                      isCurrent,
                      isCompleted,
                    )}`}
                    title={patternName}
                    aria-label={`${patternName} - ${getStatusLabel()}`}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-mono">
            {formatTime(sessionElapsedSeconds)}
          </span>
        </div>
      </div>
    </div>
  )
}
