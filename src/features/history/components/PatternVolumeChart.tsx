import { BarChart3 } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import type { Doc, Id } from '@db/_generated/dataModel'
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

interface PatternVolumeChartProps {
  patterns: Array<Doc<'patterns'>> | undefined
  selectedPatternId: Id<'patterns'> | undefined
  onPatternChange: (patternId: Id<'patterns'>) => void
  patternChartData: Array<{ date: string; volume: number; sets: number }>
}

export function PatternVolumeChart({
  patterns,
  selectedPatternId,
  onPatternChange,
  patternChartData,
}: PatternVolumeChartProps) {
  const patternChartConfig = {
    volume: {
      label: 'Total Volume (kg)',
      theme: {
        light: 'oklch(0.45 0.22 280)',
        dark: 'oklch(0.75 0.18 280)',
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Pattern Volume Tracking
            </CardTitle>
            <CardDescription>
              Track total volume per workout for a movement pattern
            </CardDescription>
          </div>
          {patterns && patterns.length > 0 && (
            <Select
              value={selectedPatternId || ''}
              onValueChange={onPatternChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                {patterns.map((pattern: Doc<'patterns'>) => (
                  <SelectItem key={pattern._id} value={pattern._id}>
                    {pattern.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {patternChartData.length > 0 ? (
          <ChartContainer
            config={patternChartConfig}
            className="min-h-[300px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={patternChartData}
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
            {selectedPatternId
              ? 'No data available for this pattern yet'
              : 'Select a pattern to view volume tracking'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
