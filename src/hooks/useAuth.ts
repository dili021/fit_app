import { authClient } from '@/lib/auth-client'

/**
 * Hook to get current user session and ID
 * Returns userId for use in Convex queries
 */
export function useAuth() {
  const { data: session, isPending } = authClient.useSession()

  return {
    session,
    user: session?.user,
    userId: session?.user?.id,
    isAuthenticated: !!session?.user,
    isPending,
  }
}
