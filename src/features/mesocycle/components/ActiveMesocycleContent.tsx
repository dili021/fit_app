import { Calendar, CheckCircle2, Play, Target } from 'lucide-react'
import type { Doc } from '@db/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { formatMesocycleDate } from './utils/mesocycleCardHelpers'

interface ActiveMesocycleContentProps {
  mesocycle: Doc<'mesocycles'>
  userId?: string
  hasActiveWorkout: boolean
  onStartWorkout: () => void
  onConclude?: () => void
}

export function ActiveMesocycleContent({
  mesocycle,
  userId,
  hasActiveWorkout,
  onStartWorkout,
  onConclude,
}: ActiveMesocycleContentProps) {
  if (!mesocycle.startDate) return null

  return (
    <div className="space-y-3">
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Started: {formatMesocycleDate(mesocycle.startDate)}</span>
        </div>
        {mesocycle.currentWeek && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>
              Week {mesocycle.currentWeek} of {mesocycle.durationWeeks}
            </span>
          </div>
        )}
        {mesocycle.sessionsPerWeek && mesocycle.targetSetsPerWeek && (
          <div className="text-muted-foreground">
            {mesocycle.sessionsPerWeek} sessions/week •{' '}
            {mesocycle.targetSetsPerWeek} sets/week
          </div>
        )}
      </div>
      <div className="space-y-2">
        {userId && (
          <div className="w-full">
            <Button
              onClick={onStartWorkout}
              className="w-full"
              disabled={!mesocycle}
            >
              <Play className="h-4 w-4 mr-2" />
              {hasActiveWorkout ? 'Continue Workout' : 'Start Workout'}
            </Button>
          </div>
        )}
        {onConclude && (
          <div className="w-full">
            <Button onClick={onConclude} variant="outline" className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Conclude Mesocycle
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
