import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ArrowRight, Check } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { DurationStep } from './steps/DurationStep'
import { PatternSelectionStep } from './steps/PatternSelectionStep'
import type { Id } from '../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

interface CreateMesocycleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess?: () => void
}

type Step = 1 | 2

export function CreateMesocycleDialog({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: CreateMesocycleDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [durationWeeks, setDurationWeeks] = useState<number | null>(null)
  const [primaryPatterns, setPrimaryPatterns] = useState<Array<Id<'patterns'>>>(
    [],
  )

  const patterns = useQuery(api.patterns.getAll)
  const createMesocycle = useMutation(api.mesocycles.createMesocycle)

  const totalSteps = 2
  const progress = (currentStep / totalSteps) * 100

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return durationWeeks !== null
      case 2:
        return primaryPatterns.length >= 1 && primaryPatterns.length <= 2
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    if (!canProceed() || !durationWeeks || primaryPatterns.length === 0) return

    try {
      await createMesocycle({
        userId,
        durationWeeks,
        primaryPatterns,
      })

      // Reset form
      setCurrentStep(1)
      setDurationWeeks(null)
      setPrimaryPatterns([])

      onOpenChange(false)
      onSuccess?.()
    } catch {
      alert('Failed to create mesocycle. Please try again.')
    }
  }

  const togglePattern = (patternId: Id<'patterns'>) => {
    setPrimaryPatterns((prev) => {
      const isSelected = prev.includes(patternId)
      if (isSelected) {
        return prev.filter((id) => id !== patternId)
      } else if (prev.length < 2) {
        return [...prev, patternId]
      }
      return prev
    })
  }

  const handleOpenChange = (isDialogOpen: boolean) => {
    if (!isDialogOpen) {
      // Reset form when closing
      setCurrentStep(1)
      setDurationWeeks(null)
      setPrimaryPatterns([])
    }
    onOpenChange(isDialogOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Mesocycle</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}
          </DialogDescription>
          <Progress value={progress} className="h-2 mt-2" />
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {currentStep === 1 && (
            <DurationStep
              durationWeeks={durationWeeks}
              onDurationChange={setDurationWeeks}
            />
          )}

          {currentStep === 2 && (
            <PatternSelectionStep
              patterns={patterns}
              primaryPatterns={primaryPatterns}
              onTogglePattern={togglePattern}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                void handleSubmit()
              }}
              disabled={!canProceed()}
            >
              Create Mesocycle
              <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
