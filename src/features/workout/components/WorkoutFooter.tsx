import { Button } from '@/components/ui/button'

interface WorkoutFooterProps {
  currentPatternIndex: number
  isLastPattern: boolean
  isNextPatternDisabled: boolean
  allSetsCompleted: boolean
  onPreviousPattern: () => void
  onNextPattern: () => void
  onConcludeSession: () => void
}

export function WorkoutFooter({
  currentPatternIndex,
  isLastPattern,
  isNextPatternDisabled,
  allSetsCompleted,
  onPreviousPattern,
  onNextPattern,
  onConcludeSession,
}: WorkoutFooterProps) {
  return (
    <div className="border-t p-4 space-y-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onPreviousPattern}
          disabled={currentPatternIndex === 0}
          className="flex-1"
        >
          Previous
        </Button>
        {!isLastPattern ? (
          <Button
            onClick={onNextPattern}
            className="flex-1"
            disabled={isNextPatternDisabled}
          >
            Next Pattern
          </Button>
        ) : (
          <div className="flex-1" />
        )}
      </div>
      <Button
        onClick={onConcludeSession}
        variant={allSetsCompleted ? 'default' : 'destructive'}
        className={`w-full ${allSetsCompleted ? '!bg-green-600 hover:!bg-green-700 text-white' : ''}`}
      >
        Conclude Session
      </Button>
    </div>
  )
}
