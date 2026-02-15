import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlannedMesocycleContentProps {
  hasActiveMesocycle?: boolean
  onActivate?: () => void
}

export function PlannedMesocycleContent({
  hasActiveMesocycle,
  onActivate,
}: PlannedMesocycleContentProps) {
  return (
    <div className="space-y-3">
      {hasActiveMesocycle ? (
        <p className="text-sm text-muted-foreground">
          Conclude your active mesocycle to activate this one.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Ready to activate. Configure training parameters to start.
          </p>
          {onActivate && (
            <Button onClick={onActivate} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Activate Mesocycle
            </Button>
          )}
        </>
      )}
    </div>
  )
}
