import { useEffect, useState } from 'react'
import type { Doc, Id } from '@db/_generated/dataModel'

interface UsePatternProgressProps {
  workoutSets: Array<Doc<'sets'>> | undefined
  workoutTemplate:
    | { template: Array<{ patternId: Id<'patterns'>; sets: number }> }
    | null
    | undefined
  currentPatternIndex: number
}

/**
 * Hook for tracking pattern progress (completed sets, current set number)
 */
export function usePatternProgress({
  workoutSets,
  workoutTemplate,
  currentPatternIndex,
}: UsePatternProgressProps) {
  const [completedSets, setCompletedSets] = useState(0)
  const [currentSetNumber, setCurrentSetNumber] = useState(1)

  useEffect(() => {
    if (workoutSets && workoutTemplate?.template[currentPatternIndex]) {
      const currentPattern = workoutTemplate.template[currentPatternIndex]
      // Count all sets for this pattern, regardless of exercise
      const patternSets = workoutSets.filter(
        (s) => s.patternId === currentPattern.patternId,
      )
      setCompletedSets(patternSets.length)
      setCurrentSetNumber(patternSets.length + 1)
    } else {
      setCompletedSets(0)
      setCurrentSetNumber(1)
    }
  }, [workoutSets, workoutTemplate, currentPatternIndex])

  return { completedSets, currentSetNumber }
}
