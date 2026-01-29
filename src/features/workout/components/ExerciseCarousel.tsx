import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@db/_generated/api'
import type { Id } from '@db/_generated/dataModel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ExerciseCarouselProps {
  patternId: Id<'patterns'>
  selectedExerciseId: Id<'exercises'> | null
  onSelectExercise: (exerciseId: Id<'exercises'>) => void
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

  const currentExercise =
    exercises[selectedIndex >= 0 ? selectedIndex : currentIndex]

  const handlePrevious = () => {
    const newIndex =
      selectedIndex > 0 ? selectedIndex - 1 : exercises.length - 1
    setCurrentIndex(newIndex)
    onSelectExercise(exercises[newIndex]._id)
  }

  const handleNext = () => {
    const newIndex =
      selectedIndex < exercises.length - 1 ? selectedIndex + 1 : 0
    setCurrentIndex(newIndex)
    onSelectExercise(exercises[newIndex]._id)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="relative w-full">
        <CardContent className="p-6">
          {/* Navigation Arrows - Inside Card */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-2">
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Previous exercise"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Next exercise"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Exercise Name - Centered */}
          <div className="text-center px-12">
            <h3 className="text-2xl font-semibold">{currentExercise.name}</h3>
          </div>
        </CardContent>
      </Card>

      {/* Exercise dots indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {exercises.map((exercise, index) => (
          <div
            key={exercise._id}
            onClick={() => {
              setCurrentIndex(index)
              onSelectExercise(exercise._id)
            }}
            className={`h-1.5 rounded-full transition-all min-w-[6px] min-h-[6px] cursor-pointer ${
              index === selectedIndex
                ? 'w-6 bg-primary'
                : 'w-1.5 bg-muted active:bg-muted-foreground/50'
            }`}
            aria-label={`Select ${exercise.name}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setCurrentIndex(index)
                onSelectExercise(exercise._id)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
