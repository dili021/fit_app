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
  const stats = [
    { label: 'Sets', value: totalSets },
    { label: 'Volume', value: `${totalVolume.toFixed(0)} kg` },
    { label: 'Time', value: formatTime(totalSessionTime) },
  ]

  return (
    <div className="mb-3 grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border bg-card px-3 py-2">
          <div className="text-xs text-muted-foreground">{stat.label}</div>
          <div className="text-lg font-semibold">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
