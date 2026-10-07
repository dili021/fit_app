import type { Doc, Id } from '@db/_generated/dataModel'
import { cn } from '@/lib/utils'

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
        <p className="text-sm text-muted-foreground">
          Choose 1-2 movement patterns to focus on
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 p-1 sm:grid-cols-2">
        {patterns.map((pattern) => {
          const isSelected = primaryPatterns.includes(pattern._id)
          const isDisabled = !isSelected && primaryPatterns.length >= 2

          return (
            <button
              key={pattern._id}
              type="button"
              onClick={() => onTogglePattern(pattern._id)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={cn(
                // !ml-0 cancels the global touch rule that indents sibling buttons
                '!ml-0 min-h-[48px] rounded-md border px-3 py-2 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'bg-background hover:bg-muted/50 dark:bg-input/30',
              )}
            >
              <div className="font-medium">{pattern.displayName}</div>
              {pattern.muscleGroups && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {pattern.muscleGroups.join(' · ')}
                </div>
              )}
            </button>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        {primaryPatterns.length} of 2 patterns selected
      </p>
    </div>
  )
}
