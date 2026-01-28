import { useQuery } from 'convex/react'
import type { FunctionReference } from 'convex/server'

/**
 * Adapter hook for Convex queries that provides consistent state handling.
 *
 * Wraps Convex's useQuery with additional state flags for easier component logic.
 * Preserves all Convex features: real-time updates, subscriptions, caching.
 *
 * @example
 * ```tsx
 * const { data, isLoading, isEmpty, isReady } = useConvexQuery(
 *   api.workouts.getAllWorkouts,
 *   { userId }
 * )
 *
 * if (isLoading) return <LoadingSpinner />
 * if (isEmpty) return <EmptyState message="No workouts" />
 * return <WorkoutList workouts={data} />
 * ```
 */
export function useConvexQuery<TQuery extends FunctionReference<'query'>>(
  query: TQuery,
  args: TQuery['_args'],
) {
  const data = useQuery(query, args)

  const isLoading = data === undefined
  const isEmpty = data === null || (Array.isArray(data) && data.length === 0)
  const isReady = !isLoading && !isEmpty

  return {
    data,
    isLoading,
    isEmpty,
    isReady,
  }
}

/**
 * Hook to check if any of multiple queries are still loading.
 * Useful for components that need to wait for multiple data sources.
 *
 * @example
 * ```tsx
 * const mesocycle = useConvexQuery(api.mesocycles.getActiveMesocycle, { userId })
 * const workouts = useConvexQuery(api.workouts.getRecentWorkouts, { userId })
 *
 * if (useQueriesLoading(mesocycle.data, workouts.data)) {
 *   return <LoadingSpinner />
 * }
 * ```
 */
export function useQueriesLoading(
  ...queries: Array<unknown | undefined>
): boolean {
  return queries.some((query) => query === undefined)
}

/**
 * Hook to check if all queries are ready (loaded and not empty).
 *
 * @example
 * ```tsx
 * const mesocycle = useConvexQuery(api.mesocycles.getActiveMesocycle, { userId })
 * const workouts = useConvexQuery(api.workouts.getRecentWorkouts, { userId })
 *
 * if (useQueriesReady(mesocycle.data, workouts.data)) {
 *   return <Dashboard mesocycle={mesocycle.data} workouts={workouts.data} />
 * }
 * ```
 */
export function useQueriesReady(
  ...queries: Array<unknown | null | undefined>
): boolean {
  return queries.every((query) => {
    if (query === undefined) return false // Still loading
    if (query === null) return false // Empty
    if (Array.isArray(query) && query.length === 0) return false // Empty array
    return true // Has data
  })
}
