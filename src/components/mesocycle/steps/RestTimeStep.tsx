import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RestTimeStepProps {
  restTimeMinutes: number
  onRestTimeChange: (minutes: number) => void
}

export function RestTimeStep({
  restTimeMinutes,
  onRestTimeChange,
}: RestTimeStepProps) {
  return (
    <div>
      <Label htmlFor="restTime" className="text-base font-semibold mb-3 block">
        Rest Time Between Sets (minutes)
      </Label>
      <Input
        id="restTime"
        type="number"
        min="1"
        max="10"
        step="0.5"
        value={restTimeMinutes}
        onChange={(e) => onRestTimeChange(parseFloat(e.target.value) || 3)}
        className="max-w-[200px]"
      />
      <p className="text-sm text-muted-foreground mt-1">
        Recommended: 2-5 minutes for strength training
      </p>
    </div>
  )
}
