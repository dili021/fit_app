import { ExerciseCarousel } from './ExerciseCarousel'
import type { Id } from '@db/_generated/dataModel'

interface ExerciseSelectionSectionProps {
  currentPattern: {
    patternId: Id<'patterns'>
    patternName: string
  }
  selectedExerciseId: Id<'exercises'> | null
  onSelectExercise: (exerciseId: Id<'exercises'>) => void
}

export function ExerciseSelectionSection({
  currentPattern,
  selectedExerciseId,
  onSelectExercise,
}: ExerciseSelectionSectionProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      {selectedExerciseId ? (
        <ExerciseCarousel
          patternId={currentPattern.patternId}
          selectedExerciseId={selectedExerciseId}
          onSelectExercise={onSelectExercise}
        />
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Select an exercise to begin
          </p>
          <ExerciseCarousel
            patternId={currentPattern.patternId}
            selectedExerciseId={null}
            onSelectExercise={onSelectExercise}
          />
        </div>
      )}
    </div>
  )
}
