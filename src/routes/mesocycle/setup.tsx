import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

export const Route = createFileRoute('/mesocycle/setup')({
  component: MesocycleSetup,
})

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface MesocycleFormData {
  durationWeeks: number | null
  primaryPatterns: Id<"patterns">[]
  setsPerPrimaryPatternPerWeek: number | null // New field for sets per primary pattern
  targetSetsPerWeek: number | null // Calculated: setsPerPrimaryPatternPerWeek * numPatterns
  sessionsPerWeek: number | null
  wasPreviouslyTraining: boolean | null
  restTimeMinutes: number | null
}

function MesocycleSetup() {
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
      <MesocycleSetupContent userId={userId!} />
    </ProtectedRoute>
  )
}

function MesocycleSetupContent({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [formData, setFormData] = useState<MesocycleFormData>({
    durationWeeks: null,
    primaryPatterns: [],
    setsPerPrimaryPatternPerWeek: null,
    targetSetsPerWeek: null,
    sessionsPerWeek: null,
    wasPreviouslyTraining: null,
    restTimeMinutes: null,
  })

  const patterns = useQuery(api.patterns.getAll)
  const createMesocycle = useMutation(api.mesocycles.createMesocycle)

  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  // Calculate sets per primary pattern per week and total sets
  const numPrimaryPatterns = formData.primaryPatterns.length || 1
  const setsPerPrimaryPatternPerWeek = formData.setsPerPrimaryPatternPerWeek
  const calculatedTotalSetsPerWeek = setsPerPrimaryPatternPerWeek && numPrimaryPatterns > 0
    ? setsPerPrimaryPatternPerWeek * numPrimaryPatterns
    : null

  // Calculate sets per primary pattern per session
  const setsPerPrimaryPatternPerSession = setsPerPrimaryPatternPerWeek && formData.sessionsPerWeek
    ? Math.floor(setsPerPrimaryPatternPerWeek / formData.sessionsPerWeek)
    : null

  // Calculate total sets per session (across all patterns)
  const totalSetsPerSession = calculatedTotalSetsPerWeek && formData.sessionsPerWeek
    ? Math.floor(calculatedTotalSetsPerWeek / formData.sessionsPerWeek)
    : null

  // Check if sets per primary pattern divides evenly by sessions/week
  const isValidDistribution = setsPerPrimaryPatternPerWeek && formData.sessionsPerWeek
    ? setsPerPrimaryPatternPerWeek % formData.sessionsPerWeek === 0
    : true

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.durationWeeks !== null
      case 2:
        return formData.primaryPatterns.length >= 1 && formData.primaryPatterns.length <= 2
      case 3:
        return formData.sessionsPerWeek !== null
      case 4:
        return formData.setsPerPrimaryPatternPerWeek !== null &&
               formData.wasPreviouslyTraining !== null &&
               isValidDistribution
      case 5:
        return formData.restTimeMinutes !== null && formData.restTimeMinutes > 0
      case 6:
        return true
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
    if (!canProceed()) return

    try {
      const mesocycleId = await createMesocycle({
        userId,
        startDate: Date.now(),
        durationWeeks: formData.durationWeeks!,
        primaryPatterns: formData.primaryPatterns,
        targetSetsPerWeek: calculatedTotalSetsPerWeek!,
        sessionsPerWeek: formData.sessionsPerWeek!,
        wasPreviouslyTraining: formData.wasPreviouslyTraining!,
        restTimeMinutes: formData.restTimeMinutes!,
      })

      // Navigate to dashboard after successful creation
      navigate({ to: '/' })
    } catch (error) {
      console.error('Failed to create mesocycle:', error)
      alert('Failed to create mesocycle. Please try again.')
    }
  }

  const togglePattern = (patternId: Id<"patterns">) => {
    setFormData((prev) => {
      const isSelected = prev.primaryPatterns.includes(patternId)
      if (isSelected) {
        return { ...prev, primaryPatterns: prev.primaryPatterns.filter(id => id !== patternId) }
      } else if (prev.primaryPatterns.length < 2) {
        return { ...prev, primaryPatterns: [...prev.primaryPatterns, patternId] }
      }
      return prev
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Set Up Your Mesocycle</h1>
        <p className="text-muted-foreground mb-4">
          Step {currentStep} of {totalSteps}
        </p>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-semibold">
              {currentStep === 1 && 'Duration'}
              {currentStep === 2 && 'Primary Patterns'}
              {currentStep === 3 && 'Training Frequency'}
              {currentStep === 4 && 'Volume & Training History'}
              {currentStep === 5 && 'Rest Time'}
              {currentStep === 6 && 'Summary'}
            </h2>
          </CardTitle>
          <CardDescription>
            <p>
              {currentStep === 1 && 'How long will this training block last?'}
              {currentStep === 2 && 'Select 1-2 movement patterns to focus on'}
              {currentStep === 3 && 'How many sessions per week will you train?'}
              {currentStep === 4 && 'Set your weekly volume per primary pattern'}
              {currentStep === 5 && 'Configure rest time between sets'}
              {currentStep === 6 && 'Review your mesocycle configuration'}
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Duration */}
          {currentStep === 1 && (
            <RadioGroup
              value={formData.durationWeeks?.toString() || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, durationWeeks: parseInt(value) }))}
            >
              <div className="space-y-3">
                {[4, 6, 8].map((weeks) => (
                  <div key={weeks} className="flex items-center space-x-3">
                    <RadioGroupItem value={weeks.toString()} id={`duration-${weeks}`} />
                    <Label htmlFor={`duration-${weeks}`} className="cursor-pointer flex-1">
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
          )}

          {/* Step 2: Primary Patterns */}
          {currentStep === 2 && (
            <div>
              <div className="grid grid-cols-2 gap-2">
                {patterns?.map((pattern) => {
                  const isSelected = formData.primaryPatterns.includes(pattern._id)
                  return (
                    <Card
                      key={pattern._id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => togglePattern(pattern._id)}
                    >
                      <CardContent className="p-2 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{pattern.displayName}</div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Selected: {formData.primaryPatterns.length} of 2
              </p>
            </div>
          )}

          {/* Step 3: Training Frequency */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Training Sessions Per Week</Label>
                <div className="inline-flex rounded-lg border border-input bg-background p-1">
                  {[2, 3, 4, 5].map((sessions, index) => (
                    <button
                      key={sessions}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sessionsPerWeek: sessions }))}
                      className={`
                        px-4 py-2 text-sm font-medium transition-all
                        ${index === 0 ? 'rounded-l-md' : ''}
                        ${index === [2, 3, 4, 5].length - 1 ? 'rounded-r-md' : ''}
                        ${formData.sessionsPerWeek === sessions
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                    >
                      {sessions}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Select number of training sessions per week
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Volume & Training History */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label>Sets Per Primary Pattern Per Week</Label>
                <RadioGroup
                  value={formData.setsPerPrimaryPatternPerWeek?.toString() || ''}
                  onValueChange={(value) => {
                    const setsPerPattern = parseInt(value)
                    const numPatterns = formData.primaryPatterns.length || 1
                    setFormData(prev => ({ 
                      ...prev, 
                      setsPerPrimaryPatternPerWeek: setsPerPattern,
                      targetSetsPerWeek: setsPerPattern * numPatterns
                    }))
                  }}
                  className="mt-2"
                >
                  <div className="space-y-3">
                    {(() => {
                      // Generate options in 10-20 range that are divisible by sessionsPerWeek
                      if (!formData.sessionsPerWeek) {
                        return null
                      }
                      
                      const sessionsPerWeek = formData.sessionsPerWeek
                      const options = []
                      
                      // Check each number from 10 to 20
                      for (let setsPerPattern = 10; setsPerPattern <= 20; setsPerPattern++) {
                        // Only include if divisible by sessions per week
                        if (setsPerPattern % sessionsPerWeek === 0) {
                          options.push(setsPerPattern)
                        }
                      }
                      
                      return options.map((setsPerPattern) => {
                        const setsPerSession = Math.floor(setsPerPattern / sessionsPerWeek)
                        
                        return (
                          <div key={setsPerPattern} className="flex items-center space-x-3">
                            <RadioGroupItem 
                              value={setsPerPattern.toString()} 
                              id={`sets-${setsPerPattern}`}
                            />
                            <Label 
                              htmlFor={`sets-${setsPerPattern}`} 
                              className="cursor-pointer flex-1"
                            >
                              <div className="font-medium">
                                {setsPerPattern} sets per primary pattern per week
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
              </div>

              <div>
                <Label>Were you previously training?</Label>
                <RadioGroup
                  value={formData.wasPreviouslyTraining === null ? '' : formData.wasPreviouslyTraining.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, wasPreviouslyTraining: value === 'true' }))}
                  className="mt-2"
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
                {formData.wasPreviouslyTraining === false && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm">
                      <strong>Build-up logic:</strong> Your first 2 weeks will use 50% volume, weeks 3-4 will use 75% volume, and weeks 5+ will use full volume.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Rest Time */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="restTime">Rest Time Between Sets (minutes)</Label>
                <Input
                  id="restTime"
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={formData.restTimeMinutes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, restTimeMinutes: parseFloat(e.target.value) || null }))}
                  placeholder="3"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: 2-5 minutes for strength training
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Summary */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{formData.durationWeeks} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Patterns:</span>
                  <span className="font-medium">
                    {patterns?.filter(p => formData.primaryPatterns.includes(p._id)).map(p => p.displayName).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions Per Week:</span>
                  <span className="font-medium">{formData.sessionsPerWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sets Per Primary Pattern Per Week:</span>
                  <span className="font-medium">{formData.setsPerPrimaryPatternPerWeek}</span>
                </div>
                {calculatedTotalSetsPerWeek !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sets Per Week:</span>
                    <span className="font-medium">{calculatedTotalSetsPerWeek}</span>
                  </div>
                )}
                {setsPerPrimaryPatternPerSession !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sets Per Primary Pattern Per Session:</span>
                    <span className="font-medium">{setsPerPrimaryPatternPerSession}</span>
                  </div>
                )}
                {totalSetsPerSession !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sets Per Session:</span>
                    <span className="font-medium">{totalSetsPerSession}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rest Time:</span>
                  <span className="font-medium">{formData.restTimeMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training History:</span>
                  <span className="font-medium">
                    {formData.wasPreviouslyTraining ? 'Previously training' : 'Starting fresh'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
              >
                Create Mesocycle
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
