import { Navigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Protected route wrapper that redirects to sign-in if not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  if (!session?.user) {
    return <Navigate to="/sign-in" />
  }

  return <>{children}</>
}
