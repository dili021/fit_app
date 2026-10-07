import { useMutation, useQuery } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@db/_generated/api'
import {
  calculateCurrentWeek,
  getPrimaryPatternNames,
  getStatusBadge,
} from './utils/mesocycleCardHelpers'
import { ActiveMesocycleContent } from './ActiveMesocycleContent'
import { PlannedMesocycleContent } from './PlannedMesocycleContent'
import { CompletedMesocycleContent } from './CompletedMesocycleContent'
import type { Doc } from '@db/_generated/dataModel'
import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface MesocycleCardProps {
  mesocycle: Doc<'mesocycles'>
  patterns?: Array<Doc<'patterns'>>
  onActivate?: () => void
  onConclude?: () => void
  hasActiveMesocycle?: boolean
  userId?: string
  activeWorkout?: Doc<'workouts'> | null
  currentWeek?: number
  dragHandle?: ReactNode
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
  dragHandle,
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

  const calculatedCurrentWeek = calculateCurrentWeek(
    currentWeek,
    mesocycleStatusInfo?.currentWeek,
    mesocycle.startDate,
  )

  const primaryPatternNames = getPrimaryPatternNames(mesocycle, patternsData)
  const hasActiveWorkout = activeWorkout && !activeWorkout.completed

  const handleStartWorkout = async () => {
    if (!userId || mesocycle.status !== 'active') return

    if (activeWorkout && !activeWorkout.completed) {
      void navigate({
        to: '/workout/active',
        search: { workoutId: activeWorkout._id },
      })
      return
    }

    try {
      const workoutId = await createWorkout({
        userId,
        mesocycleId: mesocycle._id,
        weekNumber: calculatedCurrentWeek,
      })
      void navigate({ to: '/workout/active', search: { workoutId } })
    } catch {
      alert('Failed to start workout. Please try again.')
    }
  }

  return (
    <Card className={mesocycle.status === 'active' ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          {dragHandle}
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
        {mesocycle.status === 'active' && (
          <ActiveMesocycleContent
            mesocycle={mesocycle}
            userId={userId}
            hasActiveWorkout={!!hasActiveWorkout}
            onStartWorkout={handleStartWorkout}
            onConclude={onConclude}
          />
        )}
        {mesocycle.status === 'planned' && (
          <PlannedMesocycleContent
            hasActiveMesocycle={hasActiveMesocycle}
            onActivate={onActivate}
          />
        )}
        {mesocycle.status === 'completed' && (
          <CompletedMesocycleContent mesocycle={mesocycle} />
        )}
      </CardContent>
    </Card>
  )
}
