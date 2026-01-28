import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function MesocycleCompletedCard() {
  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <CardContent className="py-6 text-center">
        <p className="text-green-900 dark:text-green-100 mb-4">
          This mesocycle has been completed. Set up a new mesocycle to continue
          training.
        </p>
        <Button asChild>
          <Link to="/mesocycles">Mesocycles</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
