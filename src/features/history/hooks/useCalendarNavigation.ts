import { useState } from 'react'

/**
 * Hook for managing calendar navigation state and logic
 */
export function useCalendarNavigation() {
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())

  const handlePreviousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11)
      setCalendarYear(calendarYear - 1)
    } else {
      setCalendarMonth(calendarMonth - 1)
    }
  }

  const handleNextMonth = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Don't allow navigation to future months
    if (
      calendarYear > currentYear ||
      (calendarYear === currentYear && calendarMonth >= currentMonth)
    ) {
      return
    }

    if (calendarMonth === 11) {
      setCalendarMonth(0)
      setCalendarYear(calendarYear + 1)
    } else {
      setCalendarMonth(calendarMonth + 1)
    }
  }

  const handleToday = () => {
    const today = new Date()
    setCalendarMonth(today.getMonth())
    setCalendarYear(today.getFullYear())
  }

  const isCurrentMonth = () => {
    const today = new Date()
    return (
      calendarYear === today.getFullYear() && calendarMonth === today.getMonth()
    )
  }

  const canNavigateNext = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    return (
      calendarYear < currentYear ||
      (calendarYear === currentYear && calendarMonth < currentMonth)
    )
  }

  return {
    calendarMonth,
    calendarYear,
    handlePreviousMonth,
    handleNextMonth,
    handleToday,
    isCurrentMonth,
    canNavigateNext,
  }
}
