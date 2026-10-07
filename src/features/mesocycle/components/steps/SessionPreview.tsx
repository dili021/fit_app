import type { Doc, Id } from '@db/_generated/dataModel'

interface SessionPreviewProps {
  mesocycle: Doc<'mesocycles'>
  patterns: Array<Doc<'patterns'>> | undefined
  setsPerPrimaryPatternPerSession: number | null
  numSecondaryPatterns: number
  totalSetsPerSessionWithSecondary: number | null
}

export function SessionPreview({
  mesocycle,
  patterns,
  setsPerPrimaryPatternPerSession,
  numSecondaryPatterns,
  totalSetsPerSessionWithSecondary,
}: SessionPreviewProps) {
  if (
    totalSetsPerSessionWithSecondary === null ||
    setsPerPrimaryPatternPerSession === null ||
    !patterns
  ) {
    return null
  }

  return (
    <div className="space-y-2 pt-3 border-t">
      <h4 className="font-semibold text-sm">Session Preview</h4>
      <div className="space-y-1 text-sm">
        {/* Primary patterns */}
        {mesocycle.primaryPatterns.map((patternId: Id<'patterns'>) => {
          const pattern = patterns.find((p) => p._id === patternId)
          return (
            <div key={patternId} className="flex justify-between">
              <span className="text-muted-foreground">
                {pattern?.displayName}:
              </span>
              <span className="font-medium">
                {setsPerPrimaryPatternPerSession} sets
              </span>
            </div>
          )
        })}
        {/* Secondary patterns (maintenance) */}
        {numSecondaryPatterns > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Secondary patterns (maintenance):
            </span>
            <span className="font-medium">1 set each</span>
          </div>
        )}
        <div className="pt-1 border-t">
          <div className="flex justify-between font-medium">
            <span>Total sets per session:</span>
            <span>{totalSetsPerSessionWithSecondary}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
