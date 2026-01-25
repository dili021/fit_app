import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/history/')({
  component: History,
})

function History() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Workout History</h1>
      <p className="text-gray-600">Workout history and progress charts coming soon...</p>
    </div>
  )
}
