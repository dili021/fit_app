import { createFileRoute, Link } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Calendar, Dumbbell, Play, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
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
      <DashboardContent userId={userId!} />
    </ProtectedRoute>
  )
}

/**
 * Calculate current week number based on start date
 */
function calculateCurrentWeek(startDate: number, durationWeeks: number): number {
  const now = Date.now()
  const elapsed = now - startDate
  const weeksElapsed = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000))
  return Math.min(weeksElapsed + 1, durationWeeks)
}

function DashboardContent({ userId }: { userId: string }) {
  const activeMesocycle = useQuery(api.mesocycles.getActiveMesocycle, { userId })
  const recentWorkouts = useQuery(api.workouts.getRecentWorkouts, { userId, limit: 3 })
  const patterns = useQuery(api.patterns.getAll)
  const mesocycleSets = useQuery(
    api.sets.getSetsForMesocycle,
    activeMesocycle ? { mesocycleId: activeMesocycle._id } : "skip"
  )
  const mesocycleStatusInfo = useQuery(
    api.mesocycles.getMesocycleStatusInfo,
    activeMesocycle ? { mesocycleId: activeMesocycle._id } : "skip"
  )
  const checkStatus = useMutation(api.mesocycles.checkAndUpdateMesocycleStatus)
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false)

  // Check and update mesocycle status on load
  useEffect(() => {
    if (activeMesocycle) {
      checkStatus({ mesocycleId: activeMesocycle._id }).then((result) => {
        if (result.status === "completed" && result.action === "completed") {
          setShowCompletionPrompt(true)
        }
      })
    }
  }, [activeMesocycle?._id, checkStatus])

  // Calculate current week if mesocycle exists
  const currentWeek = mesocycleStatusInfo?.currentWeek ?? (activeMesocycle
    ? calculateCurrentWeek(activeMesocycle.startDate, activeMesocycle.durationWeeks)
    : 0)

  const isDeloadWeek = mesocycleStatusInfo?.isDeloadWeek ?? (activeMesocycle && currentWeek === activeMesocycle.durationWeeks)
  const isCompleted = activeMesocycle?.status === "completed" || mesocycleStatusInfo?.status === "completed"

  // Calculate progress based on completed sets, not week number
  const mesocycleProgress = activeMesocycle && mesocycleSets ? (() => {
    // Calculate total expected sets for the entire mesocycle
    // This is: targetSetsPerWeek * durationWeeks * sessionsPerWeek / sessionsPerWeek
    // Simplified: targetSetsPerWeek * durationWeeks
    const totalExpectedSets = activeMesocycle.targetSetsPerWeek * activeMesocycle.durationWeeks
    
    // Count completed sets
    const completedSets = mesocycleSets.length
    
    // Calculate percentage
    return totalExpectedSets > 0 ? (completedSets / totalExpectedSets) * 100 : 0
  })() : 0

  // Get primary pattern names
  const primaryPatternNames = activeMesocycle && patterns
    ? patterns
        .filter((p) => activeMesocycle.primaryPatterns.includes(p._id))
        .map((p) => p.displayName)
    : []

  // Format workout date
  const formatWorkoutDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your training progress</p>
      </div>

      {!activeMesocycle ? (
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
      ) : (
        <div className="grid gap-6">
          {/* Active Mesocycle Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>
                    <h2 className="text-2xl font-semibold">
                      {activeMesocycle.name || 'Active Mesocycle'}
                    </h2>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Week {currentWeek} of {activeMesocycle.durationWeeks}
                  </CardDescription>
                </div>
                {isDeloadWeek && !isCompleted && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Deload Week
                  </Badge>
                )}
                {isCompleted && (
                  <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mesocycle Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(mesocycleProgress)}%</span>
                </div>
                <Progress value={mesocycleProgress} className="h-2" />
              </div>

              {/* Primary Patterns */}
              <div>
                <h3 className="text-sm font-medium mb-2">Primary Patterns</h3>
                <div className="flex flex-wrap gap-2">
                  {primaryPatternNames.map((name) => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Volume Info */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-sm text-muted-foreground">Sets/Week</div>
                  <div className="text-lg font-semibold">{activeMesocycle.targetSetsPerWeek}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Sessions/Week</div>
                  <div className="text-lg font-semibold">{activeMesocycle.sessionsPerWeek}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {!isCompleted ? (
                <Button asChild className="w-full">
                  <Link to="/workout">
                    <Play className="h-4 w-4 mr-2" />
                    Start Workout
                  </Link>
                </Button>
              ) : (
                <Button asChild className="w-full" variant="outline">
                  <Link to="/mesocycle/setup">
                    Set Up New Mesocycle
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Deload Notification */}
          {isDeloadWeek && !isCompleted && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Deload Week
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This is your final week. Volume has been automatically reduced by 50% for recovery.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Prompt */}
          {(isCompleted || showCompletionPrompt) && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Mesocycle Completed!
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                      Congratulations on completing your mesocycle! Set up a new mesocycle to continue your training.
                    </p>
                    <Button asChild className="bg-green-600 hover:bg-green-700">
                      <Link to="/mesocycle/setup" onClick={() => setShowCompletionPrompt(false)}>
                        Set Up New Mesocycle
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Workouts */}
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="text-xl font-semibold">Recent Workouts</h2>
              </CardTitle>
              <CardDescription>Your last 3 training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {!recentWorkouts || recentWorkouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No workouts yet</p>
                  <p className="text-sm mt-1">Start your first workout to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentWorkouts.map((workout) => (
                    <div
                      key={workout._id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Week {workout.weekNumber} - {formatWorkoutDate(workout.date)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {workout.completed ? (
                              <span className="text-green-600 dark:text-green-400">Completed</span>
                            ) : (
                              <span className="text-orange-600 dark:text-orange-400">In Progress</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/history">View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {recentWorkouts && recentWorkouts.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/history">View All History</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
