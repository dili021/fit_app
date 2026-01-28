import { AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface WorkoutHeaderProps {
  currentWeek: number
  durationWeeks: number
  isDeloadWeek: boolean
  isCompleted: boolean
}

export function WorkoutHeader({
  currentWeek,
  durationWeeks,
  isDeloadWeek,
  isCompleted,
}: WorkoutHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Start Workout</h1>
          <p className="text-muted-foreground">
            Week {currentWeek} of {durationWeeks}
          </p>
        </div>
        {isDeloadWeek && !isCompleted && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Deload Week
          </Badge>
        )}
      </div>
    </div>
  )
}
