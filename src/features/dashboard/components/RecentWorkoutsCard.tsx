import { Link } from '@tanstack/react-router'
import { Calendar, Dumbbell } from 'lucide-react'
import type { Doc } from '../../../../convex/_generated/dataModel'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RecentWorkoutsCardProps {
  recentWorkouts: Array<Doc<'workouts'>> | undefined
  formatWorkoutDate: (timestamp: number) => string
}

export function RecentWorkoutsCard({
  recentWorkouts,
  formatWorkoutDate,
}: RecentWorkoutsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl font-semibold">Recent Workouts</h2>
        </CardTitle>
        <CardDescription>Your last 3 training sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {!recentWorkouts || recentWorkouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No workouts yet</p>
            <p className="text-sm mt-1">
              Start your first workout to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div
                key={workout._id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      Week {workout.weekNumber} -{' '}
                      {formatWorkoutDate(workout.date)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {workout.completed ? (
                        <span className="text-green-600 dark:text-green-400">
                          Completed
                        </span>
                      ) : (
                        <span className="text-orange-600 dark:text-orange-400">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/history">View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {recentWorkouts && recentWorkouts.length > 0 && (
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/history">View All History</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
