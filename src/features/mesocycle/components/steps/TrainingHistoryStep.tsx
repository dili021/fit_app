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
      <Label className="text-base font-semibold mb-3 block">
        Were you previously training?
      </Label>
      <RadioGroup
        value={
          wasPreviouslyTraining === null ? '' : wasPreviouslyTraining.toString()
        }
        onValueChange={(value) => onTrainingHistoryChange(value === 'true')}
      >
        <div className="space-y-3">
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
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm">
            <strong>Build-up logic:</strong> Your first 2 weeks will use 50%
            volume, weeks 3-4 will use 75% volume, and weeks 5+ will use full
            volume.
          </p>
        </div>
      )}
    </div>
  )
}
