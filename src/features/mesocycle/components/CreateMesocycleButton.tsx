import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CreateMesocycleButtonProps {
  onCreateClick: () => void
}

export function CreateMesocycleButton({
  onCreateClick,
}: CreateMesocycleButtonProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="pt-6 pb-6 text-center">
        <Button variant="outline" onClick={onCreateClick} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Mesocycle
        </Button>
      </CardContent>
    </Card>
  )
}
