import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/exercises/')({
  component: Exercises,
})

function Exercises() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Exercises</h1>
      <p className="text-gray-600">Exercise browser coming soon...</p>
    </div>
  )
}
