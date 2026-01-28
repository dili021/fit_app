import { useState } from 'react'
import type { Doc, Id } from '@db/_generated/dataModel'

interface UsePatternNavigationProps {
  workoutSets: Array<Doc<'sets'>> | undefined
  workoutTemplate:
    | {
        template: Array<{
          patternId: Id<'patterns'>
          sets: number
          isPrimary: boolean
        }>
      }
    | null
    | undefined
  currentPatternIndex: number
}

/**
 * Hook for managing pattern navigation logic and state
 */
export function usePatternNavigation({
  workoutSets,
  workoutTemplate,
  currentPatternIndex,
}: UsePatternNavigationProps) {
  const [pendingPatternNavigation, setPendingPatternNavigation] =
    useState(false)

  const currentPattern = workoutTemplate?.template[currentPatternIndex]
  const isLastPattern =
    currentPatternIndex === (workoutTemplate?.template.length ?? 0) - 1
  const nextPattern = !isLastPattern
    ? workoutTemplate?.template[currentPatternIndex + 1]
    : null

  // Check if all primary pattern sets are completed
  const allPrimarySetsCompleted =
    workoutSets && workoutTemplate
      ? (() => {
          const primaryPatterns = workoutTemplate.template.filter(
            (p) => p.isPrimary,
          )
          for (const pattern of primaryPatterns) {
            const patternSets = workoutSets.filter(
              (s) => s.patternId === pattern.patternId,
            )
            if (patternSets.length < pattern.sets) {
              return false
            }
          }
          return true
        })()
      : false

  // Check if Next Pattern button should be disabled
  const isNextPatternDisabled = nextPattern
    ? !nextPattern.isPrimary && !allPrimarySetsCompleted
    : false

  return {
    currentPattern,
    isLastPattern,
    nextPattern,
    allPrimarySetsCompleted,
    isNextPatternDisabled,
    pendingPatternNavigation,
    setPendingPatternNavigation,
  }
}
