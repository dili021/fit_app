import { useEffect, useRef, useState } from 'react'

interface UseRestTimerOptions {
  restTimeMinutes: number
  onStart?: (seconds: number) => void
  onUpdate?: (seconds: number) => void
  onComplete?: () => void
  stopped?: boolean
}

export function useRestTimer({
  restTimeMinutes,
  onStart,
  onUpdate,
  onComplete,
  stopped = false,
}: UseRestTimerOptions) {
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<
    number | null
  >(null)
  const restIntervalRef = useRef<number | null>(null)
  const restTimerUpdateRef = useRef(onUpdate)
  const restTimerCompleteRef = useRef(onComplete)

  // Update refs when callbacks change
  useEffect(() => {
    restTimerUpdateRef.current = onUpdate
    restTimerCompleteRef.current = onComplete
  }, [onUpdate, onComplete])

  // Stop rest timer when parent signals to stop
  useEffect(() => {
    if (stopped && restSecondsRemaining !== null) {
      // Clear the interval
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current)
        restIntervalRef.current = null
      }
      // Reset rest timer state
      setRestSecondsRemaining(null)
    }
  }, [stopped, restSecondsRemaining])

  // Rest timer logic - sync with parent overlay
  useEffect(() => {
    // Don't start timer if stopped
    if (stopped) {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current)
        restIntervalRef.current = null
      }
      return
    }

    if (restSecondsRemaining !== null && restSecondsRemaining > 0) {
      const handleRestComplete = () => {
        // Rest complete - show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Rest Complete', {
            body: 'Time to start your next set!',
          })
        }
        // Use ref to avoid calling during render - call after state reset
        setTimeout(() => {
          restTimerCompleteRef.current?.()
        }, 0)
      }

      const handleRestUpdate = (newValue: number) => {
        // Use ref to avoid calling during render
        setTimeout(() => {
          restTimerUpdateRef.current?.(newValue)
        }, 0)
      }

      restIntervalRef.current = window.setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleRestComplete()
            return null
          }
          const newValue = prev - 1
          handleRestUpdate(newValue)
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
  }, [restSecondsRemaining, stopped])

  const startRest = () => {
    const restSeconds = restTimeMinutes * 60
    setRestSecondsRemaining(restSeconds)
    onStart?.(restSeconds)
  }

  return {
    restSecondsRemaining,
    startRest,
  }
}
