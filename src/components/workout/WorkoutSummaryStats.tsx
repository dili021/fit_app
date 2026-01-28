import { Card, CardContent } from '@/components/ui/card'

interface WorkoutSummaryStatsProps {
  totalSets: number
  totalVolume: number
  totalSessionTime: number
  formatTime: (seconds: number) => string
}

export function WorkoutSummaryStats({
  totalSets,
  totalVolume,
  totalSessionTime,
  formatTime,
}: WorkoutSummaryStatsProps) {
  return (
    <div className="space-y-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total Sets</div>
            <div className="text-2xl font-bold">{totalSets}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total Volume</div>
            <div className="text-2xl font-bold">
              {totalVolume.toFixed(0)} kg
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total Time</div>
            <div className="text-2xl font-bold">
              {formatTime(totalSessionTime)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
