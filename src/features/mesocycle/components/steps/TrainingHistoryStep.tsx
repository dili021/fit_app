import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface TrainingHistoryStepProps {
  wasPreviouslyTraining: boolean | null
  onTrainingHistoryChange: (value: boolean) => void
}

export function TrainingHistoryStep({
  wasPreviouslyTraining,
  onTrainingHistoryChange,
}: TrainingHistoryStepProps) {
  return (
    <div>
      <Label className="text-base font-semibold mb-2 block">
        Were you previously training?
      </Label>
      <RadioGroup
        value={
          wasPreviouslyTraining === null ? '' : wasPreviouslyTraining.toString()
        }
        onValueChange={(value) => onTrainingHistoryChange(value === 'true')}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="true" id="training-yes" />
            <Label htmlFor="training-yes" className="cursor-pointer">
              Yes - I've been training consistently
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="false" id="training-no" />
            <Label htmlFor="training-no" className="cursor-pointer">
              No - Starting fresh or returning after a break
            </Label>
          </div>
        </div>
      </RadioGroup>
      {wasPreviouslyTraining === false && (
        <p className="mt-2 text-xs text-muted-foreground">
          Volume builds up: 50% in weeks 1-2, 75% in weeks 3-4, full from week
          5.
        </p>
      )}
    </div>
  )
}
