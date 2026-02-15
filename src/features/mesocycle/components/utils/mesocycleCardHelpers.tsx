import type { Doc } from '@db/_generated/dataModel'
import { Badge } from '@/components/ui/badge'

export function getStatusBadge(mesocycle: Doc<'mesocycles'>) {
  switch (mesocycle.status) {
    case 'active':
      return (
        <Badge variant="default" className="bg-green-500">
          Active
        </Badge>
      )
    case 'planned':
      return <Badge variant="secondary">Planned</Badge>
    case 'completed':
      return <Badge variant="outline">Completed</Badge>
    case 'deload':
      return (
        <Badge variant="outline" className="bg-yellow-500/20">
          Deload
        </Badge>
      )
    default:
      return <Badge variant="outline">{mesocycle.status}</Badge>
  }
}

export function formatMesocycleDate(timestamp?: number) {
  if (!timestamp) return 'Not started'
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getPrimaryPatternNames(
  mesocycle: Doc<'mesocycles'>,
  patterns?: Array<Doc<'patterns'>>,
) {
  if (!patterns) return 'Mesocycle'
  return mesocycle.primaryPatterns
    .map((id) => patterns.find((p) => p._id === id)?.displayName)
    .filter(Boolean)
    .join(' and ')
}

export function calculateCurrentWeek(
  currentWeek: number | undefined,
  statusInfoCurrentWeek: number | undefined,
  startDate: number | undefined,
): number {
  if (currentWeek !== undefined) return currentWeek
  if (statusInfoCurrentWeek !== undefined) return statusInfoCurrentWeek
  if (startDate) {
    return (
      Math.floor((Date.now() - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1
    )
  }
  return 1
}
