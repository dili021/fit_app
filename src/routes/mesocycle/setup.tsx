import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mesocycle/setup')({
  component: MesocycleSetup,
})

function MesocycleSetup() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Set Up Your Mesocycle</h1>
      <p className="text-gray-600">Mesocycle setup wizard coming soon...</p>
    </div>
  )
}
