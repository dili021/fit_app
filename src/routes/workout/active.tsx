import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Check } from 'lucide-react'
import { ExerciseCarousel } from '@/components/workout/ExerciseCarousel'
import { SetLogger } from '@/components/workout/SetLogger'
import { TimerOverlay } from '@/components/workout/TimerOverlay'
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay'
import { WorkoutOverview } from '@/components/workout/WorkoutOverview'

const workoutActiveSearchSchema = z.object({
  workoutId: z.string().optional(),
})

export const Route = createFileRoute('/workout/active')({
  component: ActiveWorkout,
  validateSearch: workoutActiveSearchSchema,
})

function ActiveWorkout() {
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
      {userId ? <ActiveWorkoutContent userId={userId} /> : null}
    </ProtectedRoute>
  )
}

function ActiveWorkoutContent({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const { workoutId } = Route.useSearch()
  
  // All hooks must be called unconditionally at the top
  const activeWorkout = useQuery(
    api.workouts.getActiveWorkout,
    { userId }
  )
  const workout = useQuery(
    api.workouts.getWorkoutById,
    workoutId ? { id: workoutId as Id<"workouts"> } : "skip"
  )
  // Use provided workoutId or fall back to active workout
  const currentWorkout = workout || activeWorkout

  const mesocycle = useQuery(
    api.mesocycles.getMesocycleById,
    currentWorkout?.mesocycleId ? { id: currentWorkout.mesocycleId } : "skip"
  )
  const workoutTemplate = useQuery(
    api.workouts.generateWorkoutTemplate,
    mesocycle ? { mesocycleId: mesocycle._id } : "skip"
  )
  const exercises = useQuery(api.exercises.getAll, {})
  const patterns = useQuery(api.patterns.getAll, {})

  const [currentPatternIndex, setCurrentPatternIndex] = useState(0)
  const [selectedExerciseId, setSelectedExerciseId] = useState<Id<"exercises"> | null>(null)
  const [completedSets, setCompletedSets] = useState(0)
  const [currentSetNumber, setCurrentSetNumber] = useState(1)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [showTimerOverlay, setShowTimerOverlay] = useState(false)
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null)
  const [restTimerStopped, setRestTimerStopped] = useState(false)
  const [pendingPatternNavigation, setPendingPatternNavigation] = useState(false)
  const [showWorkoutOverview, setShowWorkoutOverview] = useState(false)
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0)
  const sessionTimerIntervalRef = useRef<number | null>(null)

  // Get sets for this workout to track progress
  const workoutSets = useQuery(
    api.sets.getSetsForWorkout,
    currentWorkout ? { workoutId: currentWorkout._id } : "skip"
  )

  const completeWorkout = useMutation(api.workouts.completeWorkout)

  // Get progression suggestion for current exercise (for rest timer display)
  // Must be called unconditionally (before early returns), but can skip when data not available
  const progressionSuggestion = useQuery(
    api.progression.getSuggestedWeight,
    workoutTemplate && selectedExerciseId && workoutTemplate.template[currentPatternIndex]
      ? {
          userId,
          exerciseId: selectedExerciseId,
          patternId: workoutTemplate.template[currentPatternIndex].patternId,
        }
      : "skip"
  )

  // Calculate completed sets for current pattern (across all exercises in the pattern)
  useEffect(() => {
    if (workoutSets && workoutTemplate?.template[currentPatternIndex]) {
      const currentPattern = workoutTemplate.template[currentPatternIndex]
      // Count all sets for this pattern, regardless of exercise
      const patternSets = workoutSets.filter(
        (s) => s.patternId === currentPattern.patternId
      )
      setCompletedSets(patternSets.length)
      setCurrentSetNumber(patternSets.length + 1)
    } else {
      setCompletedSets(0)
      setCurrentSetNumber(1)
    }
  }, [workoutSets, workoutTemplate, currentPatternIndex])

  // Reset timer state when pattern or exercise changes
  useEffect(() => {
    setIsTimerRunning(false)
    setTimerSeconds(0)
    setShowTimerOverlay(false)
    setRestSecondsRemaining(null)
    setRestTimerStopped(false)
    setPendingPatternNavigation(false)
  }, [currentPatternIndex, selectedExerciseId])

  // Calculate if all sets are completed for the workout (must be before early returns)
  const allSetsCompleted = workoutSets && workoutTemplate ? (() => {
    for (const pattern of workoutTemplate.template) {
      const patternSets = workoutSets.filter((s) => s.patternId === pattern.patternId)
      if (patternSets.length < pattern.sets) {
        return false
      }
    }
    return true
  })() : false

  // Show overview when all sets are completed (only once) - MUST be before early returns
  useEffect(() => {
    if (allSetsCompleted && workoutSets && workoutSets.length > 0 && !showWorkoutOverview) {
      // Small delay to ensure all data is loaded
      const timer = setTimeout(() => {
        setShowWorkoutOverview(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [allSetsCompleted, workoutSets, showWorkoutOverview])

  // Session timer - starts when workout starts, runs until workout is concluded - MUST be before early returns
  useEffect(() => {
    if (currentWorkout?.startedAt && !currentWorkout.completed && !showWorkoutOverview) {
      // Calculate initial elapsed time
      const initialElapsed = Math.floor((Date.now() - currentWorkout.startedAt) / 1000)
      setSessionElapsedSeconds(initialElapsed)

      // Update every second
      sessionTimerIntervalRef.current = window.setInterval(() => {
        setSessionElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      // Stop timer when workout is completed or overview is shown
      if (sessionTimerIntervalRef.current) {
        clearInterval(sessionTimerIntervalRef.current)
        sessionTimerIntervalRef.current = null
      }
      // Calculate final elapsed time if workout is completed
      if (currentWorkout?.startedAt && currentWorkout.completedAt) {
        const finalElapsed = Math.floor((currentWorkout.completedAt - currentWorkout.startedAt) / 1000)
        setSessionElapsedSeconds(finalElapsed)
      }
    }

    return () => {
      if (sessionTimerIntervalRef.current) {
        clearInterval(sessionTimerIntervalRef.current)
      }
    }
  }, [currentWorkout?.startedAt, currentWorkout?.completed, currentWorkout?.completedAt, showWorkoutOverview])

  // Loading state - check if queries are still loading
  if (activeWorkout === undefined || (workoutId && workout === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  // No workout found
  if (!currentWorkout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Active Workout</h2>
          <p className="text-muted-foreground mb-4">
            Start a new workout from the workout page
          </p>
          <Button onClick={() => navigate({ to: '/workout' })}>
            Go to Workout Page
          </Button>
        </div>
      </div>
    )
  }

  // Loading mesocycle or template
  if (mesocycle === undefined || workoutTemplate === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  // No mesocycle or template found
  if (!mesocycle || !workoutTemplate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workout Data Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Unable to load workout template. Please start a new workout.
          </p>
          <Button onClick={() => navigate({ to: '/workout' })}>
            Go to Workout Page
          </Button>
        </div>
      </div>
    )
  }

  const currentPattern = workoutTemplate.template[currentPatternIndex]
  const isLastPattern = currentPatternIndex === workoutTemplate.template.length - 1
  const nextPattern = !isLastPattern ? workoutTemplate.template[currentPatternIndex + 1] : null

  // Check if all primary pattern sets are completed
  const allPrimarySetsCompleted = workoutSets && workoutTemplate ? (() => {
    const primaryPatterns = workoutTemplate.template.filter((p) => p.isPrimary)
    for (const pattern of primaryPatterns) {
      const patternSets = workoutSets.filter((s) => s.patternId === pattern.patternId)
      if (patternSets.length < pattern.sets) {
        return false
      }
    }
    return true
  })() : false

  // Check if Next Pattern button should be disabled
  const isNextPatternDisabled = nextPattern 
    ? !nextPattern.isPrimary && !allPrimarySetsCompleted
    : false

  const handleNextPattern = () => {
    if (!isLastPattern && !isNextPatternDisabled) {
      setCurrentPatternIndex((prev) => prev + 1)
      setSelectedExerciseId(null)
      setCompletedSets(0)
      setCurrentSetNumber(1)
      setPendingPatternNavigation(false)
    }
  }

  const handlePreviousPattern = () => {
    if (currentPatternIndex > 0) {
      setCurrentPatternIndex((prev) => prev - 1)
      setSelectedExerciseId(null)
      setCompletedSets(0)
      setCurrentSetNumber(1)
    }
  }

  const handleTimerStart = () => {
    setIsTimerRunning(true)
    setShowTimerOverlay(true)
    setTimerSeconds(0) // Reset timer when starting
  }

  const handleTimerStop = () => {
    setIsTimerRunning(false)
    setShowTimerOverlay(false) // Hide overlay when stopped
  }

  const handleTimerReset = () => {
    setIsTimerRunning(false)
    setTimerSeconds(0)
    setShowTimerOverlay(false)
  }

  const handleRestTimerStart = (seconds: number) => {
    setRestSecondsRemaining(seconds)
    setRestTimerStopped(false) // Reset stop flag when starting
  }

  const handleRestTimerUpdate = (seconds: number) => {
    setRestSecondsRemaining(seconds)
  }

  const handleRestTimerComplete = () => {
    setRestSecondsRemaining(null)
    setRestTimerStopped(false) // Reset stop flag when rest completes naturally
    // Reset timer state when rest completes to enable timer button
    setIsTimerRunning(false)
    setTimerSeconds(0)
    setShowTimerOverlay(false)
    // Check if we need to navigate after rest completes
    if (pendingPatternNavigation) {
      handleNextPattern()
    }
  }

  const handleRestTimerStop = () => {
    // Signal SetLogger to stop its rest timer
    setRestTimerStopped(true)
    // Stopping rest timer stops it completely
    setRestSecondsRemaining(null)
    // Reset timer state to enable timer button
    setIsTimerRunning(false)
    setTimerSeconds(0)
    setShowTimerOverlay(false)
    // Check if we need to navigate after stopping
    if (pendingPatternNavigation) {
      handleNextPattern()
    }
  }

  const handleSetComplete = () => {
    // After completing a set, workoutSets will update and useEffect will recalculate currentSetNumber
    // Check if this was the last set for the current pattern
    // Use currentSetNumber which represents the set we just completed (before it increments)
    // If currentSetNumber equals totalSets, we just completed the last set
    const justCompletedSetNumber = currentSetNumber
    
    if (justCompletedSetNumber === currentPattern.sets) {
      // We just completed the exact number of sets required - check if we should auto-navigate
      const shouldNav = (() => {
        if (isLastPattern) return false
        if (!nextPattern) return false
        
        // Check if all primary patterns are completed, accounting for the set we just completed
        const allPrimsDone = (() => {
          if (!workoutTemplate) return false
          const primaryPatterns = workoutTemplate.template.filter((p) => p.isPrimary)
          for (const pattern of primaryPatterns) {
            const patternSets = workoutSets?.filter((s) => s.patternId === pattern.patternId) || []
            // If this is the current pattern, add 1 to account for the set we just completed
            const count = pattern.patternId === currentPattern.patternId 
              ? patternSets.length + 1 
              : patternSets.length
            if (count < pattern.sets) {
              return false
            }
          }
          return true
        })()
        
        // Auto-navigate if: prim->prim, sec->sec, or prim->sec (when all prims done)
        if (currentPattern.isPrimary && nextPattern.isPrimary) return true
        if (!currentPattern.isPrimary && !nextPattern.isPrimary) return true
        if (currentPattern.isPrimary && !nextPattern.isPrimary && allPrimsDone) return true
        
        return false
      })()
      
      if (shouldNav) {
        setPendingPatternNavigation(true)
      }
    }
  }


  const handleConcludeSession = async () => {
    try {
      await completeWorkout({ workoutId: currentWorkout._id })
      navigate({ to: '/' })
    } catch (error) {
      console.error('Failed to complete workout:', error)
      alert('Failed to complete workout. Please try again.')
    }
  }

  const handleCompleteWorkoutFromOverview = async () => {
    try {
      await completeWorkout({ workoutId: currentWorkout._id })
      navigate({ to: '/' })
    } catch (error) {
      console.error('Failed to complete workout:', error)
      alert('Failed to complete workout. Please try again.')
    }
  }

  // Show workout overview if all sets are completed
  if (showWorkoutOverview && workoutSets && exercises && patterns) {
    // Calculate total session time from workout start to now (or completedAt if completed)
    const totalSessionTime = currentWorkout?.startedAt 
      ? Math.floor(((currentWorkout.completedAt || Date.now()) - currentWorkout.startedAt) / 1000)
      : 0

    return (
      <WorkoutOverview
        sets={workoutSets}
        exercises={exercises}
        patterns={patterns}
        totalSessionTime={totalSessionTime}
        onComplete={handleCompleteWorkoutFromOverview}
      />
    )
  }

  return (
    <>
      {/* Timer Overlay - Shows when timer is running */}
      <TimerOverlay
        isVisible={showTimerOverlay && isTimerRunning}
        onStart={handleTimerStart}
        onStop={handleTimerStop}
        elapsedSeconds={timerSeconds}
        isRunning={isTimerRunning}
      />

      {/* Rest Timer Overlay - Always visible when rest timer is running */}
      <RestTimerOverlay
        isVisible={restSecondsRemaining !== null && restSecondsRemaining > 0}
        secondsRemaining={restSecondsRemaining || 0}
        onDismiss={handleRestTimerStop}
        progressionSuggestion={progressionSuggestion || null}
      />
      
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${completedSets >= currentPattern.sets ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''}`}>
        <div className="flex items-center gap-3 flex-1">
          {/* Pattern Name */}
          <div className="flex items-center gap-2">
            {completedSets >= currentPattern.sets && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                <Check className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-semibold ${completedSets >= currentPattern.sets ? 'text-green-700 dark:text-green-400' : ''}`}>
                  {currentPattern.patternName}
                </h1>
                {currentPattern.isPrimary && (
                  <Badge variant="default" className="text-xs">
                    Primary
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Pattern Dots Indicator */}
          <div className="flex items-center gap-1.5 ml-auto">
            {workoutTemplate.template.map((pattern, index) => {
              const isCurrent = index === currentPatternIndex
              const isCompleted = workoutSets && (() => {
                const patternSets = workoutSets.filter(s => s.patternId === pattern.patternId)
                return patternSets.length >= pattern.sets
              })()
              
              return (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isCurrent
                      ? 'w-6 bg-primary scale-110'
                      : isCompleted
                      ? 'bg-green-500'
                      : 'bg-muted'
                  }`}
                  aria-label={`Pattern ${index + 1}: ${pattern.patternName}`}
                />
              )
            })}
          </div>
        </div>
        
        {/* Session Timer - Centered and Larger */}
        {currentWorkout?.startedAt && (
          <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-mono font-bold text-foreground">
            {Math.floor(sessionElapsedSeconds / 60)}:{(sessionElapsedSeconds % 60).toString().padStart(2, '0')}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/' })}
          className="ml-auto"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content - Full Screen Pattern View */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          {/* Exercise Carousel - Top Half */}
          {selectedExerciseId ? (
            <ExerciseCarousel
              patternId={currentPattern.patternId}
              selectedExerciseId={selectedExerciseId}
              onSelectExercise={setSelectedExerciseId}
            />
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Select an exercise to begin</p>
              <ExerciseCarousel
                patternId={currentPattern.patternId}
                selectedExerciseId={null}
                onSelectExercise={setSelectedExerciseId}
              />
            </div>
          )}
        </div>
        
        {/* Bottom Half - Set Logger with Set Dots */}
        {selectedExerciseId && (
          <div className="border-t p-6 space-y-4">
            {/* Set Dots Indicator */}
            <div className="flex justify-center items-center gap-2">
              {Array.from({ length: currentPattern.sets }, (_, i) => {
                const setNumber = i + 1
                const isCurrent = setNumber === currentSetNumber
                const isCompleted = setNumber < currentSetNumber
                
                return (
                  <div
                    key={setNumber}
                    className={`transition-all ${
                      isCurrent
                        ? 'w-8 h-3 bg-primary rounded-full scale-110'
                        : isCompleted
                        ? 'w-3 h-3 bg-green-500 rounded-full'
                        : 'w-3 h-3 bg-muted rounded-full'
                    }`}
                    aria-label={`Set ${setNumber}`}
                  />
                )
              })}
            </div>
            
            {/* Set Logger */}
            <SetLogger
              key={selectedExerciseId}
              workoutId={currentWorkout._id}
              patternId={currentPattern.patternId}
              exerciseId={selectedExerciseId}
              userId={userId}
              setNumber={currentSetNumber}
              totalSets={currentPattern.sets}
              onSetComplete={handleSetComplete}
              restTimeMinutes={mesocycle.restTimeMinutes}
              onTimerStart={handleTimerStart}
              onTimerStop={handleTimerStop}
              onTimerUpdate={setTimerSeconds}
              onTimerReset={handleTimerReset}
              onRestTimerStart={handleRestTimerStart}
              onRestTimerUpdate={handleRestTimerUpdate}
              onRestTimerComplete={handleRestTimerComplete}
              restTimerStopped={restTimerStopped}
            />
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t p-4 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousPattern}
            disabled={currentPatternIndex === 0}
            className="flex-1"
          >
            Previous
          </Button>
          {!isLastPattern ? (
            <Button
              onClick={handleNextPattern}
              className="flex-1"
              disabled={isNextPatternDisabled}
            >
              Next Pattern
            </Button>
          ) : (
            <div className="flex-1" />
          )}
        </div>
        <Button
          onClick={handleConcludeSession}
          variant={allSetsCompleted ? "default" : "destructive"}
          className={`w-full ${allSetsCompleted ? '!bg-green-600 hover:!bg-green-700 text-white' : ''}`}
        >
          Conclude Session
        </Button>
      </div>
    </div>
    </>
  )
}
