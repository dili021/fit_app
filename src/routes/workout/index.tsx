import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workout/')({
  component: WorkoutIndex,
})

function WorkoutIndex() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Workout</h1>
      <p className="text-gray-600">Workout session coming soon...</p>
    </div>
  )
}
