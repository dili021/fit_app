import { ReactNode } from 'react'
import { Button } from './button'

/**
 * Loading spinner component for full-page loading states
 * 
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <LoadingSpinner />
 * }
 * ```
 */
export function LoadingSpinner({ 
  className = "flex items-center justify-center min-h-screen" 
}: { 
  className?: string 
}) {
  return (
    <div className={className}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-400" />
    </div>
  )
}

/**
 * Empty state component for when data is loaded but empty
 * 
 * @example
 * ```tsx
 * if (isEmpty) {
 *   return (
 *     <EmptyState 
 *       message="No workouts yet" 
 *       action={<Button onClick={handleCreate}>Create First Workout</Button>}
 *     />
 *   )
 * }
 * ```
 */
export function EmptyState({ 
  message, 
  action 
}: { 
  message: string
  action?: ReactNode 
}) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">{message}</p>
      {action}
    </div>
  )
}

/**
 * Error display component for mutation errors
 * 
 * @example
 * ```tsx
 * const { error, resetError } = useConvexMutation(api.workouts.createWorkout)
 * 
 * return (
 *   <div>
 *     {error && <ErrorDisplay error={error} onDismiss={resetError} />}
 *     <Button onClick={handleCreate}>Create</Button>
 *   </div>
 * )
 * ```
 */
export function ErrorDisplay({ 
  error, 
  onDismiss 
}: { 
  error: string
  onDismiss?: () => void 
}) {
  return (
    <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
      <div className="flex items-center justify-between">
        <p>{error}</p>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDismiss}
            className="ml-4 h-auto p-1 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            ×
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Query state handler component that handles loading, empty, and error states.
 * 
 * This component provides a declarative way to handle all query states in one place.
 * 
 * @example
 * ```tsx
 * const { data, isLoading, isEmpty } = useConvexQuery(api.workouts.getAllWorkouts, { userId })
 * 
 * return (
 *   <QueryStateHandler
 *     isLoading={isLoading}
 *     isEmpty={isEmpty}
 *     emptyMessage="No workouts yet"
 *     emptyAction={<Button onClick={handleCreate}>Create First Workout</Button>}
 *   >
 *     <WorkoutList workouts={data} />
 *   </QueryStateHandler>
 * )
 * ```
 */
export function QueryStateHandler({
  isLoading,
  isEmpty,
  error,
  emptyMessage = "No data available",
  emptyAction,
  loadingComponent,
  emptyComponent,
  errorComponent,
  children,
}: {
  isLoading: boolean
  isEmpty: boolean
  error?: string | null
  emptyMessage?: string
  emptyAction?: ReactNode
  loadingComponent?: ReactNode
  emptyComponent?: ReactNode
  errorComponent?: ReactNode
  children: ReactNode
}) {
  if (isLoading) {
    return <>{loadingComponent || <LoadingSpinner />}</>
  }

  if (error) {
    return <>{errorComponent || <ErrorDisplay error={error} />}</>
  }

  if (isEmpty) {
    return <>{emptyComponent || <EmptyState message={emptyMessage} action={emptyAction} />}</>
  }

  return <>{children}</>
}
