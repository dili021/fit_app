import { useState, useEffect } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ExerciseCarouselProps {
  patternId: Id<"patterns">
  selectedExerciseId: Id<"exercises"> | null
  onSelectExercise: (exerciseId: Id<"exercises">) => void
}

export function ExerciseCarousel({
  patternId,
  selectedExerciseId,
  onSelectExercise,
}: ExerciseCarouselProps) {
  const exercises = useQuery(api.exercises.getByPattern, { patternId })
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-select first exercise when pattern changes and no exercise is selected
  useEffect(() => {
    if (exercises && exercises.length > 0 && !selectedExerciseId) {
      onSelectExercise(exercises[0]._id)
      setCurrentIndex(0)
    }
  }, [exercises, patternId, selectedExerciseId, onSelectExercise])

  if (!exercises || exercises.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No exercises available for this pattern
      </div>
    )
  }

  // Find current exercise index
  const selectedIndex = selectedExerciseId
    ? exercises.findIndex((e) => e._id === selectedExerciseId)
    : currentIndex

  const currentExercise = exercises[selectedIndex >= 0 ? selectedIndex : currentIndex]

  const handlePrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : exercises.length - 1
    setCurrentIndex(newIndex)
    onSelectExercise(exercises[newIndex]._id)
  }

  const handleNext = () => {
    const newIndex = selectedIndex < exercises.length - 1 ? selectedIndex + 1 : 0
    setCurrentIndex(newIndex)
    onSelectExercise(exercises[newIndex]._id)
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <Card className="cursor-pointer" onClick={() => onSelectExercise(currentExercise._id)}>
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold">{currentExercise.name}</h3>
            </CardContent>
          </Card>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Exercise dots indicator */}
      <div className="flex justify-center gap-2">
        {exercises.map((exercise, index) => (
          <button
            key={exercise._id}
            onClick={() => {
              setCurrentIndex(index)
              onSelectExercise(exercise._id)
            }}
            className={`h-2 rounded-full transition-all ${
              index === selectedIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted hover:bg-muted-foreground/50'
            }`}
            aria-label={`Select ${exercise.name}`}
          />
        ))}
      </div>
    </div>
  )
}
