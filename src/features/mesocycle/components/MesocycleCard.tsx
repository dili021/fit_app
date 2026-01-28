import { useMutation, useQuery } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { Calendar, CheckCircle2, Play, Target } from 'lucide-react'
import { api } from '@db/_generated/api'
import {
  formatMesocycleDate,
  getPrimaryPatternNames,
  getStatusBadge,
} from './utils/mesocycleCardHelpers'
import type { Doc } from '@db/_generated/dataModel'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MesocycleCardProps {
  mesocycle: Doc<'mesocycles'>
  patterns?: Array<Doc<'patterns'>>
  onActivate?: () => void
  onConclude?: () => void
  hasActiveMesocycle?: boolean
  userId?: string
  activeWorkout?: Doc<'workouts'> | null
  currentWeek?: number
}

export function MesocycleCard({
  mesocycle,
  patterns,
  onActivate,
  onConclude,
  hasActiveMesocycle,
  userId,
  activeWorkout,
  currentWeek,
}: MesocycleCardProps) {
  const navigate = useNavigate()
  const createWorkout = useMutation(api.workouts.createWorkout)
  const patternsData = patterns || useQuery(api.patterns.getAll)

  const mesocycleStatusInfo = useQuery(
    api.mesocycles.getMesocycleStatusInfo,
    mesocycle.status === 'active' && mesocycle._id
      ? { mesocycleId: mesocycle._id }
      : 'skip',
  )

  const calculatedCurrentWeek =
    currentWeek ??
    mesocycleStatusInfo?.currentWeek ??
    (mesocycle.startDate
      ? Math.floor(
          (Date.now() - mesocycle.startDate) / (7 * 24 * 60 * 60 * 1000),
        ) + 1
      : 1)

  const primaryPatternNames = getPrimaryPatternNames(mesocycle, patternsData)

  const handleStartWorkout = async () => {
    if (!userId || mesocycle.status !== 'active') return

    // If there's an active workout, navigate to it
    if (activeWorkout && !activeWorkout.completed) {
      void navigate({
        to: '/workout/active',
        search: { workoutId: activeWorkout._id },
      })
      return
    }

    // Otherwise, create a new workout
    try {
      const workoutId = await createWorkout({
        userId,
        mesocycleId: mesocycle._id,
        weekNumber: calculatedCurrentWeek,
      })

      // Navigate directly to active workout page
      void navigate({ to: '/workout/active', search: { workoutId } })
    } catch {
      alert('Failed to start workout. Please try again.')
    }
  }

  const hasActiveWorkout = activeWorkout && !activeWorkout.completed

  return (
    <Card className={mesocycle.status === 'active' ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {primaryPatternNames} mesocycle
            </CardTitle>
            <CardDescription className="mt-1">
              {mesocycle.durationWeeks} weeks
            </CardDescription>
          </div>
          {getStatusBadge(mesocycle)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active mesocycle details */}
        {mesocycle.status === 'active' && mesocycle.startDate && (
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
                <Button
                  onClick={handleStartWorkout}
                  className="w-full"
                  disabled={!mesocycle}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {hasActiveWorkout ? 'Continue Workout' : 'Start Workout'}
                </Button>
              )}
              {onConclude && (
                <Button
                  onClick={onConclude}
                  variant="outline"
                  className="w-full"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Conclude Mesocycle
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Planned mesocycle - show activate button only if no active mesocycle */}
        {mesocycle.status === 'planned' && (
          <div className="space-y-3">
            {hasActiveMesocycle ? (
              <p className="text-sm text-muted-foreground">
                Conclude your active mesocycle to activate this one.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Ready to activate. Configure training parameters to start.
                </p>
                {onActivate && (
                  <Button onClick={onActivate} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Activate Mesocycle
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Completed mesocycle details */}
        {mesocycle.status === 'completed' && mesocycle.startDate && (
          <div className="text-sm text-muted-foreground">
            Completed{' '}
            {formatMesocycleDate(
              mesocycle.startDate +
                mesocycle.durationWeeks * 7 * 24 * 60 * 60 * 1000,
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
