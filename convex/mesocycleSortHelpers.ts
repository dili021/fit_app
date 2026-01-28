import type { Doc } from './_generated/dataModel'

/**
 * Check if mesocycle is active
 */
function isActive(mesocycle: Doc<'mesocycles'>): boolean {
  return mesocycle.status === 'active'
}

/**
 * Compare two mesocycles for sorting
 * Returns: -1 if a comes before b, 1 if b comes before a, 0 if equal
 */
export function compareMesocycles(
  a: Doc<'mesocycles'>,
  b: Doc<'mesocycles'>,
): number {
  const aActive = isActive(a)
  const bActive = isActive(b)

  if (aActive && !bActive) return -1
  if (bActive && !aActive) return 1

  if (!aActive && !bActive) {
    const orderA = a.order ?? 0
    const orderB = b.order ?? 0
    if (orderA !== orderB) return orderA - orderB
  }

  return b._creationTime - a._creationTime
}
