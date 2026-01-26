# Development Notes

## Technical Debt

### Demo Files to Clean Up
The following demo/example files remain in the codebase and should be removed when no longer needed:

- `src/routes/demo/better-auth.tsx` - Better Auth demo/example
- `src/routes/demo/form.address.tsx` - Form example
- `src/routes/demo/form.simple.tsx` - Form example
- `src/routes/demo/start.api-request.tsx` - API request example
- `src/routes/demo/start.server-funcs.tsx` - Server functions example (uses local todos.json)
- `src/routes/demo/start.ssr.*.tsx` - Multiple SSR examples
- `src/routes/demo/strapi*.tsx` - Strapi integration examples
- `src/routes/demo/api.names.ts` - API example

**Note**: These are template examples and don't break anything, but should be cleaned up once the app is feature-complete.

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

- Better Auth database integration: Currently using stateless mode. May need to add database adapter for user persistence if required.
- Exercise metadata: Schema includes `metadata: v.optional(v.any())` for future expansion (form cues, equipment, etc.)
