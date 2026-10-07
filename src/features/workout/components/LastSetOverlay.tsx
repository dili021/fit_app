import { Check } from 'lucide-react'
import type { Doc } from '@db/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface LastSetOverlayProps {
  isVisible: boolean
  lastSet: Doc<'sets'> | null
  exerciseName: string | undefined
  onViewSummary: () => void
}

export function LastSetOverlay({
  isVisible,
  lastSet,
  exerciseName,
  onViewSummary,
}: LastSetOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="space-y-4 text-center">
          <h3 className="text-lg font-semibold">Last set done</h3>
          {lastSet && (
            <div>
              <p className="text-3xl font-mono font-bold">
                {lastSet.weight}kg × {lastSet.reps}
              </p>
              {exerciseName && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {exerciseName}
                </p>
              )}
            </div>
          )}
          <Button onClick={onViewSummary} className="w-full">
            <Check className="h-4 w-4 mr-2" />
            View Summary
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
