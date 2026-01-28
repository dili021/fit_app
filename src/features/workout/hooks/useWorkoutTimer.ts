import { useEffect, useRef, useState } from 'react'

interface UseWorkoutTimerOptions {
  onUpdate?: (seconds: number) => void
  onStart?: () => void
  onStop?: () => void
  onReset?: () => void
}

export function useWorkoutTimer({
  onUpdate,
  onStart,
  onStop,
  onReset,
}: UseWorkoutTimerOptions = {}) {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerIntervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const timerUpdateRef = useRef(onUpdate)

  // Update ref when callback changes
  useEffect(() => {
    timerUpdateRef.current = onUpdate
  }, [onUpdate])

  // Timer logic - sync with parent overlay
  useEffect(() => {
    if (isTimerRunning) {
      let elapsed = 0
      const handleTimerUpdate = (currentElapsed: number) => {
        // Use ref to avoid calling during render
        setTimeout(() => {
          timerUpdateRef.current?.(currentElapsed)
        }, 0)
      }

      timerIntervalRef.current = window.setInterval(() => {
        elapsed += 1
        handleTimerUpdate(elapsed)
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

  const startTimer = () => {
    setIsTimerRunning(true)
    startTimeRef.current = Date.now()
    onStart?.()
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    startTimeRef.current = null
    onStop?.()
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    startTimeRef.current = null
    onReset?.()
  }

  return {
    isTimerRunning,
    startTime: startTimeRef.current,
    startTimer,
    stopTimer,
    resetTimer,
  }
}
