import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/history/')({
  component: History,
})

function History() {
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
      <HistoryContent userId={userId!} />
    </ProtectedRoute>
  )
}

function HistoryContent({ userId }: { userId: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Workout History</h1>
      <p className="text-gray-600">Workout history and progress charts coming soon...</p>
    </div>
  )
}
