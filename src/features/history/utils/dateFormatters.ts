import type { Doc } from '@db/_generated/dataModel'

/**
 * Format workout date for display
 */
export function formatWorkoutDate(timestamp: number): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
}

/**
 * Format time for display
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Calculate workout duration
 */
export function getWorkoutDuration(workout: Doc<'workouts'>): string | null {
  if (!workout.startedAt || !workout.completedAt) return null
  const durationMs = workout.completedAt - workout.startedAt
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format month/year for display
 */
export function getMonthYearDisplay(year: number, month: number): string {
  const date = new Date(year, month, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
