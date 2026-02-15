import type { Doc } from '@db/_generated/dataModel'
import { formatMesocycleDate } from './utils/mesocycleCardHelpers'

interface CompletedMesocycleContentProps {
  mesocycle: Doc<'mesocycles'>
}

export function CompletedMesocycleContent({
  mesocycle,
}: CompletedMesocycleContentProps) {
  if (!mesocycle.startDate) return null

  const completionDate =
    mesocycle.startDate +
    mesocycle.durationWeeks * 7 * 24 * 60 * 60 * 1000

  return (
    <div className="text-sm text-muted-foreground">
      Completed {formatMesocycleDate(completionDate)}
    </div>
  )
}
