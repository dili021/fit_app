import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MesocycleEmptyStateProps {
  onCreateClick: () => void
}

export function MesocycleEmptyState({
  onCreateClick,
}: MesocycleEmptyStateProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="pt-12 pb-12 text-center">
        <div className="space-y-4">
          <div className="text-4xl">📋</div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Create your first mesocycle
            </h3>
            <p className="text-muted-foreground mb-6">
              Start planning your training cycle by creating a mesocycle
            </p>
            <Button onClick={onCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              Create Mesocycle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
