import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/mesocycle/setup')({
  component: MesocycleSetupRedirect,
})

function MesocycleSetupRedirect() {
  const navigate = useNavigate()
  const { isPending } = useAuth()

  useEffect(() => {
    if (!isPending) {
      void navigate({ to: '/mesocycles' })
    }
  }, [navigate, isPending])

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    </ProtectedRoute>
  )
}
