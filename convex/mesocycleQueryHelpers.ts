/**
 * Query helpers to reduce nested callback depth
 */

import type { IndexRange, IndexRangeBuilder } from 'convex/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericIndexRangeBuilder = IndexRangeBuilder<any, any, any>

export function buildUserIdStatusQuery(
  queryBuilder: GenericIndexRangeBuilder,
  userId: string,
  status: string,
): IndexRange {
  const afterFirstEq = queryBuilder.eq(
    'userId',
    userId,
  ) as GenericIndexRangeBuilder
  return afterFirstEq.eq('status', status)
}

export function buildUserIdQuery(
  queryBuilder: GenericIndexRangeBuilder,
  userId: string,
): IndexRange {
  // userId index has only one field, so eq returns IndexRange
  return queryBuilder.eq('userId', userId)
}
