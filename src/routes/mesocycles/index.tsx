import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@db/_generated/api'
import type { Id } from '@db/_generated/dataModel'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { CreateMesocycleDialog } from '@/features/mesocycle/components/CreateMesocycleDialog'
import { ActivateMesocycleDialog } from '@/features/mesocycle/components/ActivateMesocycleDialog'
import { MesocycleList } from '@/features/mesocycle/components/MesocycleList'
import { MacrocycleCompletionCard } from '@/features/mesocycle/components/MacrocycleCompletionCard'
import { MesocycleEmptyState } from '@/features/mesocycle/components/MesocycleEmptyState'
import { CreateMesocycleButton } from '@/features/mesocycle/components/CreateMesocycleButton'
import { ConcludeMesocycleDialog } from '@/features/mesocycle/components/ConcludeMesocycleDialog'
import { MesocyclesLoadingState } from '@/features/mesocycle/components/MesocyclesLoadingState'
import { useMacrocycleCompletion } from '@/features/mesocycle/hooks/useMacrocycleCompletion'

export const Route = createFileRoute('/mesocycles/')({
  component: MesocyclesPage,
})

function MesocyclesPage() {
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
      <MesocyclesContent userId={userId!} />
    </ProtectedRoute>
  )
}

function MesocyclesContent({ userId }: { userId: string }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [mesocycleToActivate, setMesocycleToActivate] =
    useState<Id<'mesocycles'> | null>(null)
  const [concludeDialogOpen, setConcludeDialogOpen] = useState(false)
  const [mesocycleToConclude, setMesocycleToConclude] =
    useState<Id<'mesocycles'> | null>(null)

  const mesocycles = useQuery(api.mesocycles.getAllMesocycles, { userId })
  const patterns = useQuery(api.patterns.getAll)
  const activeWorkout = useQuery(api.workouts.getActiveWorkout, { userId })
  const concludeMesocycle = useMutation(api.mesocycles.concludeMesocycle)

  // Filter to only show active and planned mesocycles (planning page, not history)
  const planningMesocycles =
    mesocycles?.filter(
      (m) => m.status === 'active' || m.status === 'planned',
    ) || []

  const handleCreateSuccess = () => {
    // Refresh will happen automatically via Convex query
  }

  const handleActivateClick = (mesocycleId: Id<'mesocycles'>) => {
    setMesocycleToActivate(mesocycleId)
    setActivateDialogOpen(true)
  }

  const handleActivateSuccess = () => {
    setActivateDialogOpen(false)
    setMesocycleToActivate(null)
  }

  const handleConcludeClick = (mesocycleId: Id<'mesocycles'>) => {
    setMesocycleToConclude(mesocycleId)
    setConcludeDialogOpen(true)
  }

  const handleConcludeConfirm = async () => {
    if (!mesocycleToConclude) return

    try {
      await concludeMesocycle({ mesocycleId: mesocycleToConclude })
      setConcludeDialogOpen(false)
      setMesocycleToConclude(null)
    } catch {
      alert('Failed to conclude mesocycle. Please try again.')
    }
  }

  const macrocycleCompletion = useMacrocycleCompletion(planningMesocycles)

  const isLoading = mesocycles === undefined || patterns === undefined

  if (isLoading) {
    return <MesocyclesLoadingState />
  }

  const hasMesocycles = planningMesocycles.length > 0
  const activeMesocycle = planningMesocycles.find((m) => m.status === 'active')
  const hasActiveMesocycle = !!activeMesocycle

  const mesocycleToConcludeData = mesocycleToConclude
    ? planningMesocycles.find((m) => m._id === mesocycleToConclude)
    : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mesocycles</h1>
        <p className="text-muted-foreground">
          Plan and manage your training cycles
        </p>
      </div>

      {macrocycleCompletion && (
        <MacrocycleCompletionCard completionDate={macrocycleCompletion} />
      )}

      {!hasMesocycles ? (
        <MesocycleEmptyState onCreateClick={() => setCreateDialogOpen(true)} />
      ) : (
        <div className="space-y-6">
          <MesocycleList
            mesocycles={planningMesocycles}
            patterns={patterns}
            onActivate={handleActivateClick}
            onConclude={handleConcludeClick}
            userId={userId}
            hasActiveMesocycle={hasActiveMesocycle}
            activeWorkout={activeWorkout}
          />
          <CreateMesocycleButton
            onCreateClick={() => setCreateDialogOpen(true)}
          />
        </div>
      )}

      {/* Dialogs */}
      <CreateMesocycleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        userId={userId}
        onSuccess={handleCreateSuccess}
      />

      {mesocycleToActivate && (
        <ActivateMesocycleDialog
          open={activateDialogOpen}
          onOpenChange={setActivateDialogOpen}
          mesocycleId={mesocycleToActivate}
          userId={userId}
          onSuccess={handleActivateSuccess}
        />
      )}

      <ConcludeMesocycleDialog
        open={concludeDialogOpen}
        onOpenChange={(open) => {
          setConcludeDialogOpen(open)
          if (!open) setMesocycleToConclude(null)
        }}
        mesocycle={mesocycleToConcludeData ?? null}
        onConfirm={() => {
          void handleConcludeConfirm()
        }}
      />
    </div>
  )
}
