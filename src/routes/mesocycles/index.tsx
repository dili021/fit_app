import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Calendar, Plus } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { CreateMesocycleDialog } from '@/components/mesocycle/CreateMesocycleDialog'
import { ActivateMesocycleDialog } from '@/components/mesocycle/ActivateMesocycleDialog'
import { MesocycleList } from '@/components/mesocycle/MesocycleList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

  // Calculate macrocycle completion time (only for active and planned)
  const macrocycleCompletion =
    planningMesocycles.length > 0
      ? (() => {
          const activeMesocycle = planningMesocycles.find(
            (m) => m.status === 'active',
          )
          const plannedMesocycles = planningMesocycles.filter(
            (m) => m.status === 'planned',
          )

          if (!activeMesocycle && plannedMesocycles.length === 0) {
            return null
          }

          let startDate: number
          let totalWeeks = 0

          if (activeMesocycle?.startDate) {
            // If there's an active mesocycle, start from its start date
            startDate = activeMesocycle.startDate
            totalWeeks += activeMesocycle.durationWeeks

            // Add planned mesocycles
            plannedMesocycles.forEach((m) => {
              totalWeeks += m.durationWeeks
            })
          } else if (plannedMesocycles.length > 0) {
            // If no active mesocycle, estimate from today
            startDate = Date.now()
            plannedMesocycles.forEach((m) => {
              totalWeeks += m.durationWeeks
            })
          } else {
            return null
          }

          return startDate + totalWeeks * 7 * 24 * 60 * 60 * 1000
        })()
      : null

  const formatCompletionDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isLoading = mesocycles === undefined || patterns === undefined

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      </div>
    )
  }

  const hasMesocycles = planningMesocycles.length > 0
  const activeMesocycle = planningMesocycles.find((m) => m.status === 'active')
  const hasActiveMesocycle = !!activeMesocycle

  // Check if mesocycle to conclude is finished
  const mesocycleToConcludeData = mesocycleToConclude
    ? planningMesocycles.find((m) => m._id === mesocycleToConclude)
    : null
  const isMesocycleFinished = mesocycleToConcludeData
    ? (mesocycleToConcludeData.currentWeek ?? 0) >=
      mesocycleToConcludeData.durationWeeks
    : false

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mesocycles</h1>
        <p className="text-muted-foreground">
          Plan and manage your training cycles
        </p>
      </div>

      {/* Macrocycle Completion Time */}
      {macrocycleCompletion && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">Macrocycle Completion</div>
                <div className="text-sm text-muted-foreground">
                  Estimated completion:{' '}
                  {formatCompletionDate(macrocycleCompletion)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!hasMesocycles && (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="space-y-4">
              <div className="text-4xl">📋</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Create your first mesocycle
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start planning your training cycle by creating a mesocycle
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mesocycle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single or Multiple Mesocycles State */}
      {hasMesocycles && (
        <div className="space-y-6">
          <MesocycleList
            mesocycles={planningMesocycles}
            patterns={patterns}
            onActivate={handleActivateClick}
            onConclude={handleConcludeClick}
            userId={userId}
            hasActiveMesocycle={hasActiveMesocycle}
          />

          {/* Create New Mesocycle Section */}
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6 pb-6 text-center">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Mesocycle
              </Button>
            </CardContent>
          </Card>
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

      {/* Conclude Confirmation Dialog */}
      <Dialog open={concludeDialogOpen} onOpenChange={setConcludeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isMesocycleFinished
                ? 'Conclude Mesocycle?'
                : 'Conclude Mesocycle Early?'}
            </DialogTitle>
            <DialogDescription>
              {isMesocycleFinished ? (
                'This mesocycle has completed its duration. Conclude it to mark it as completed?'
              ) : (
                <>
                  This mesocycle is not yet finished (Week{' '}
                  {mesocycleToConcludeData?.currentWeek ?? 0} of{' '}
                  {mesocycleToConcludeData?.durationWeeks ?? 0}).
                  <br />
                  <strong>Are you sure you want to conclude it early?</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConcludeDialogOpen(false)
                setMesocycleToConclude(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                void handleConcludeConfirm()
              }}
            >
              Conclude Mesocycle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
