import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function WorkoutLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
    </div>
  )
}

export function NoWorkoutState() {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">No Active Workout</h2>
        <p className="text-muted-foreground mb-4">
          Start a new workout from the workout page
        </p>
        <Button
          onClick={() => {
            void navigate({ to: '/workout' })
          }}
        >
          Go to Workout Page
        </Button>
      </div>
    </div>
  )
}

export function WorkoutDataNotFoundState() {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Workout Data Not Found</h2>
        <p className="text-muted-foreground mb-4">
          Unable to load mesocycle. Please start a new workout.
        </p>
        <Button
          onClick={() => {
            void navigate({ to: '/workout' })
          }}
        >
          Go to Workout Page
        </Button>
      </div>
    </div>
  )
}
