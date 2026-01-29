import type { Doc } from '@db/_generated/dataModel'

interface ProgressionSuggestion {
  suggestedWeight: number | null
  lastWeight: number | null
  lastReps: number | null
  suggestion: 'increase' | 'decrease' | 'maintain' | null
  reason: string
}

interface ProgressionSuggestionDisplayProps {
  suggestion: ProgressionSuggestion | null | undefined
  lastSet: Doc<'sets'> | null | undefined
  fallbackLabel: string
  fallbackValue: string | number
}

export function ProgressionSuggestionDisplay({
  suggestion,
  lastSet,
  fallbackLabel,
  fallbackValue,
}: ProgressionSuggestionDisplayProps) {
  return (
    <div className="mt-1 h-6">
      {suggestion?.suggestion ? (
        <>
          {suggestion.suggestion === 'increase' && (
            <p className="text-xs text-green-600 font-medium">
              ↑ Suggested: {suggestion.suggestedWeight}kg (last:{' '}
              {suggestion.lastReps} reps @ {suggestion.lastWeight}kg)
            </p>
          )}
          {suggestion.suggestion === 'decrease' && (
            <p className="text-xs text-orange-600 font-medium">
              ↓ Suggested: {suggestion.suggestedWeight}kg (last:{' '}
              {suggestion.lastReps} reps @ {suggestion.lastWeight}kg)
            </p>
          )}
          {suggestion.suggestion === 'maintain' && (
            <p className="text-xs text-blue-600 font-medium">
              → Maintain: {suggestion.suggestedWeight}kg (in 8-12 rep zone)
            </p>
          )}
        </>
      ) : null}
      {!suggestion?.suggestion && lastSet && (
        <p className="text-xs text-muted-foreground">
          {fallbackLabel}: {fallbackValue}
        </p>
      )}
    </div>
  )
}
