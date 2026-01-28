import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Check } from 'lucide-react'
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
import { Input } from '@/components/ui/input'

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

  // Calculate total sets per week
  const numPrimaryPatterns = mesocycle?.primaryPatterns.length || 1
  const totalSetsPerWeek =
    setsPerPrimaryPatternPerWeek && numPrimaryPatterns > 0
      ? setsPerPrimaryPatternPerWeek * numPrimaryPatterns
      : null

  // Calculate sets per session
  const setsPerPrimaryPatternPerSession =
    setsPerPrimaryPatternPerWeek && sessionsPerWeek
      ? Math.floor(setsPerPrimaryPatternPerWeek / sessionsPerWeek)
      : null

  const totalSetsPerSession =
    totalSetsPerWeek && sessionsPerWeek
      ? Math.floor(totalSetsPerWeek / sessionsPerWeek)
      : null

  // Calculate total sets including secondary patterns (maintenance patterns get 1 set each)
  const numSecondaryPatterns =
    mesocycle && patterns
      ? patterns.length - mesocycle.primaryPatterns.length
      : 0
  const totalSetsPerSessionWithSecondary =
    totalSetsPerSession !== null
      ? totalSetsPerSession + numSecondaryPatterns
      : null

  // Check if sets per primary pattern divides evenly by sessions/week
  const isValidDistribution =
    setsPerPrimaryPatternPerWeek && sessionsPerWeek
      ? setsPerPrimaryPatternPerWeek % sessionsPerWeek === 0
      : true

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
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
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
          {/* Sessions Per Week */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Training Sessions Per Week
            </Label>
            <div className="inline-flex rounded-lg border border-input bg-background p-1">
              {[2, 3, 4, 5].map((sessions, index) => (
                <button
                  key={sessions}
                  type="button"
                  onClick={() => {
                    setSessionsPerWeek(sessions)
                    // Reset sets selection when sessions change
                    setSetsPerPrimaryPatternPerWeek(null)
                  }}
                  className={`
                    px-4 py-2 text-sm font-medium transition-all
                    ${index === 0 ? 'rounded-l-md' : ''}
                    ${index === [2, 3, 4, 5].length - 1 ? 'rounded-r-md' : ''}
                    ${
                      sessionsPerWeek === sessions
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  {sessions}
                </button>
              ))}
            </div>
          </div>

          {/* Sets Per Primary Pattern Per Week */}
          {sessionsPerWeek && (
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Sets Per Primary Pattern Per Week
              </Label>
              <RadioGroup
                value={setsPerPrimaryPatternPerWeek?.toString() || ''}
                onValueChange={(value) =>
                  setSetsPerPrimaryPatternPerWeek(parseInt(value))
                }
              >
                <div className="space-y-3">
                  {(() => {
                    // Generate options in 10-20 range that are divisible by sessionsPerWeek
                    const options = []
                    for (
                      let setsPerPattern = 10;
                      setsPerPattern <= 20;
                      setsPerPattern++
                    ) {
                      if (setsPerPattern % sessionsPerWeek === 0) {
                        options.push(setsPerPattern)
                      }
                    }

                    return options.map((setsPerPattern) => {
                      const setsPerSession = Math.floor(
                        setsPerPattern / sessionsPerWeek,
                      )

                      return (
                        <div
                          key={setsPerPattern}
                          className="flex items-center space-x-3"
                        >
                          <RadioGroupItem
                            value={setsPerPattern.toString()}
                            id={`sets-${setsPerPattern}`}
                          />
                          <Label
                            htmlFor={`sets-${setsPerPattern}`}
                            className="cursor-pointer flex-1"
                          >
                            <div className="font-medium">
                              {setsPerPattern} sets
                              <span className="text-muted-foreground ml-2">
                                ({setsPerSession} sets per session)
                              </span>
                            </div>
                          </Label>
                        </div>
                      )
                    })
                  })()}
                </div>
              </RadioGroup>
              {!isValidDistribution && setsPerPrimaryPatternPerWeek && (
                <p className="text-sm text-destructive mt-2">
                  Sets per pattern must be divisible by sessions per week
                </p>
              )}
            </div>
          )}

          {/* Rest Time */}
          <div>
            <Label
              htmlFor="restTime"
              className="text-base font-semibold mb-3 block"
            >
              Rest Time Between Sets (minutes)
            </Label>
            <Input
              id="restTime"
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={restTimeMinutes}
              onChange={(e) =>
                setRestTimeMinutes(parseFloat(e.target.value) || 3)
              }
              className="max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Recommended: 2-5 minutes for strength training
            </p>
          </div>

          {/* Training History */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Were you previously training?
            </Label>
            <RadioGroup
              value={
                wasPreviouslyTraining === null
                  ? ''
                  : wasPreviouslyTraining.toString()
              }
              onValueChange={(value) =>
                setWasPreviouslyTraining(value === 'true')
              }
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="true" id="training-yes" />
                  <Label htmlFor="training-yes" className="cursor-pointer">
                    Yes - I've been training consistently
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="false" id="training-no" />
                  <Label htmlFor="training-no" className="cursor-pointer">
                    No - Starting fresh or returning after a break
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {wasPreviouslyTraining === false && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm">
                  <strong>Build-up logic:</strong> Your first 2 weeks will use
                  50% volume, weeks 3-4 will use 75% volume, and weeks 5+ will
                  use full volume.
                </p>
              </div>
            )}
          </div>

          {/* Session Duration Preview */}
          {totalSetsPerSessionWithSecondary !== null &&
            setsPerPrimaryPatternPerSession !== null &&
            mesocycle &&
            patterns && (
              <div className="space-y-3 pt-2 border-t">
                <h4 className="font-semibold text-sm">Session Preview</h4>
                <div className="space-y-2 text-sm">
                  {/* Primary patterns */}
                  {mesocycle.primaryPatterns.map((patternId) => {
                    const pattern = patterns.find((p) => p._id === patternId)
                    return (
                      <div key={patternId} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {pattern?.displayName}:
                        </span>
                        <span className="font-medium">
                          {setsPerPrimaryPatternPerSession} sets
                        </span>
                      </div>
                    )
                  })}
                  {/* Secondary patterns (maintenance) */}
                  {numSecondaryPatterns > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Secondary patterns (maintenance):
                      </span>
                      <span className="font-medium">1 set each</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Total sets per session:</span>
                      <span>{totalSetsPerSessionWithSecondary}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Estimated duration: ~
                      {Math.round(
                        totalSetsPerSessionWithSecondary *
                          (2 + restTimeMinutes),
                      )}{' '}
                      minutes (assuming 2 min per set + {restTimeMinutes} min
                      rest)
                    </div>
                  </div>
                </div>
              </div>
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
