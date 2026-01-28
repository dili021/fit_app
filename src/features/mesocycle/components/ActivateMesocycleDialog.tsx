import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Check } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'
import { useActivateMesocycleCalculations } from '../hooks/useActivateMesocycleCalculations'
import { SessionsPerWeekStep } from './steps/SessionsPerWeekStep'
import { SetsPerPatternStep } from './steps/SetsPerPatternStep'
import { RestTimeStep } from './steps/RestTimeStep'
import { TrainingHistoryStep } from './steps/TrainingHistoryStep'
import { SessionPreview } from './steps/SessionPreview'
import type { Id } from '../../../../convex/_generated/dataModel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ActivateMesocycleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesocycleId: Id<'mesocycles'>
  userId: string
  onSuccess?: () => void
}

export function ActivateMesocycleDialog({
  open,
  onOpenChange,
  mesocycleId,
  userId,
  onSuccess,
}: ActivateMesocycleDialogProps) {
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number | null>(null)
  const [setsPerPrimaryPatternPerWeek, setSetsPerPrimaryPatternPerWeek] =
    useState<number | null>(null)
  const [restTimeMinutes, setRestTimeMinutes] = useState<number>(3)
  const [wasPreviouslyTraining, setWasPreviouslyTraining] = useState<
    boolean | null
  >(null)

  const mesocycle = useQuery(api.mesocycles.getMesocycleById, {
    id: mesocycleId,
  })
  const patterns = useQuery(api.patterns.getAll)
  const previousRestTime = useQuery(
    api.mesocycles.getPreviousMesocycleRestTime,
    { userId },
  )
  const activateMesocycle = useMutation(api.mesocycles.activateMesocycle)

  // Set default rest time from previous mesocycle
  useEffect(() => {
    if (previousRestTime !== undefined && open) {
      setRestTimeMinutes(previousRestTime)
    }
  }, [previousRestTime, open])

  const {
    totalSetsPerWeek,
    setsPerPrimaryPatternPerSession,
    numSecondaryPatterns,
    totalSetsPerSessionWithSecondary,
    isValidDistribution,
  } = useActivateMesocycleCalculations({
    mesocycle,
    patterns,
    setsPerPrimaryPatternPerWeek,
    sessionsPerWeek,
  })

  const canSubmit =
    sessionsPerWeek !== null &&
    setsPerPrimaryPatternPerWeek !== null &&
    wasPreviouslyTraining !== null &&
    restTimeMinutes > 0 &&
    isValidDistribution

  const handleSubmit = async () => {
    if (!canSubmit || !sessionsPerWeek || !setsPerPrimaryPatternPerWeek) return

    try {
      await activateMesocycle({
        mesocycleId,
        sessionsPerWeek,
        targetSetsPerWeek: totalSetsPerWeek!,
        restTimeMinutes,
        wasPreviouslyTraining,
      })

      // Reset form
      setSessionsPerWeek(null)
      setSetsPerPrimaryPatternPerWeek(null)
      setRestTimeMinutes(previousRestTime ?? 3)
      setWasPreviouslyTraining(null)

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to activate mesocycle. Please try again.'
      alert(errorMessage)
    }
  }

  const handleOpenChange = (isDialogOpen: boolean) => {
    if (!isDialogOpen) {
      // Reset form when closing
      setSessionsPerWeek(null)
      setSetsPerPrimaryPatternPerWeek(null)
      setRestTimeMinutes(previousRestTime ?? 3)
      setWasPreviouslyTraining(null)
    }
    onOpenChange(isDialogOpen)
  }

  const primaryPatternNames =
    mesocycle && patterns
      ? mesocycle.primaryPatterns
          .map((id) => patterns.find((p) => p._id === id)?.displayName)
          .filter(Boolean)
          .join(' and ')
      : ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Activate Mesocycle</DialogTitle>
          <DialogDescription>
            Configure training parameters for your {primaryPatternNames}{' '}
            mesocycle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <SessionsPerWeekStep
            sessionsPerWeek={sessionsPerWeek}
            onSessionsChange={setSessionsPerWeek}
            onResetSets={() => setSetsPerPrimaryPatternPerWeek(null)}
          />

          {sessionsPerWeek && (
            <SetsPerPatternStep
              sessionsPerWeek={sessionsPerWeek}
              setsPerPrimaryPatternPerWeek={setsPerPrimaryPatternPerWeek}
              onSetsChange={setSetsPerPrimaryPatternPerWeek}
              isValidDistribution={isValidDistribution}
            />
          )}

          <RestTimeStep
            restTimeMinutes={restTimeMinutes}
            onRestTimeChange={setRestTimeMinutes}
          />

          <TrainingHistoryStep
            wasPreviouslyTraining={wasPreviouslyTraining}
            onTrainingHistoryChange={setWasPreviouslyTraining}
          />

          {mesocycle && patterns && (
            <SessionPreview
              mesocycle={mesocycle}
              patterns={patterns}
              setsPerPrimaryPatternPerSession={setsPerPrimaryPatternPerSession}
              numSecondaryPatterns={numSecondaryPatterns}
              totalSetsPerSessionWithSecondary={
                totalSetsPerSessionWithSecondary
              }
              restTimeMinutes={restTimeMinutes}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t mt-4">
          <Button
            onClick={() => {
              void handleSubmit()
            }}
            disabled={!canSubmit}
          >
            Activate Mesocycle
            <Check className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
