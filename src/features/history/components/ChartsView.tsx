import { useChartsData } from '../hooks/useChartsData'
import { PatternVolumeChart } from './PatternVolumeChart'
import { ExerciseProgressChart } from './ExerciseProgressChart'
import { MesocycleComparisonChart } from './MesocycleComparisonChart'
import type { Doc } from '@db/_generated/dataModel'

interface ChartsViewProps {
  userId: string
  workouts: Array<Doc<'workouts'>> | undefined
  mesocycles: Array<Doc<'mesocycles'>> | undefined
  patterns: Array<Doc<'patterns'>> | undefined
  exercises: Array<Doc<'exercises'>> | undefined
}

export function ChartsView({
  userId,
  workouts,
  mesocycles,
  patterns,
  exercises,
}: ChartsViewProps) {
  const {
    performedExercises,
    selectedExerciseId,
    setSelectedExerciseId,
    selectedPatternId,
    setSelectedPatternId,
    exerciseChartData,
    patternChartData,
    mesocycleComparisonData,
  } = useChartsData({
    userId,
    workouts,
    mesocycles,
    patterns,
    exercises,
  })

  return (
    <div className="space-y-6">
      <PatternVolumeChart
        patterns={patterns}
        selectedPatternId={selectedPatternId}
        onPatternChange={setSelectedPatternId}
        patternChartData={patternChartData}
      />

      <ExerciseProgressChart
        performedExercises={performedExercises}
        selectedExerciseId={selectedExerciseId}
        onExerciseChange={setSelectedExerciseId}
        exerciseChartData={exerciseChartData}
      />

      <MesocycleComparisonChart
        mesocycleComparisonData={mesocycleComparisonData}
      />
    </div>
  )
}
