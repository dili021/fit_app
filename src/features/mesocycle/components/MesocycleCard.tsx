import { useQuery } from 'convex/react'
import { Calendar, CheckCircle2, Play, Target } from 'lucide-react'
import { api } from '@db/_generated/api'
import type { Doc } from '@db/_generated/dataModel'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface MesocycleCardProps {
  mesocycle: Doc<'mesocycles'>
  patterns?: Array<Doc<'patterns'>>
  onActivate?: () => void
  onConclude?: () => void
  hasActiveMesocycle?: boolean
}

export function MesocycleCard({
  mesocycle,
  patterns,
  onActivate,
  onConclude,
  hasActiveMesocycle,
}: MesocycleCardProps) {
  const patternsData = patterns || useQuery(api.patterns.getAll)

  const primaryPatternNames = patternsData
    ? mesocycle.primaryPatterns
        .map((id) => patternsData.find((p) => p._id === id)?.displayName)
        .filter(Boolean)
        .join(' and ')
    : 'Mesocycle'

  const getStatusBadge = () => {
    switch (mesocycle.status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500">
            Active
          </Badge>
        )
      case 'planned':
        return <Badge variant="secondary">Planned</Badge>
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      case 'deload':
        return (
          <Badge variant="outline" className="bg-yellow-500/20">
            Deload
          </Badge>
        )
      default:
        return <Badge variant="outline">{mesocycle.status}</Badge>
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Not started'
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

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
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active mesocycle details */}
        {mesocycle.status === 'active' && mesocycle.startDate && (
          <div className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Started: {formatDate(mesocycle.startDate)}</span>
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
            {onConclude && (
              <Button
                onClick={onConclude}
                variant="destructive"
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Conclude Mesocycle
              </Button>
            )}
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
            {formatDate(
              mesocycle.startDate +
                mesocycle.durationWeeks * 7 * 24 * 60 * 60 * 1000,
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
