import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@db/_generated/api'
import { transformMesocycleToComparisonData } from './mesocycleComparisonHelpers'
import type { Doc, Id } from '@db/_generated/dataModel'

interface UseChartsDataProps {
  userId: string
  workouts: Array<Doc<'workouts'>> | undefined
  mesocycles: Array<Doc<'mesocycles'>> | undefined
  patterns: Array<Doc<'patterns'>> | undefined
  exercises: Array<Doc<'exercises'>> | undefined
}

/**
 * Hook for managing charts data and state
 */
export function useChartsData({
  userId,
  workouts,
  mesocycles,
  patterns,
  exercises,
}: UseChartsDataProps) {
  // Get all sets for user to calculate mesocycle comparison and filter exercises
  const allSets = useQuery(api.sets.getAllSetsForUser, { userId })

  // Filter exercises to only show ones the user has performed
  const performedExercises = useMemo(() => {
    if (!exercises || !allSets) return []
    const exerciseIdsWithSets = new Set(
      allSets.map((s: NonNullable<typeof allSets>[0]) => s.exerciseId),
    )
    return exercises.filter((e: Doc<'exercises'>) =>
      exerciseIdsWithSets.has(e._id),
    )
  }, [exercises, allSets])

  // Initialize state with first available value to keep Select controlled
  const initialExerciseId =
    performedExercises.length > 0 ? performedExercises[0]._id : undefined
  const initialPatternId =
    patterns && patterns.length > 0 ? patterns[0]._id : undefined

  const [selectedExerciseId, setSelectedExerciseId] = useState<
    Id<'exercises'> | undefined
  >(initialExerciseId)
  const [selectedPatternId, setSelectedPatternId] = useState<
    Id<'patterns'> | undefined
  >(initialPatternId)

  // Get exercise progress data
  const exerciseProgress = useQuery(
    api.sets.getExerciseProgress,
    selectedExerciseId ? { exerciseId: selectedExerciseId, userId } : 'skip',
  )

  // Get pattern volume data
  const patternVolume = useQuery(
    api.sets.getPatternVolume,
    selectedPatternId ? { patternId: selectedPatternId, userId } : 'skip',
  )

  // Prepare exercise progress chart data
  const exerciseChartData = useMemo(() => {
    if (!exerciseProgress || exerciseProgress.length === 0) return []

    // Sort by date to ensure chronological order
    const sorted = [...exerciseProgress].sort((a, b) => a.date - b.date)

    return sorted.map((item) => {
      const dateObj = new Date(item.date)
      return {
        date: dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        dateValue: item.date, // Numeric timestamp for X-axis
        weight: item.avgWeight,
        reps: item.avgReps,
        volume: item.totalVolume,
        sets: item.setCount,
      }
    })
  }, [exerciseProgress])

  // Prepare pattern volume chart data
  const patternChartData = useMemo(() => {
    if (!patternVolume || patternVolume.length === 0) return []

    return patternVolume.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      volume: item.totalVolume,
      sets: item.sets,
    }))
  }, [patternVolume])

  // Prepare mesocycle comparison data
  const mesocycleComparisonData = useMemo(() => {
    if (!mesocycles || !allSets || !patterns || mesocycles.length < 2) return []

    const activeOrCompleted = mesocycles.filter(
      (m) => m.status === 'completed' || m.status === 'active',
    )

    return activeOrCompleted.map((mesocycle) =>
      transformMesocycleToComparisonData(
        mesocycle,
        allSets,
        workouts,
        patterns,
      ),
    )
  }, [mesocycles, allSets, workouts, patterns])

  // Update selection when data loads (only if not already set)
  useEffect(() => {
    if (!selectedExerciseId && performedExercises.length > 0) {
      setSelectedExerciseId(performedExercises[0]._id)
    }
  }, [performedExercises, selectedExerciseId])

  useEffect(() => {
    if (!selectedPatternId && patterns && patterns.length > 0) {
      setSelectedPatternId(patterns[0]._id)
    }
  }, [patterns, selectedPatternId])

  return {
    performedExercises,
    selectedExerciseId,
    setSelectedExerciseId,
    selectedPatternId,
    setSelectedPatternId,
    exerciseChartData,
    patternChartData,
    mesocycleComparisonData,
  }
}
