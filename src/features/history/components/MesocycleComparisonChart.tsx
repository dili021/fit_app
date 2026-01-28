import { Activity } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface MesocycleComparisonChartProps {
  mesocycleComparisonData: Array<{
    name: string
    totalVolume: number
    totalSets: number
    avgVolumePerWorkout: number
    duration: number
  }>
}

export function MesocycleComparisonChart({
  mesocycleComparisonData,
}: MesocycleComparisonChartProps) {
  if (mesocycleComparisonData.length < 2) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Mesocycle Comparison
        </CardTitle>
        <CardDescription>
          Compare total volume across completed mesocycles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            totalVolume: {
              label: 'Total Volume (kg)',
              theme: {
                light: 'oklch(0.45 0.22 280)',
                dark: 'oklch(0.75 0.18 280)',
              },
            },
          }}
          className="min-h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={mesocycleComparisonData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
              type="category"
            />
            <YAxis />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="totalVolume"
              name="totalVolume"
              type="linear"
              stroke="var(--color-totalVolume)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
