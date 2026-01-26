---
name: Training Tracker App
overview: Build a mesocycle-based training tracker with movement pattern focus, intelligent set distribution, per-set exercise selection via carousel, and automatic progression system based on 8-12 rep range.
todos:
  - id: tech-setup
    content: Set up Convex deployment, environment variables, and Better Auth configuration
    status: completed
  - id: schema-setup
    content: Set up Convex schema with patterns, exercises, mesocycles, workouts, and sets tables with proper indices
    status: completed
  - id: seed-data
    content: Create seed script for 6 patterns and placeholder exercises (3-5 per pattern)
    status: completed
  - id: auth-flow
    content: Configure Better Auth for required authentication and user data syncing
    status: completed
  - id: routing-structure
    content: "Set up TanStack Router routes: /, /mesocycle/setup, /workout, /history, /exercises"
    status: completed
  - id: mesocycle-wizard
    content: Build 4-step mesocycle setup wizard with reactive session duration calculation and divisibility logic
    status: pending
  - id: dashboard
    content: Create dashboard with active mesocycle card, progress tracking, and quick start workout button
    status: pending
  - id: workout-template
    content: Implement workout template generation based on mesocycle config, applying build-up logic if needed
    status: pending
  - id: exercise-carousel
    content: Build swipeable exercise carousel component for per-set exercise selection
    status: pending
  - id: set-logging
    content: Create set logging UI with timer, weight/reps input, and auto-progression logic (8-12 rep range)
    status: pending
  - id: workout-flow
    content: Complete full-screen pattern-by-pattern workout flow with locked primary patterns and pattern choice for maintenance
    status: pending
  - id: rest-timer
    content: Build rest timer with countdown and notifications, triggered after set completion
    status: pending
  - id: history-page
    content: Build history page with workout list, calendar view, and progress charts
    status: pending
  - id: deload-automation
    content: Implement mesocycle completion detection and auto-deload week suggestion
    status: pending
isProject: false
---

# Training Tracker App Plan

## Overview

This app focuses on mesocycle-based training with movement patterns rather than traditional split routines. The unique aspects include: per-set exercise selection (not per-workout), intelligent set distribution across sessions, and automatic progression based on the 8-12 rep sweet spot.

## Architecture

### Tech Stack

- **Frontend**: React + TanStack Router (file-based) + TanStack Query + TanStack Form
- **Backend**: Convex (real-time data, queries, mutations)
- **Auth**: Better Auth (already configured)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: TanStack Query for server state, React state for local UI state

### Core Concepts

**Movement Patterns (6 total)**:

- Push, Pull, Squat, Hinge, Lunge, Twist
- User selects 1-2 primary patterns per mesocycle
- Primary patterns: 10-20 sets/week (must be divisible by sessions/week)
- Non-primary patterns: 1 set/session for maintenance

**Key Innovation**: Sets are tied to patterns, not exercises. User swipes to pick exercise per-set during workout, allowing ultimate flexibility (e.g., Push: 3 sets bench, 1 set pushups, 2 sets dips).

## Database Schema (Convex)

### patterns table

```typescript
{
  name: v.string(), // "push", "pull", etc.
  displayName: v.string(), // "Push", "Pull", etc.
  order: v.number(), // Used for workout template ordering - primary patterns come first
  description: v.optional(v.string()),
}
```

**Note on `order`**: This field determines the sequence of patterns in workout templates. When generating a workout, the system:

1. Orders patterns by the user's selected primary patterns first (these come from their mesocycle config)
2. Then adds non-primary patterns in their natural order
3. This ensures users do their focus work first when they're fresh

### exercises table

```typescript
{
  name: v.string(), // "Bench Press"
  patternId: v.id("patterns"),
  metadata: v.optional(v.any()), // extensible for future features (form cues, equipment, etc.)
}
// Index: patternId
```

### mesocycles table

