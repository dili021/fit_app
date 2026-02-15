import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DurationStepProps {
  durationWeeks: number | null
  onDurationChange: (weeks: number) => void
}

export function DurationStep({
  durationWeeks,
  onDurationChange,
}: DurationStepProps) {
  const durations = [4, 6, 8, 12]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Duration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          How many weeks should this mesocycle last?
        </p>
      </div>
      <div className="grid grid-cols-4 p-1 gap-3">
        {durations.map((weeks) => {
          const isSelected = durationWeeks === weeks
          return (
            <Button
              key={weeks}
              type="button"
              variant="outline"
              className={cn(
                'text-base font-medium hover:text-white active:text-primary',
                isSelected && 'ring-2 ring-primary ',
              )}
              onClick={() => onDurationChange(weeks)}
            >
              {weeks} weeks
            </Button>
          )
        })}
      </div>
    </div>
  )
}
