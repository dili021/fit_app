import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/workout/')({
  component: WorkoutIndex,
})

function WorkoutIndex() {
  const { userId, isPending } = useAuth()

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <WorkoutIndexContent userId={userId!} />
    </ProtectedRoute>
  )
}

function WorkoutIndexContent({ userId }: { userId: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Workout</h1>
      <p className="text-gray-600">Workout session coming soon...</p>
    </div>
  )
}
