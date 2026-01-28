import { useEffect, useRef } from 'react'

/**
 * Hook for infinite scroll functionality
 */
export function useInfiniteScroll(
  selectedView: 'list' | 'calendar' | 'charts',
  status: 'CanLoadMore' | 'LoadingMore' | 'LoadingFirstPage' | 'Exhausted',
  isLoadingMore: boolean,
  loadMore: (numItems: number) => void,
) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (selectedView !== 'list' || status !== 'CanLoadMore') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore(10)
        }
      },
      { threshold: 0.1 },
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [selectedView, status, loadMore, isLoadingMore])

  return loadMoreRef
}
