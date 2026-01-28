import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface SetsPerPatternStepProps {
  sessionsPerWeek: number
  setsPerPrimaryPatternPerWeek: number | null
  onSetsChange: (sets: number) => void
  isValidDistribution: boolean
}

export function SetsPerPatternStep({
  sessionsPerWeek,
  setsPerPrimaryPatternPerWeek,
  onSetsChange,
  isValidDistribution,
}: SetsPerPatternStepProps) {
  // Generate options in 10-20 range that are divisible by sessionsPerWeek
  const options = []
  for (let setsPerPattern = 10; setsPerPattern <= 20; setsPerPattern++) {
    if (setsPerPattern % sessionsPerWeek === 0) {
      options.push(setsPerPattern)
    }
  }

  return (
    <div>
      <Label className="text-base font-semibold mb-3 block">
        Sets Per Primary Pattern Per Week
      </Label>
      <RadioGroup
        value={setsPerPrimaryPatternPerWeek?.toString() || ''}
        onValueChange={(value) => onSetsChange(parseInt(value))}
      >
        <div className="space-y-3">
          {options.map((setsPerPattern) => {
            const setsPerSession = Math.floor(setsPerPattern / sessionsPerWeek)

            return (
              <div key={setsPerPattern} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={setsPerPattern.toString()}
                  id={`sets-${setsPerPattern}`}
                />
                <Label
                  htmlFor={`sets-${setsPerPattern}`}
                  className="cursor-pointer flex-1"
                >
                  <div className="font-medium">
                    {setsPerPattern} sets
                    <span className="text-muted-foreground ml-2">
                      ({setsPerSession} sets per session)
                    </span>
                  </div>
                </Label>
              </div>
            )
          })}
        </div>
      </RadioGroup>
      {!isValidDistribution && setsPerPrimaryPatternPerWeek && (
        <p className="text-sm text-destructive mt-2">
          Sets per pattern must be divisible by sessions per week
        </p>
      )}
    </div>
  )
}
