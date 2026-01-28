import { Minus, TrendingDown, TrendingUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ProgressionSuggestion {
  suggestedWeight: number | null
  lastWeight: number | null
  lastReps: number | null
  suggestion: 'increase' | 'decrease' | 'maintain' | null
  reason: string
}

interface RestTimerOverlayProps {
  isVisible: boolean
  secondsRemaining: number
  onDismiss: () => void
  progressionSuggestion?: ProgressionSuggestion | null
}

export function RestTimerOverlay({
  isVisible,
  secondsRemaining,
  onDismiss,
  progressionSuggestion,
}: RestTimerOverlayProps) {
  if (!isVisible) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Rest Timer</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center space-y-6">
            <div className="text-6xl font-mono font-bold text-blue-600">
              {formatTime(secondsRemaining)}
            </div>
            <p className="text-sm text-muted-foreground">
              Take a break before your next set
            </p>

            {/* Progression Suggestion */}
            {progressionSuggestion?.suggestion && (
              <div className="mt-6 pt-6 border-t space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Next Set Suggestion:
                </p>
                <div
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                    progressionSuggestion.suggestion === 'increase'
                      ? 'bg-green-50 dark:bg-green-950/20'
                      : progressionSuggestion.suggestion === 'decrease'
                        ? 'bg-orange-50 dark:bg-orange-950/20'
                        : 'bg-blue-50 dark:bg-blue-950/20'
                  }`}
                >
                  {progressionSuggestion.suggestion === 'increase' && (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  )}
                  {progressionSuggestion.suggestion === 'decrease' && (
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                  )}
                  {progressionSuggestion.suggestion === 'maintain' && (
                    <Minus className="h-5 w-5 text-blue-600" />
                  )}
                  <div className="text-left">
                    <p
                      className={`font-semibold ${
                        progressionSuggestion.suggestion === 'increase'
                          ? 'text-green-700 dark:text-green-400'
                          : progressionSuggestion.suggestion === 'decrease'
                            ? 'text-orange-700 dark:text-orange-400'
                            : 'text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {progressionSuggestion.suggestion === 'increase' &&
                        `Increase to ${progressionSuggestion.suggestedWeight}kg`}
                      {progressionSuggestion.suggestion === 'decrease' &&
                        `Decrease to ${progressionSuggestion.suggestedWeight}kg`}
                      {progressionSuggestion.suggestion === 'maintain' &&
                        `Maintain ${progressionSuggestion.suggestedWeight}kg`}
                    </p>
                    {progressionSuggestion.lastWeight &&
                      progressionSuggestion.lastReps && (
                        <p className="text-xs text-muted-foreground">
                          Last: {progressionSuggestion.lastReps} reps @{' '}
                          {progressionSuggestion.lastWeight}kg
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
