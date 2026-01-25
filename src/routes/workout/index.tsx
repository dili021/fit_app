import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, Play, Calendar } from 'lucide-react'

export const Route = createFileRoute('/workout/')({
  component: WorkoutIndex,
})

/**
 * Calculate current week number based on start date
 */
function calculateCurrentWeek(startDate: number, durationWeeks: number): number {
  const now = Date.now()
  const elapsed = now - startDate
  const weeksElapsed = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000))
  return Math.min(weeksElapsed + 1, durationWeeks)
}

function WorkoutIndex() {
  const { userId, isPending } = useAuth()

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <WorkoutIndexContent userId={userId!} />
    </ProtectedRoute>
  )
}

function WorkoutIndexContent({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const activeMesocycle = useQuery(api.mesocycles.getActiveMesocycle, { userId })
  const activeWorkout = useQuery(api.workouts.getActiveWorkout, { userId })
  const workoutTemplate = useQuery(
    api.workouts.generateWorkoutTemplate,
    activeMesocycle ? { mesocycleId: activeMesocycle._id } : "skip"
  )
  const createWorkout = useMutation(api.workouts.createWorkout)

  // Calculate current week if mesocycle exists
  const currentWeek = activeMesocycle
    ? calculateCurrentWeek(activeMesocycle.startDate, activeMesocycle.durationWeeks)
    : 0

  const handleStartWorkout = async () => {
    if (!activeMesocycle) return

    try {
      const workoutId = await createWorkout({
        userId,
        mesocycleId: activeMesocycle._id,
        weekNumber: currentWeek,
      })

      // Navigate to active workout page
      navigate({ to: '/workout/active', search: { workoutId } })
    } catch (error) {
      console.error('Failed to create workout:', error)
      alert('Failed to start workout. Please try again.')
    }
  }

  // Check if there's an active workout
  const hasActiveWorkout = activeWorkout && !activeWorkout.completed

  if (!activeMesocycle) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Active Mesocycle</h2>
            <p className="text-muted-foreground mb-6">
              Create a mesocycle to start tracking your workouts
            </p>
            <Button asChild>
              <Link to="/mesocycle/setup">Set Up Mesocycle</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Start Workout</h1>
        <p className="text-muted-foreground">Week {currentWeek} of {activeMesocycle.durationWeeks}</p>
      </div>

      {hasActiveWorkout ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-xl font-semibold">Active Workout</h2>
            </CardTitle>
            <CardDescription>
              You have an active workout session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Started {new Date(activeWorkout.startedAt || activeWorkout.date).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/workout/active">Continue Workout</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          {workoutTemplate && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-xl font-semibold">Today's Workout Template</h2>
                </CardTitle>
                <CardDescription>
                  {workoutTemplate.totalSetsPerSession} total sets across {workoutTemplate.template.length} patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workoutTemplate.template.map((item) => (
                    <div
                      key={item.patternId}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">
                            {item.patternName}
                            {item.isPrimary && (
                              <Badge variant="secondary" className="ml-2">Primary</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">{item.sets} sets</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="py-6">
              <Button
                onClick={handleStartWorkout}
                size="lg"
                className="w-full"
                disabled={!workoutTemplate}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Workout
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
