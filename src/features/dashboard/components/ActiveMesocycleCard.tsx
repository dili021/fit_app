import { Link } from '@tanstack/react-router'
import { AlertCircle, CheckCircle2, Play } from 'lucide-react'
import type { Doc } from '../../../../convex/_generated/dataModel'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ActiveMesocycleCardProps {
  mesocycle: Doc<'mesocycles'>
  mesocycleTitle: string
  currentWeek: number
  durationWeeks: number
  isDeloadWeek: boolean
  isCompleted: boolean
  mesocycleProgress: number
  workoutTemplate: {
    template: Array<{
      patternId: string
      patternName: string
      sets: number
      isPrimary: boolean
    }>
    totalSetsPerSession: number
    isDeloadWeek: boolean
  } | null
  hasActiveWorkout: boolean
  onStartWorkout: () => void
}

export function ActiveMesocycleCard({
  mesocycle,
  mesocycleTitle,
  currentWeek,
  durationWeeks,
  isDeloadWeek,
  isCompleted,
  mesocycleProgress,
  workoutTemplate,
  hasActiveWorkout,
  onStartWorkout,
}: ActiveMesocycleCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              <h2 className="text-2xl font-semibold">{mesocycleTitle}</h2>
            </CardTitle>
            <CardDescription className="mt-2">
              Week {currentWeek} of {durationWeeks}
            </CardDescription>
          </div>
          {isDeloadWeek && !isCompleted && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Deload Week
            </Badge>
          )}
          {isCompleted && (
            <Badge
              variant="default"
              className="flex items-center gap-1 bg-green-600"
            >
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {Math.round(mesocycleProgress)}%
            </span>
          </div>
          <Progress value={mesocycleProgress} className="h-2" />
        </div>

        {workoutTemplate && (
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's Workout</span>
              <span className="font-semibold">
                {workoutTemplate.totalSetsPerSession} sets
              </span>
            </div>
            {workoutTemplate.isDeloadWeek && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Deload week - Volume reduced by 50%
              </p>
            )}
            <div className="space-y-1.5">
              {workoutTemplate.template.map((item) => (
                <div
                  key={item.patternId}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span className="text-muted-foreground">
                    {item.patternName}
                    {item.isPrimary && (
                      <Badge variant="secondary" className="ml-1.5 text-xs">
                        Primary
                      </Badge>
                    )}
                  </span>
                  <span className="font-medium">{item.sets} sets</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Sets/Week</div>
            <div className="text-lg font-semibold">
              {mesocycle.targetSetsPerWeek}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Sessions/Week</div>
            <div className="text-lg font-semibold">
              {mesocycle.sessionsPerWeek}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {!isCompleted ? (
          <Button
            onClick={onStartWorkout}
            className="w-full"
            disabled={!mesocycle}
          >
            <Play className="h-4 w-4 mr-2" />
            {hasActiveWorkout ? 'Continue Workout' : 'Start Workout'}
          </Button>
        ) : (
          <Button asChild className="w-full" variant="outline">
            <Link to="/mesocycles">Mesocycles</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
