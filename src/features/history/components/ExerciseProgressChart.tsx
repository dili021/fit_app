import { TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import type { Doc, Id } from '@db/_generated/dataModel'
import type { ChartConfig } from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface ExerciseProgressChartProps {
  performedExercises: Array<Doc<'exercises'>>
  selectedExerciseId: Id<'exercises'> | undefined
  onExerciseChange: (exerciseId: Id<'exercises'>) => void
  exerciseChartData: Array<{
    date: string
    dateValue: number
    weight: number
    reps: number
    volume: number
    sets: number
  }>
}

export function ExerciseProgressChart({
  performedExercises,
  selectedExerciseId,
  onExerciseChange,
  exerciseChartData,
}: ExerciseProgressChartProps) {
  const exerciseChartConfig = {
    volume: {
      label: 'Total Volume (kg)',
      theme: {
        light: 'oklch(0.45 0.22 280)',
        dark: 'oklch(0.75 0.18 280)',
      },
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Exercise Progress
            </CardTitle>
            <CardDescription>
              Track total volume (sets × reps × weight) over time for a specific
              exercise
            </CardDescription>
          </div>
          {performedExercises.length > 0 && (
            <Select
              value={selectedExerciseId || ''}
              onValueChange={onExerciseChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {performedExercises.map((exercise: Doc<'exercises'>) => (
                  <SelectItem key={exercise._id} value={exercise._id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {exerciseChartData.length > 0 ? (
          <ChartContainer
            config={exerciseChartConfig}
            className="min-h-[300px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={exerciseChartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
                type="category"
              />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="volume"
                name="volume"
                type="linear"
                stroke="var(--color-volume)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            {selectedExerciseId
              ? 'No data available for this exercise yet'
              : 'Select an exercise to view progress'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
