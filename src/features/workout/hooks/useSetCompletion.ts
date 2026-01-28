import type { Doc, Id } from '@db/_generated/dataModel'

interface UseSetCompletionProps {
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
  workoutSets: Array<Doc<'sets'>> | undefined
  currentPattern: {
    patternId: Id<'patterns'>
    sets: number
    isPrimary: boolean
  } | null
  currentPatternIndex: number
  currentSetNumber: number
  isLastPattern: boolean
  setPendingPatternNavigation: (value: boolean) => void
}

/**
 * Hook for handling set completion logic and auto-navigation
 */
export function useSetCompletion({
  workoutTemplate,
  workoutSets,
  currentPattern,
  currentPatternIndex,
  currentSetNumber,
  isLastPattern,
  setPendingPatternNavigation,
}: UseSetCompletionProps) {
  const handleSetComplete = () => {
    if (!workoutTemplate || !workoutSets || !currentPattern) return

    const justCompletedSetNumber = currentSetNumber
    if (justCompletedSetNumber === currentPattern.sets) {
      const nextPattern = !isLastPattern
        ? workoutTemplate.template[currentPatternIndex + 1]
        : null

      if (!nextPattern || isLastPattern) return

      // Check if all primary patterns are completed, accounting for the set we just completed
      const allPrimsDone = (() => {
        const primaryPatterns = workoutTemplate.template.filter(
          (p) => p.isPrimary,
        )
        for (const pattern of primaryPatterns) {
          const patternSets = workoutSets.filter(
            (s) => s.patternId === pattern.patternId,
          )
          const count =
            pattern.patternId === currentPattern.patternId
              ? patternSets.length + 1
              : patternSets.length
          if (count < pattern.sets) {
            return false
          }
        }
        return true
      })()

      // Auto-navigate if: prim->prim, sec->sec, or prim->sec (when all prims done)
      const shouldNav =
        (currentPattern.isPrimary && nextPattern.isPrimary) ||
        (!currentPattern.isPrimary && !nextPattern.isPrimary) ||
        (currentPattern.isPrimary && !nextPattern.isPrimary && allPrimsDone)

      if (shouldNav) {
        setPendingPatternNavigation(true)
      }
    }
  }

  return { handleSetComplete }
}