```typescript
{
  userId: v.string(), // from Better Auth
  name: v.optional(v.string()), // "Winter Bulk", etc.
  startDate: v.number(), // timestamp
  durationWeeks: v.number(), // default 6
  primaryPatterns: v.array(v.id("patterns")), // 1-2 patterns
  targetSetsPerWeek: v.number(), // 12, 15, or 18 (divisible by sessionsPerWeek)
  sessionsPerWeek: v.number(), // 3, 4, etc.
  wasPreviouslyTraining: v.boolean(), // affects build-up
  restTimeMinutes: v.number(), // default 3 min rest between sets
  status: v.string(), // "active", "completed", "deload"
  currentWeek: v.number(), // calculated field for progress
}
// Index: userId, status
```

### workouts table

```typescript
{
  userId: v.string(),
  mesocycleId: v.id("mesocycles"),
  date: v.number(), // timestamp
  weekNumber: v.number(), // week within mesocycle
  completed: v.boolean(),
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
}
// Index: userId, mesocycleId, date
```

### sets table

```typescript
{
  workoutId: v.id("workouts"),
  patternId: v.id("patterns"),
  exerciseId: v.id("exercises"),
  weight: v.number(), // in kg or lbs
  reps: v.number(),
  orderInWorkout: v.number(), // 1, 2, 3... for sequence
  startTime: v.number(), // when set started
  endTime: v.number(), // when set completed
  duration: v.number(), // actual time taken in seconds
  suggestedWeightChange: v.optional(v.string()), // "increase", "decrease", "maintain"
}
// Indices: workoutId, patternId, exerciseId
```

**Note**: We track actual set duration (start/end times) to improve session duration estimates over time.

## Key Features & Implementation

### 1. Mesocycle Setup Wizard (`/mesocycle/setup`)

**Multi-step form using TanStack Form**:

**Step 1: Duration**

- Duration slider (4-12 weeks, default 6)

**Step 2: Primary Pattern Selection**

- Display 6 patterns as a simple list with checkboxes
- Select 1-2 as primary focus
- Brief description per pattern (optional expand for details)

**Step 3: Volume & Training History** (Combined step with reactive calculations)

- Sessions/week selector (2-7)
- Target sets/week per primary pattern: **filtered to show only divisible options**
  - E.g., 3 sessions/week → show 12, 15, 18 sets/week options
  - Calculate: `range(10, 20).filter(x => x % sessionsPerWeek === 0)`
- Show research info: "10-20 sets/week is the optimal range for hypertrophy" (with citation/link)
- Toggle: "Were you training in the previous period?"
  - If NO → show: "System will build up: Weeks 1-2 (50%), Weeks 3-4 (75%), Weeks 5+ (100%)"
  - If YES → "You'll start at full volume"

**Reactive Session Duration Display** (updates as user changes values):

```
Session Template:
• Push: 6 sets
• Pull: 6 sets  
• Squat: 1 set (maintenance)
• Hinge: 1 set (maintenance)
• Lunge: 1 set (maintenance)
• Twist: 1 set (maintenance)

Total: 16 sets/session
Estimated duration: ~80 minutes (5 min/set including rest)
```

**User can adjust sets/week up or down to fit their schedule** based on this reactive feedback.

**Step 4: Rest Time Configuration**

- Rest time slider (1-5 min, default 3 min)
- Show info: "2-3 minutes of rest between sets has been shown to be optimal for muscle gains" (with research citation)
- Note: "During workouts, you'll use a timer for each set. We'll track actual durations to improve estimates."
- Update the estimated session duration based on rest time: `sets × (avg_set_duration + rest_time)`
  - Initial estimate uses 2 min avg set duration (will improve with user data)

**Final summary & confirm**

**Implementation**:

- [`src/routes/mesocycle/setup.tsx`](src/routes/mesocycle/setup.tsx) - main wizard component
- [`src/components/mesocycle/SetupSteps.tsx`](src/components/mesocycle/SetupSteps.tsx) - step components
- [`convex/mesocycles.ts`](convex/mesocycles.ts) - mutations: `createMesocycle`, queries: `getActiveMesocycle`, `calculateSetDistribution`

