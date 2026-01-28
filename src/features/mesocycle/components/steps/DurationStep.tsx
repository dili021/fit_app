import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface DurationStepProps {
  durationWeeks: number | null
  onDurationChange: (weeks: number) => void
}

export function DurationStep({
  durationWeeks,
  onDurationChange,
}: DurationStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Duration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          How many weeks should this mesocycle last?
        </p>
      </div>
      <RadioGroup
        value={durationWeeks?.toString() || ''}
        onValueChange={(value) => onDurationChange(parseInt(value, 10))}
      >
        {[4, 6, 8, 12].map((weeks) => (
          <div key={weeks} className="flex items-center space-x-2">
            <RadioGroupItem value={weeks.toString()} id={`weeks-${weeks}`} />
            <Label
              htmlFor={`weeks-${weeks}`}
              className="flex-1 cursor-pointer p-3 rounded-md border hover:bg-muted/50"
            >
              <Card>
                <CardContent className="p-3">
                  <div className="font-medium">{weeks} weeks</div>
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
