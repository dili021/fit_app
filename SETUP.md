# Setup Instructions

## Phase 0: Tech Stack Setup

### Convex Setup (Interactive - Run Manually)

Convex requires interactive authentication. Run these commands in your terminal:

```bash
# Initialize Convex (will prompt for login)
npx convex dev --once --configure=new

# This will:
# 1. Prompt you to login/create account
# 2. Create a new deployment
# 3. Generate convex.json
# 4. Update .env.local with CONVEX_DEPLOYMENT and VITE_CONVEX_URL
```

After running the above, start the Convex dev server:
```bash
npx convex dev
```

### Better Auth Setup ✅

- Secret generated and added to `.env.local`
- Configuration updated in `src/lib/auth.ts`
- Route handler already set up at `src/routes/api/auth/$.ts`

**Note**: Better Auth will need a database for user persistence. We can configure this after Convex is set up, or use Better Auth's built-in database adapter.

### Environment Variables

Make sure `.env.local` has:
- `BETTER_AUTH_SECRET` ✅ (configured)
- `BETTER_AUTH_URL=http://localhost:3000` ✅
- `CONVEX_DEPLOYMENT` (will be set by `npx convex dev`)
- `VITE_CONVEX_URL` (will be set by `npx convex dev`)

## Phase 1: Schema & Seed Data ✅

The schema and seed scripts have been created:

### Schema (`convex/schema.ts`)
- `patterns` - Movement patterns (Push, Pull, Squat, Hinge, Lunge, Twist)
- `exercises` - Exercises within each pattern
- `mesocycles` - User training blocks
- `workouts` - Individual workout sessions
- `sets` - Sets within workouts

### Seed Data (`convex/seed.ts`)

After Convex is running, seed the database:

```bash
# Seed patterns and exercises
npx convex run seed:seedAll

# Or seed individually:
npx convex run seed:seedPatterns
npx convex run seed:seedExercises
```

## Next Steps

After Convex is configured and seeded, proceed with Phase 2: Routing & Auth Flow.