### 2. Dashboard / Home (`/`)

**Shows**:

- Current active mesocycle card
  - Week X of Y, Progress bar
  - Primary patterns with weekly volume progress
  - "This week: 12/18 sets completed" (across all workouts)
- Quick action: "Start Workout" button (prominent)
- Recent workout history (last 3)
- Upcoming deload notification (if on final week)

**Implementation**:

- [`src/routes/index.tsx`](src/routes/index.tsx)
- [`src/components/dashboard/MesocycleCard.tsx`](src/components/dashboard/MesocycleCard.tsx)
- [`src/components/dashboard/QuickStartButton.tsx`](src/components/dashboard/QuickStartButton.tsx)
- [`convex/workouts.ts`](convex/workouts.ts) - queries: `getCurrentWeekStats`, `getRecentWorkouts`

### 3. Workout Session (`/workout`)

**Philosophy: "Make the user think as little as possible"**

The app controls for the important training variables (COFVIR framework):

- **C**hoice: User swipes to pick exercise (their preference)
- **O**rder: System enforces primary patterns first ("biggest rocks first")
- **F**requency: User chose this during setup
- **V**olume: System ensures target sets are hit
- **I**ntensity: System keeps user in 8-12 rep sweet spot
- **R**est: System manages rest periods

User just shows up and follows the flow. Don't like an exercise? Swipe it. System handles the rest.

**Session Flow**:

1. **Start Session** → creates workout record
2. **Pattern-by-Pattern Full-Screen Experience**:

   - One pattern at a time, full screen
   - Start with primary patterns ("biggest rocks first")
   - For each pattern, show progress: "Push - Set 1 of 6"

3. **Per-Set Flow** (within a pattern):

   - **Exercise selection**: Swipeable carousel (horizontal swipe to change)
   - **Weight input**: Number input, shows "Last: 60kg" for this exercise
   - **Large Start/Stop button**: Easy to tap during workout
   - **Reps input**: After stopping, input reps completed, shows "Last: 10 reps"
   - **Stop triggers rest timer**: Countdown (e.g., "Rest: 2:45")
   - **Rest completion notification**: Alert/vibration when rest is done
   - **Next set**: Automatically moves to next set in current pattern

