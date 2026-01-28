import { Dumbbell } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function DashboardNoMesocycleState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No Active Mesocycle</h2>
        <p className="text-muted-foreground mb-6">
          Start a mesocycle to start tracking your workouts
        </p>
        <Button asChild>
          <Link to="/mesocycles">Mesocycles</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
