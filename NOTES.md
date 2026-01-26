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

- Better Auth database integration: Currently using stateless mode. May need to add database adapter for user persistence if required.
- Exercise metadata: Schema includes `metadata: v.optional(v.any())` for future expansion (form cues, equipment, etc.)