4. **Pattern Transitions**:

   - When all sets for current pattern complete → move to next pattern
   - **During primary patterns**: User is locked into sequence (can't skip to non-primary)
   - **After primary patterns**: User can choose which maintenance pattern to do next
   - Each maintenance pattern: 1 set

5. **Always Available**: "Conclude Session" button (can end workout early)

**Set Template Generation**:

- Calculate sets per pattern for this session
- Primary patterns: distributed evenly (applying build-up % if not previously training)
- Non-primary patterns: 1 set each for maintenance
- **Order: Primary patterns come FIRST** (when user is fresh), then maintenance patterns
- Each set is tied to a pattern, not a specific exercise
- User can select different exercises for each set of the same pattern

**Auto-progression Logic** (after logging):

- If reps ≥ 12 → suggest weight increase for next time (+5 lbs / +2.5 kg)
- If reps < 8 → suggest weight decrease for next time (-5 lbs / -2.5 kg)  
- If 8-12 → maintain weight (in the hypertrophy sweet spot)
- System automatically adjusts suggested weight for that specific exercise next time user selects it

**UI/UX Details**:

- **Full-screen pattern view**: One pattern dominates the screen at a time
- **Large touch targets**: Start/Stop button is prominently sized for gym use
- **Swipe gestures**: Natural horizontal swipe to browse exercises
- **Progress indicator**: "Push - Set 3 of 6" at top
- **Last performance data**: Always show user's last weight/reps for confidence
- **Rest timer**: Large countdown timer during rest period
- **Pattern progression**: Clear visual transition when moving to next pattern

**Implementation**:

- [`src/routes/workout/index.tsx`](src/routes/workout/index.tsx) - workout entry/start
- [`src/routes/workout/active.tsx`](src/routes/workout/active.tsx) - full-screen pattern-by-pattern flow
- [`src/components/workout/PatternView.tsx`](src/components/workout/PatternView.tsx) - full-screen pattern container
- [`src/components/workout/ExerciseCarousel.tsx`](src/components/workout/ExerciseCarousel.tsx) - swipeable exercise selector
- [`src/components/workout/SetControl.tsx`](src/components/workout/SetControl.tsx) - weight input, start/stop, reps input
- [`src/components/workout/RestTimer.tsx`](src/components/workout/RestTimer.tsx) - countdown with notifications
- [`src/components/workout/PatternSelector.tsx`](src/components/workout/PatternSelector.tsx) - for choosing maintenance patterns
- [`convex/workouts.ts`](convex/workouts.ts) - mutations: `startWorkout`, `logSet`, `completeWorkout`
- [`convex/progression.ts`](convex/progression.ts) - queries: `getSuggestedWeight`, `getLastPerformance`

### 4. History & Progress (`/history`)

**Views**:

- Calendar view: dots on workout days
- List view: chronological workout log
- Per-exercise progress charts (weight over time)
- Per-pattern volume tracking (sets/week graph)
- Mesocycle comparison (if multiple completed)

**Implementation**:

- [`src/routes/history/index.tsx`](src/routes/history/index.tsx)
- [`src/components/history/WorkoutCalendar.tsx`](src/components/history/WorkoutCalendar.tsx)
- [`src/components/history/ProgressChart.tsx`](src/components/history/ProgressChart.tsx)
- **Use shadcn chart components** - beautiful, built-in solutions for data visualization

### 5. Exercises Browser (`/exercises`)

**Browse all exercises by pattern**:

- Tabs for each pattern
- List of exercises per pattern
- (Future: add custom exercises)

**Implementation**:

- [`src/routes/exercises/index.tsx`](src/routes/exercises/index.tsx)
- [`src/components/exercises/PatternTabs.tsx`](src/components/exercises/PatternTabs.tsx)

### 6. Mesocycle Management

**Build-up Logic** (for `wasPreviouslyTraining: false`):

- Weeks 1-2: 50% of target sets
- Weeks 3-4: 75% of target sets
- Weeks 5+: 100% of target sets
- Apply when generating workout templates

**Deload & Completion**:

- On mesocycle completion (week = durationWeeks):
  - Mark mesocycle as "completed"
  - Show modal: "Mesocycle complete! Start deload week?"
  - Create deload mesocycle (1 week, 40% volume)
  - After deload → prompt new mesocycle setup

**Implementation**:

- [`convex/mesocycles.ts`](convex/mesocycles.ts) - mutations: `completeMesocycle`, `startDeload`
- [`src/components/mesocycle/CompletionModal.tsx`](src/components/mesocycle/CompletionModal.tsx)

## Seed Data

**Patterns** (6):

```typescript
const patterns = [
  { name: "push", displayName: "Push", order: 1 },
  { name: "pull", displayName: "Pull", order: 2 },
  { name: "squat", displayName: "Squat", order: 3 },
  { name: "hinge", displayName: "Hinge", order: 4 },
  { name: "lunge", displayName: "Lunge", order: 5 },
  { name: "twist", displayName: "Twist", order: 6 },
];
```

**Exercises** (placeholder examples, 3-5 per pattern):

- Push: Bench Press, Incline Bench Press, Push-ups, Dumbbell Press, Pec Deck
- Pull: Pull-ups, Barbell Row, Lat Pulldown, Cable Row, Face Pulls
- Squat: Back Squat, Front Squat, Goblet Squat, Leg Press
- Hinge: Deadlift, Romanian Deadlift, Good Mornings, Hip Thrusts
- Lunge: Forward Lunge, Reverse Lunge, Bulgarian Split Squat, Walking Lunges
- Twist: Cable Woodchops, Russian Twists, Pallof Press

**Implementation**:

- [`convex/seed.ts`](convex/seed.ts) - seed script to populate patterns and exercises
- Run with: `npx convex run seed:seedPatterns`, `npx convex run seed:seedExercises`

## UI/UX Considerations

### Design Inspiration (Strong app):

- Clean, minimalist interface
- Large, tappable buttons for logging during workout
- Clear visual hierarchy
- Pattern-based color coding (consistent colors per pattern)
- Bottom navigation for main sections

### Key shadcn Components to Use:

- `Button` - primary actions
- `Tabs` - pattern switching, history views
- `Slider` - duration, rest time config
- `Select` - dropdowns for options
- `Switch` - toggles (training history)
- `Card` - workout sets, mesocycle cards
- `Chart` - progress charts, volume tracking (shadcn has beautiful chart components)
- Additional: `Badge`, `Progress`, `Dialog`, `Form`, `Checkbox` components

### Responsive Design:

- Mobile-first (primary use case)
- Touch-friendly tap targets (min 44×44px)
- Swipe gestures for exercise carousel
- Consider PWA setup for installation

## Implementation Order

### Phase 0: Tech Stack Setup

1. Set up Convex deployment and environment variables

   - Run `npx convex init` to configure `VITE_CONVEX_URL` and `CONVEX_DEPLOYMENT`
   - Start Convex dev server: `npx convex dev`

2. Configure Better Auth

   - Generate `BETTER_AUTH_SECRET`: `npx @better-auth/cli secret`
   - Set environment variables in `.env.local`

3. Verify all integrations are working (Convex provider, TanStack Query, auth)

### Phase 1: Foundation

1. Set up Convex schema ([`convex/schema.ts`](convex/schema.ts))
2. Create seed data for patterns and exercises ([`convex/seed.ts`](convex/seed.ts))
3. Set up authentication flow with Better Auth
4. Create basic routing structure

### Phase 2: Mesocycle Setup

1. Build mesocycle setup wizard with all 4 steps
2. Implement set distribution calculation logic
3. Create mesocycle dashboard view

### Phase 3: Workout Execution (Core Feature)

1. Workout template generation based on mesocycle config
2. Full-screen pattern-by-pattern flow with state management
3. Exercise carousel component with swipe functionality
4. Large start/stop button with set timer
5. Weight/reps inputs with last performance data
6. Rest timer with notifications
7. Pattern progression logic (locked during primary, choice during maintenance)
8. Auto-progression logic (8-12 rep range)
9. Workout completion and stats

### Phase 4: Progress Tracking

1. History page with workout list
2. Progress charts for exercises
3. Volume tracking graphs
4. Mesocycle progress indicators

### Phase 5: Polish & Advanced Features

1. Deload week automation
2. Build-up logic for new trainees
3. Mesocycle completion flow
4. UI refinements and animations
5. PWA setup (optional)

## Technical Decisions

**Why per-set exercise selection is powerful**:

- Maximum flexibility: user can vary exercises based on gym equipment availability, fatigue, or preference
- Still maintains pattern focus for balanced development
- Data richness: track which exercises are preferred, performance per exercise

**Auto-progression vs manual**:

- 8-12 rep range is research-backed for hypertrophy
- Automatic suggestions remove decision fatigue
- User still in control (can override suggested weight)

**Set distribution calculation**:

```typescript
// Example: 15 sets/week, 3 sessions/week, 1 primary pattern
// 15 ÷ 3 = 5 sets per session

// Example: 16 sets/week, 3 sessions/week → NOT ALLOWED
// System only offers 12, 15, 18 as options (divisible by 3)

// Example: 18 sets/week, 3 sessions/week, 2 primary patterns
// 18 ÷ 2 = 9 sets per pattern per week
// 9 ÷ 3 = 3 sets per pattern per session
```

**Build-up calculation**:

```typescript
// Example: Target 18 sets/week, wasPreviouslyTraining: false, 6-week mesocycle
// Week 1-2: 18 × 0.5 = 9 sets/week → 3 sets/session
// Week 3-4: 18 × 0.75 = 13.5 → round to 14 sets/week → 4-5 sets/session
// Week 5-6: 18 × 1.0 = 18 sets/week → 6 sets/session
```

## Convex Queries & Mutations Structure

**Mesocycles** ([`convex/mesocycles.ts`](convex/mesocycles.ts)):

- `query: getActiveMesocycle(userId)`
- `query: getMesocycleById(id)`
- `mutation: createMesocycle(config)`
- `mutation: completeMesocycle(id)`
- `mutation: startDeload(userId)`
- `query: calculateSetDistribution(mesocycleId, weekNumber)`

**Workouts** ([`convex/workouts.ts`](convex/workouts.ts)):

- `mutation: startWorkout(mesocycleId, userId)`
- `mutation: logSet(workoutId, setData)`
- `mutation: completeWorkout(workoutId)`
- `query: getActiveWorkout(userId)`
- `query: getWorkoutHistory(userId, limit)`
- `query: getCurrentWeekStats(mesocycleId, weekNumber)`

**Exercises** ([`convex/exercises.ts`](convex/exercises.ts)):

- `query: getExercisesByPattern(patternId)`
- `query: getAllPatterns()`
- `query: getExercise(id)`

**Progression** ([`convex/progression.ts`](convex/progression.ts)):

- `query: getSuggestedWeight(userId, exerciseId, patternId)`
- `query: getExerciseProgress(userId, exerciseId, timeRange)`
- `query: getPatternVolumeHistory(userId, patternId, weeks)`

## Key Design Principles & Updates

### COFVIR Framework (User thinks as little as possible)

The app controls for scientifically-backed training variables:

- **Choice**: User swipes to pick exercises they prefer
- **Order**: Primary patterns enforced first ("biggest rocks first") 
- **Frequency**: User sets during initial setup
- **Volume**: System ensures target sets are completed
- **Intensity**: 8-12 rep range keeps user in hypertrophy zone
- **Rest**: System manages rest periods between sets

**Philosophy**: "Here's what's important for gains, you handle exercise preference. Don't like an exercise? Just swipe it."

### Workout Flow: Pattern-by-Pattern Full-Screen Experience

1. **One pattern at a time, full screen** - minimize cognitive load
2. **Locked flow during primary patterns** - enforce "biggest rocks first"
3. **Free choice for maintenance patterns** - flexibility after main work
4. **Large touch targets** - easy to use with sweaty hands in gym
5. **Always show last performance** - build confidence, track progress
6. **Automatic rest timer** - no thinking required
7. **"Conclude Session" always available** - flexibility to end early

### Implementation Updates

1. **Pattern ordering**: Primary patterns performed first when user is fresh
2. **Removed `exercise.isDefault`**: All seed exercises are system-provided
3. **Reactive session duration**: Live calculation as user adjusts sets/week
4. **Consolidated wizard steps**: Training history + volume selection combined
5. **Simple pattern list**: Checkboxes instead of fancy cards
6. **Research info placement**: Shown at relevant steps with citations
7. **Sessions range**: 2-7 sessions/week
8. **Simplified distribution display**: Single template view
9. **Rest time tracking**: Configurable (default 3 min), set duration tracked for learning
10. **shadcn charts**: Beautiful built-in chart components for progress

## Next Steps

**Approved**: Using placeholder exercises with extensible schema

**Phase 0 (Immediate)**: Set up tech stack requirements per README:

- Initialize Convex deployment
- Configure environment variables
- Set up Better Auth
- Verify all integrations work

Then proceed with Phase 1 implementation.