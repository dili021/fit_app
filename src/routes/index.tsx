import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@db/_generated/api'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { useDashboardCalculations } from '@/features/dashboard/hooks/useDashboardCalculations'
import { DashboardLoadingState } from '@/features/dashboard/components/DashboardLoadingState'
import { DashboardNoMesocycleState } from '@/features/dashboard/components/DashboardNoMesocycleState'
import { ActiveMesocycleCard } from '@/features/dashboard/components/ActiveMesocycleCard'
import { DeloadNotification } from '@/features/dashboard/components/DeloadNotification'
import { CompletionPrompt } from '@/features/dashboard/components/CompletionPrompt'
import { RecentWorkoutsCard } from '@/features/dashboard/components/RecentWorkoutsCard'
import { ConcludeMesocycleDialog } from '@/features/mesocycle/components/ConcludeMesocycleDialog'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  const { userId, isPending } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      {userId ? <DashboardContent userId={userId} /> : null}
    </ProtectedRoute>
  )
}

function DashboardContent({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const [concludeDialogOpen, setConcludeDialogOpen] = useState(false)
  const {
    activeMesocycle,
    activeWorkout,
    recentWorkouts,
    patterns,
    mesocycleSets,
    mesocycleStatusInfo,
    workoutTemplate,
    createWorkout,
    showCompletionPrompt,
    setShowCompletionPrompt,
  } = useDashboardData(userId)
  const concludeMesocycle = useMutation(api.mesocycles.concludeMesocycle)

  const {
    currentWeek,
    isDeloadWeek,
    isCompleted,
    mesocycleProgress,
    mesocycleTitle,
    formatWorkoutDate,
  } = useDashboardCalculations({
    activeMesocycle,
    mesocycleSets,
    mesocycleStatusInfo,
    patterns,
  })

  const handleStartWorkout = async () => {
    if (!activeMesocycle) return

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
        mesocycleId: activeMesocycle._id,
        weekNumber: currentWeek,
      })

      // Navigate directly to active workout page
      void navigate({ to: '/workout/active', search: { workoutId } })
    } catch {
      alert('Failed to start workout. Please try again.')
    }
  }

  const handleConcludeClick = () => {
    setConcludeDialogOpen(true)
  }

  const handleConcludeConfirm = async () => {
    if (!activeMesocycle) return

    try {
      await concludeMesocycle({ mesocycleId: activeMesocycle._id })
      setConcludeDialogOpen(false)
    } catch {
      alert('Failed to conclude mesocycle. Please try again.')
    }
  }

  const hasActiveWorkout = activeWorkout && !activeWorkout.completed

  if (activeMesocycle === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your training progress</p>
        </div>
        <DashboardLoadingState />
      </div>
    )
  }

  if (activeMesocycle === null) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your training progress</p>
        </div>
        <DashboardNoMesocycleState />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your training progress</p>
      </div>

      <div className="grid gap-6">
        <ActiveMesocycleCard
          mesocycle={activeMesocycle}
          mesocycleTitle={mesocycleTitle}
          currentWeek={currentWeek}
          durationWeeks={activeMesocycle.durationWeeks}
          isDeloadWeek={isDeloadWeek}
          isCompleted={isCompleted}
          mesocycleProgress={mesocycleProgress}
          workoutTemplate={workoutTemplate ?? null}
          hasActiveWorkout={!!hasActiveWorkout}
          onStartWorkout={handleStartWorkout}
          onConclude={handleConcludeClick}
        />

        {isDeloadWeek && !isCompleted && <DeloadNotification />}

        {(isCompleted || showCompletionPrompt) && (
          <CompletionPrompt onDismiss={() => setShowCompletionPrompt(false)} />
        )}

        <RecentWorkoutsCard
          recentWorkouts={recentWorkouts}
          formatWorkoutDate={formatWorkoutDate}
        />
      </div>

      <ConcludeMesocycleDialog
        open={concludeDialogOpen}
        onOpenChange={setConcludeDialogOpen}
        mesocycle={activeMesocycle}
        onConfirm={() => {
          void handleConcludeConfirm()
        }}
      />
    </div>
  )
}
