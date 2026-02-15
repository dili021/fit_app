import type { Doc, Id } from '@db/_generated/dataModel'
import { Button } from '@/components/ui/button'

interface PatternSelectionStepProps {
  patterns: Array<Doc<'patterns'>> | undefined
  primaryPatterns: Array<Id<'patterns'>>
  onTogglePattern: (patternId: Id<'patterns'>) => void
}

export function PatternSelectionStep({
  patterns,
  primaryPatterns,
  onTogglePattern,
}: PatternSelectionStepProps) {
  if (!patterns) {
    return <div>Loading patterns...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Primary Patterns</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose 1-2 movement patterns to focus on (you can select up to 2)
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {patterns.map((pattern) => {
          const isSelected = primaryPatterns.includes(pattern._id)
          const isDisabled = !isSelected && primaryPatterns.length >= 2

          return (
            <Button
              key={pattern._id}
              onClick={() => onTogglePattern(pattern._id)}
              disabled={isDisabled}
              className={`text-left transition-all ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{pattern.displayName}</div>
                {isSelected && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </Button>
          )
        })}
      </div>
      {primaryPatterns.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {primaryPatterns.length} of 2 patterns selected
        </p>
      )}
    </div>
  )
}
