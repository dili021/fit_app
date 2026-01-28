# Development Notes

## Technical Debt

### Demo Files Cleanup ✅ COMPLETE

All demo files have been removed:

- ✅ `src/routes/demo/better-auth.tsx` - Deleted
- ✅ `src/routes/demo/form.address.tsx` - Deleted
- ✅ `src/routes/demo/form.simple.tsx` - Deleted
- ✅ `src/routes/demo/start.api-request.tsx` - Deleted
- ✅ `src/routes/demo/start.server-funcs.tsx` - Deleted
- ✅ `src/routes/demo/start.ssr.*.tsx` - Deleted
- ✅ `src/routes/demo/strapi*.tsx` - Deleted
- ✅ `src/routes/demo/api.names.ts` - Deleted
- ✅ `src/lib/strapiClient.ts` - Deleted
- ✅ `src/hooks/demo.form*.ts` - Deleted
- ✅ `src/components/demo.FormComponents.tsx` - Deleted
- ✅ Strapi dependency removed from `package.json`

### Removed Files

- `convex/todos.ts` - Deleted (was demo code)
- `src/routes/demo/convex.tsx` - Deleted (referenced non-existent todos table)
- `src/routes/demo/api.tq-todos.ts` - Deleted (todos API route)
- `src/routes/demo/tanstack-query.tsx` - Deleted (depended on deleted todos API)

## Core Features (NOT Optional)

### Auto-Progression System ✅ IMPLEMENTED

**This is a CORE feature, not optional.** It's part of the COFVIR framework (Intensity control) and is essential to the app's value proposition.

- **8-12 Rep Range Logic**: Automatically suggests weight changes to keep users in the hypertrophy sweet spot
- **Progression Rules**:
  - If reps ≥ 12 → suggest weight increase (+2.5kg)
  - If reps < 8 → suggest weight decrease (-2.5kg)
  - If 8-12 → maintain weight (sweet spot)
- **Implementation**:
  - `convex/progression.ts` - `getSuggestedWeight` query
  - `convex/sets.ts` - `createSet` mutation calculates and stores `suggestedWeightChange`
  - `src/components/workout/SetLogger.tsx` - Shows suggestions with visual indicators

**Why it's core**: This is what keeps users progressing and in the optimal training zone. Without it, users just log sets without guidance - defeating the purpose of the app.

## Future Considerations

- ✅ Better Auth - Convex integration: IMPLEMENTED
- Exercise metadata: Schema includes `metadata: v.optional(v.any())` for future expansion (form cues, equipment, etc.)
- Improve radio buttons UI during meso setup
- Info project - add helpful info throughout the app: why the set ranges are as they are, how progression is handled, etc. Basically explain the core tenants to the user and other potential helpful info
- Improve exercise library and resolution: add variants (e.g. bench press - incline/decline/flat, barbell/dumbbell, etc.)
- Diagnostic flow onboarding - discover a person's 1rm to establish optimal hypertrophy parameters for intensity

## Refactoring Tasks

### Avoid TanStack Query for Convex Data

**Status**: TODO

**Issue**: Currently using TanStack Query (`useQuery` from `@tanstack/react-query`) for Convex data, which is redundant since Convex provides its own reactive hooks (`useQuery` from `convex/react`).

**Why**:

- Convex's `useQuery` already provides reactive, real-time updates
- TanStack Query adds unnecessary abstraction layer
- Convex has native pagination support (`usePaginatedQuery`) that works better than TSQ's infinite queries
- Reduces bundle size and complexity

**Action Items**:

- [ ] Replace all `useQuery` from `@tanstack/react-query` with `useQuery` from `convex/react` for Convex data
- [ ] Use Convex's `usePaginatedQuery` for workout history infinite scroll instead of TSQ infinite queries
- [ ] Keep TanStack Query only for non-Convex API calls (if any)
- [ ] Update all components that fetch Convex data to use Convex hooks directly

**Workout History Pagination**:

- Implement infinite scroll using Convex's native `usePaginatedQuery` hook
- Update `getAllWorkouts` query to use `.paginate(paginationOpts)` instead of `.collect()`
- Add scroll detection to load more workouts when user scrolls near bottom
- This will improve performance as workout history grows
