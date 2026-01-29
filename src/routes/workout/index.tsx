import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useEffect } from 'react'
import { Play } from 'lucide-react'
import { api } from '@db/_generated/api'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { NoMesocycleState } from '@/features/workout/components/NoMesocycleState'
import { ActiveWorkoutCard } from '@/features/workout/components/ActiveWorkoutCard'
import { MesocycleCompletedCard } from '@/features/workout/components/MesocycleCompletedCard'
import { WorkoutHeader } from '@/features/workout/components/WorkoutHeader'

export const Route = createFileRoute('/workout/')({
  component: WorkoutIndex,
})

/**
 * Calculate current week number based on start date
 */
function calculateCurrentWeek(
  startDate: number,
  durationWeeks: number,
): number {
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
  const activeMesocycle = useQuery(api.mesocycles.getActiveMesocycle, {
    userId,
  })
  const activeWorkout = useQuery(api.workouts.getActiveWorkout, { userId })
  const mesocycleStatusInfo = useQuery(
    api.mesocycles.getMesocycleStatusInfo,
    activeMesocycle ? { mesocycleId: activeMesocycle._id } : 'skip',
  )
  const createWorkout = useMutation(api.workouts.createWorkout)
  const checkStatus = useMutation(api.mesocycles.checkAndUpdateMesocycleStatus)

  // Check status when component loads
  useEffect(() => {
    if (activeMesocycle) {
      void checkStatus({ mesocycleId: activeMesocycle._id })
    }
  }, [activeMesocycle?._id, checkStatus])

  // Calculate current week if mesocycle exists
  const currentWeek =
    mesocycleStatusInfo?.currentWeek ??
    (activeMesocycle && activeMesocycle.startDate
      ? calculateCurrentWeek(
          activeMesocycle.startDate,
          activeMesocycle.durationWeeks,
        )
      : 0)

  const isDeloadWeek = mesocycleStatusInfo?.isDeloadWeek ?? false
  const isCompleted =
    activeMesocycle?.status === 'completed' ||
    mesocycleStatusInfo?.status === 'completed'

  const handleStartWorkout = async () => {
    if (!activeMesocycle) return

    try {
      const workoutId = await createWorkout({
        userId,
        mesocycleId: activeMesocycle._id,
        weekNumber: currentWeek,
      })

      // Navigate to active workout page
      window.location.href = `/workout/active?workoutId=${workoutId}`
    } catch {
      alert('Failed to start workout. Please try again.')
    }
  }

  // Check if there's an active workout
  const hasActiveWorkout = activeWorkout && !activeWorkout.completed

  if (!activeMesocycle) {
    return <NoMesocycleState />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <WorkoutHeader
        currentWeek={currentWeek}
        durationWeeks={activeMesocycle.durationWeeks}
        isDeloadWeek={isDeloadWeek}
        isCompleted={isCompleted}
      />

      {hasActiveWorkout && <ActiveWorkoutCard activeWorkout={activeWorkout} />}
      {!hasActiveWorkout && isCompleted && <MesocycleCompletedCard />}
      {!hasActiveWorkout && !isCompleted && (
        <Button
          onClick={() => {
            void handleStartWorkout()
          }}
          size="lg"
          className="w-full"
        >
          <Play className="h-5 w-5 mr-2" />
          Start Workout
        </Button>
      )}
    </div>
  )
}
