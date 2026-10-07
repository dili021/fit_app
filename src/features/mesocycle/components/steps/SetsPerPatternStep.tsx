import { Clock } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface SetsPerPatternStepProps {
  sessionsPerWeek: number
  setsPerPrimaryPatternPerWeek: number | null
  onSetsChange: (sets: number) => void
  estimatedSessionMinutes: number | null
  isValidDistribution: boolean
}

export function SetsPerPatternStep({
  sessionsPerWeek,
  setsPerPrimaryPatternPerWeek,
  onSetsChange,
  estimatedSessionMinutes,
  isValidDistribution,
}: SetsPerPatternStepProps) {
  // Generate options in 10-20 range that are divisible by sessionsPerWeek
  const options = []
  for (let setsPerPattern = 10; setsPerPattern <= 20; setsPerPattern++) {
    if (setsPerPattern % sessionsPerWeek === 0) {
      options.push(setsPerPattern)
    }
  }

  const setsPerSession = setsPerPrimaryPatternPerWeek
    ? Math.floor(setsPerPrimaryPatternPerWeek / sessionsPerWeek)
    : null

  return (
    <div>
      <Label className="text-base font-semibold mb-2 block">
        Sets Per Primary Pattern Per Week
      </Label>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex w-full rounded-lg border border-input bg-background p-1 sm:inline-flex sm:w-auto">
          {options.map((setsPerPattern, index) => (
            <button
              key={setsPerPattern}
              type="button"
              onClick={() => onSetsChange(setsPerPattern)}
              aria-pressed={setsPerPrimaryPatternPerWeek === setsPerPattern}
              className={cn(
                // Six options have to share one row on a phone
                '!ml-0 !min-w-0 flex-1 px-3 py-2 text-sm font-medium transition-all',
                index === 0 && 'rounded-l-md',
                index === options.length - 1 && 'rounded-r-md',
                setsPerPrimaryPatternPerWeek === setsPerPattern
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {setsPerPattern}
            </button>
          ))}
        </div>
        {setsPerSession !== null && estimatedSessionMinutes !== null && (
          <div className="text-sm">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />~
              {estimatedSessionMinutes} min per session
            </div>
            <div className="text-xs text-muted-foreground">
              {setsPerSession} sets per pattern each session
            </div>
          </div>
        )}
      </div>
      {!isValidDistribution && setsPerPrimaryPatternPerWeek && (
        <p className="text-sm text-destructive mt-2">
          Sets per pattern must be divisible by sessions per week
        </p>
      )}
    </div>
  )
}
