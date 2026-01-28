import { Calendar } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { Doc } from '@db/_generated/dataModel'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ActiveWorkoutCardProps {
  activeWorkout: Doc<'workouts'>
}

export function ActiveWorkoutCard({ activeWorkout }: ActiveWorkoutCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl font-semibold">Active Workout</h2>
        </CardTitle>
        <CardDescription>You have an active workout session</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Started{' '}
              {new Date(
                activeWorkout.startedAt || activeWorkout.date,
              ).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to="/workout/active">Continue Workout</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
