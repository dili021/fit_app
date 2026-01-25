import { useState, useEffect, useRef } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Play, Square, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface SetLoggerProps {
  workoutId: Id<"workouts">
  patternId: Id<"patterns">
  exerciseId: Id<"exercises">
  userId: string
  setNumber: number
  totalSets: number
  onSetComplete: () => void
  restTimeMinutes: number
  onTimerStart?: () => void
  onTimerStop?: () => void
  onTimerUpdate?: (seconds: number) => void
  onRestTimerStart?: (seconds: number) => void
  onRestTimerUpdate?: (seconds: number) => void
  onRestTimerComplete?: () => void
}

export function SetLogger({
  workoutId,
  patternId,
  exerciseId,
  userId,
  setNumber,
  totalSets,
  onSetComplete,
  restTimeMinutes,
  onTimerStart,
  onTimerStop,
  onTimerUpdate,
  onRestTimerStart,
  onRestTimerUpdate,
  onRestTimerComplete,
}: SetLoggerProps) {
  const [weight, setWeight] = useState<string>('')
  const [reps, setReps] = useState<string>('')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null)
  const timerIntervalRef = useRef<number | null>(null)
  const restIntervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const restTimerUpdateRef = useRef(onRestTimerUpdate)
  const restTimerCompleteRef = useRef(onRestTimerComplete)
  const timerUpdateRef = useRef(onTimerUpdate)

  // Update refs when callbacks change
  useEffect(() => {
    restTimerUpdateRef.current = onRestTimerUpdate
    restTimerCompleteRef.current = onRestTimerComplete
    timerUpdateRef.current = onTimerUpdate
  }, [onRestTimerUpdate, onRestTimerComplete, onTimerUpdate])

  const lastSet = useQuery(api.sets.getLastSetForExercise, {
    exerciseId,
    userId,
  })
  const createSet = useMutation(api.sets.createSet)

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Load last weight/reps when exercise changes
  // Component remounts when exerciseId changes (via key prop), so this will populate fresh state
  // Weight/reps persist when completing sets on the same exercise (key doesn't change)
  useEffect(() => {
    if (lastSet) {
      setWeight(lastSet.weight.toString())
      setReps(lastSet.reps.toString())
    } else {
      // Reset if no last set found
      setWeight('')
      setReps('')
    }
  }, [lastSet, exerciseId])

  // Timer logic - sync with parent overlay
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          const newValue = prev + 1
          // Use ref to avoid calling during render
          setTimeout(() => {
            timerUpdateRef.current?.(newValue)
          }, 0)
          return newValue
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isTimerRunning])

  // Rest timer logic - sync with parent overlay
  useEffect(() => {
    if (restSecondsRemaining !== null && restSecondsRemaining > 0) {
      restIntervalRef.current = window.setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            // Rest complete - show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Rest Complete', {
                body: 'Time to start your next set!',
              })
            }
            // Use ref to avoid calling during render
            setTimeout(() => {
              restTimerCompleteRef.current?.()
            }, 0)
            return null
          }
          const newValue = prev - 1
          // Use ref to avoid calling during render
          setTimeout(() => {
            restTimerUpdateRef.current?.(newValue)
          }, 0)
          return newValue
        })
      }, 1000)
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current)
        restIntervalRef.current = null
      }
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current)
      }
    }
  }, [restSecondsRemaining])

  const handleStartTimer = () => {
    setIsTimerRunning(true)
    startTimeRef.current = Date.now()
    setElapsedSeconds(0) // Reset when starting
    onTimerStart?.() // This will show the overlay
  }

  const handleStopTimer = () => {
    setIsTimerRunning(false)
    onTimerStop?.()
  }

  // Sync local timer state with parent when timer updates
  useEffect(() => {
    if (isTimerRunning && onTimerUpdate) {
      // Timer is managed by parent, but we keep local state for display
      // Parent will call onTimerUpdate with the current seconds
    }
  }, [isTimerRunning, onTimerUpdate])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCompleteSet = async () => {
    if (!weight || !reps) return

    const endTime = Date.now()
    const startTime = startTimeRef.current || endTime
    const duration = Math.floor((endTime - startTime) / 1000)

    try {
      await createSet({
        workoutId,
        patternId,
        exerciseId,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        orderInWorkout: setNumber,
        startTime,
        endTime,
        duration,
      })

      // Start rest timer
      const restSeconds = restTimeMinutes * 60
      setRestSecondsRemaining(restSeconds)
      onRestTimerStart?.(restSeconds)
      setIsTimerRunning(false)
      setElapsedSeconds(0)
      startTimeRef.current = null

      // Call completion callback
      onSetComplete()
    } catch (error) {
      console.error('Failed to save set:', error)
      alert('Failed to save set. Please try again.')
    }
  }

  const canComplete = weight && reps

  return (
    <div className="w-full space-y-6">
      {/* Timer Button - Opens overlay when clicked */}
      <Button
        onClick={handleStartTimer}
        variant="outline"
        className="w-full"
        disabled={!!restSecondsRemaining || isTimerRunning}
      >
        <Play className="h-4 w-4 mr-2" />
        Start Timer
      </Button>

      {/* Weight and Reps Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={lastSet?.weight.toString() || '0'}
            className="mt-2 text-lg"
          />
          {lastSet && (
            <p className="text-xs text-muted-foreground mt-1">
              Last: {lastSet.weight}kg
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="reps">Reps</Label>
          <Input
            id="reps"
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder={lastSet?.reps.toString() || '0'}
            className="mt-2 text-lg"
          />
          {lastSet && (
            <p className="text-xs text-muted-foreground mt-1">
              Last: {lastSet.reps} reps
            </p>
          )}
        </div>
      </div>


      {/* Complete Set Button */}
      <Button
        onClick={handleCompleteSet}
        size="lg"
        className="w-full"
        disabled={!canComplete}
      >
        <Check className="h-5 w-5 mr-2" />
        Complete Set
      </Button>
    </div>
  )
}
