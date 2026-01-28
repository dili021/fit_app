import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ArrowRight, Check } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
    } catch (error) {
      console.error('Failed to create mesocycle:', error)
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
          {/* Step 1: Duration */}
          {currentStep === 1 && (
            <div>
              <Label className="text-base font-semibold mb-4 block">
                Duration
              </Label>
              <RadioGroup
                value={durationWeeks?.toString() || ''}
                onValueChange={(value) => setDurationWeeks(parseInt(value))}
              >
                <div className="space-y-3">
                  {[4, 6, 8].map((weeks) => (
                    <div key={weeks} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={weeks.toString()}
                        id={`duration-${weeks}`}
                      />
                      <Label
                        htmlFor={`duration-${weeks}`}
                        className="cursor-pointer flex-1"
                      >
                        <div className="font-medium">{weeks} weeks</div>
                        <div className="text-sm text-muted-foreground">
                          {weeks === 4 && 'Quick cycle'}
                          {weeks === 6 && 'Standard cycle (recommended)'}
                          {weeks === 8 && 'Extended cycle'}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Primary Patterns */}
          {currentStep === 2 && (
            <div>
              <Label className="text-base font-semibold mb-4 block">
                Primary Patterns
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select 1-2 movement patterns to focus on
              </p>
              <div className="grid grid-cols-2 gap-2">
                {patterns?.map((pattern) => {
                  const isSelected = primaryPatterns.includes(pattern._id)
                  return (
                    <Card
                      key={pattern._id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => togglePattern(pattern._id)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {pattern.displayName}
                          </div>
                          {pattern.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {pattern.description}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Selected: {primaryPatterns.length} of 2
              </p>
            </div>
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
            <Button onClick={handleSubmit} disabled={!canProceed()}>
              Create Mesocycle
              <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
