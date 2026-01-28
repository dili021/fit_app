import { Play } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function DashboardLoadingState() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              <h2 className="text-2xl font-semibold">Loading...</h2>
            </CardTitle>
            <CardDescription className="mt-2">
              Loading mesocycle data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 bg-muted rounded-full animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-muted rounded animate-pulse" />
          <div className="h-16 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
      </CardFooter>
    </Card>
  )
}
