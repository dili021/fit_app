import type { Id } from '../../../convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Set {
  _id: Id<'sets'>
  weight: number
  reps: number
  duration: number
  orderInWorkout: number
}

interface ExerciseGroupCardProps {
  exerciseName: string
  sets: Array<Set>
  formatTime: (seconds: number) => string
}

export function ExerciseGroupCard({
  exerciseName,
  sets,
  formatTime,
}: ExerciseGroupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <div className="font-semibold">{exerciseName}</div>
            <div className="text-sm text-muted-foreground">
              {sets.length} {sets.length === 1 ? 'set' : 'sets'}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sets
            .sort((a, b) => a.orderInWorkout - b.orderInWorkout)
            .map((set, setIdx) => (
              <div
                key={set._id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-8">#{setIdx + 1}</span>
                  <div className="text-sm">
                    <span className="font-medium">{set.weight}kg</span>
                    <span className="text-muted-foreground mx-2">×</span>
                    <span className="font-medium">{set.reps}</span>
                    <span className="text-muted-foreground"> reps</span>
                  </div>
                </div>
                {set.duration > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {formatTime(set.duration)}
                  </div>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
