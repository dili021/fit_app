import { useMutation } from 'convex/react'
import { FunctionReference } from 'convex/server'
import { useState, useCallback } from 'react'

/**
 * Adapter hook for Convex mutations that provides consistent error and loading handling.
 * 
 * Wraps Convex's useMutation with built-in error state and loading tracking.
 * Preserves all Convex features: optimistic updates, real-time sync.
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading, error, resetError } = useConvexMutation(
 *   api.workouts.createWorkout,
 *   {
 *     onSuccess: (workoutId) => {
 *       navigate(`/workout/${workoutId}`)
 *     },
 *     onError: (err) => {
 *       console.error('Failed to create workout:', err)
 *     }
 *   }
 * )
 * 
 * const handleCreate = () => {
 *   mutate({ userId, mesocycleId })
 * }
 * 
 * return (
 *   <div>
 *     {error && <ErrorDisplay error={error} onDismiss={resetError} />}
 *     <Button onClick={handleCreate} disabled={isLoading}>
 *       {isLoading ? 'Creating...' : 'Create Workout'}
 *     </Button>
 *   </div>
 * )
 * ```
 */
export function useConvexMutation<
  Mutation extends FunctionReference<'mutation'>,
  Args extends Parameters<Mutation>[0],
>(mutation: Mutation, options?: {
  onSuccess?: (result: Awaited<ReturnType<Mutation>>) => void
  onError?: (error: Error) => void
}) {
  const convexMutation = useMutation(mutation)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (args: Args) => {
      setError(null)
      setIsLoading(true)

      try {
        const result = await convexMutation(args)
        options?.onSuccess?.(result)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        options?.onError?.(err instanceof Error ? err : new Error(errorMessage))
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [convexMutation, options]
  )

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  return {
    mutate,
    isLoading,
    error,
    resetError,
  }
}
