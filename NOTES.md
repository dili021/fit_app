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

## Future Considerations

- Better Auth database integration: Currently using stateless mode. May need to add database adapter for user persistence if required.
- Exercise metadata: Schema includes `metadata: v.optional(v.any())` for future expansion (form cues, equipment, etc.)
