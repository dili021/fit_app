import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workout/active')({
  component: ActiveWorkout,
})

function ActiveWorkout() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Active Workout</h1>
      <p className="text-gray-600">Full-screen pattern-by-pattern workout flow coming soon...</p>
    </div>
  )
}
