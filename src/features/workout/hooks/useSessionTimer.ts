import { useEffect, useRef, useState } from 'react'
import type { Doc } from '../../../../convex/_generated/dataModel'

interface UseSessionTimerProps {
  currentWorkout: Doc<'workouts'> | null | undefined
  showWorkoutOverview: boolean
}

/**
 * Hook for managing session timer (total workout duration)
 */
export function useSessionTimer({
  currentWorkout,
  showWorkoutOverview,
}: UseSessionTimerProps) {
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0)
  const sessionTimerIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (
      currentWorkout?.startedAt &&
      !currentWorkout.completed &&
      !showWorkoutOverview
    ) {
      // Calculate initial elapsed time
      const initialElapsed = Math.floor(
        (Date.now() - currentWorkout.startedAt) / 1000,
      )
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
        const finalElapsed = Math.floor(
          (currentWorkout.completedAt - currentWorkout.startedAt) / 1000,
        )
        setSessionElapsedSeconds(finalElapsed)
      }
    }

    return () => {
      if (sessionTimerIntervalRef.current) {
        clearInterval(sessionTimerIntervalRef.current)
      }
    }
  }, [
    currentWorkout?.startedAt,
    currentWorkout?.completed,
    currentWorkout?.completedAt,
    showWorkoutOverview,
  ])

  return sessionElapsedSeconds
}
