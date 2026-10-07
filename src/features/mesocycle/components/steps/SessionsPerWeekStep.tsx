import { Label } from '@/components/ui/label'

interface SessionsPerWeekStepProps {
  sessionsPerWeek: number | null
  onSessionsChange: (sessions: number) => void
  onResetSets: () => void
}

export function SessionsPerWeekStep({
  sessionsPerWeek,
  onSessionsChange,
  onResetSets,
}: SessionsPerWeekStepProps) {
  const handleSessionsChange = (sessions: number) => {
    onSessionsChange(sessions)
    onResetSets()
  }

  return (
    <div>
      <Label className="text-base font-semibold mb-2 block">
        Training Sessions Per Week
      </Label>
      <div className="inline-flex rounded-lg border border-input bg-background p-1">
        {[2, 3, 4, 5].map((sessions, index) => (
          <button
            key={sessions}
            type="button"
            onClick={() => handleSessionsChange(sessions)}
            className={`
              px-4 py-2 text-sm font-medium transition-all
              ${index === 0 ? 'rounded-l-md' : ''}
              ${index === [2, 3, 4, 5].length - 1 ? 'rounded-r-md' : ''}
              ${
                sessionsPerWeek === sessions
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }
            `}
          >
            {sessions}
          </button>
        ))}
      </div>
    </div>
  )
}
