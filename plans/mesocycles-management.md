---
name: Mesocycles Management Page
overview: Transform the single mesocycle setup into a comprehensive mesocycles management page. Mesocycles are created with just duration and patterns, then activated separately with session/volume/rest configuration. Active meso is fixed at top, others are rearrangeable.
todos:
  - id: update-schema
    content: Update mesocycles schema to support 'planned' status and separate creation from activation
    status: pending
  - id: create-mesocycles-route
    content: Create new /mesocycles route with list view (empty, single, multiple states per sketch)
    status: pending
  - id: create-simple-wizard
    content: Create simplified mesocycle creation wizard (only duration + patterns, 2 steps)
    status: pending
  - id: create-activation-dialog
    content: Create mesocycle activation dialog (sessions/week, sets/week, rest time with previous/default)
    status: pending
  - id: add-drag-drop
    content: Add drag-and-drop reordering for inactive mesocycles (active is fixed at top)
    status: pending
  - id: add-completion-time
    content: Display estimated completion time for full macrocycle (sum of all mesocycle durations)
    status: pending
  - id: update-header
    content: Update Header.tsx navigation from 'Setup Mesocycle' to 'Mesocycles' pointing to /mesocycles
    status: pending
  - id: update-route-refs
    content: Update all /mesocycle/setup references throughout codebase to /mesocycles
    status: pending
  - id: update-backend
    content: Update backend mutations to support planned mesocycles and separate activation flow
    status: pending
isProject: false
---

# Plan: Transform "Setup Mesocycle" to "Mesocycles" Management Page

## Overview

Change the navigation from "Setup Mesocycle" to "Mesocycles" and create a management page based on the provided sketch. Key changes:

- **Simplified Creation**: Mesocycles are created with only duration and patterns (2 steps)
- **Separate Activation**: Mesocycles must be activated/started separately, configuring sessions/week, sets/week, and rest time at that point
- **Rest Time Default**: Rest time defaults to previous mesocycle's rest time, or 3 minutes if no previous
- **Fixed Active**: Active mesocycle is fixed at the top, inactive mesocycles are rearrangeable via drag-and-drop
- **Macrocycle Completion**: Estimated completion time for the full macrocycle (sum of all mesocycle durations) is displayed at the top of the page

## Changes Required

### 1. Schema Updates

- **File**: `convex/schema.ts`
- Update `mesocycles` table to support planned mesocycles:
- `status`: Currently supports "active", "completed", "deload" - add "planned" as valid status
- `order`: Add `v.optional(v.number())` field for drag-and-drop reordering of inactive mesocycles
- Make activation fields optional (set during activation, not creation):
  - `startDate`: `v.number()` → `v.optional(v.number())`
  - `targetSetsPerWeek`: `v.number()` → `v.optional(v.number())`
  - `sessionsPerWeek`: `v.number()` → `v.optional(v.number())`
  - `wasPreviouslyTraining`: `v.boolean()` → `v.optional(v.boolean())`
  - `restTimeMinutes`: `v.number()` → `v.optional(v.number())`
  - `currentWeek`: `v.number()` → `v.optional(v.number())` (only relevant when active)

### 2. Backend Functions

- **File**: `convex/mesocycles.ts`
- **New Function**: `createMesocycle` - Simplified version that only requires:
- `userId`
- `durationWeeks`
- `primaryPatterns`
- Returns mesocycle with status "planned" (not "active")
- **New Function**: `activateMesocycle` - Activates a planned mesocycle:
- Takes `mesocycleId`, `sessionsPerWeek`, `targetSetsPerWeek`, `restTimeMinutes`, `wasPreviouslyTraining`
- Sets `startDate` to current time
- Changes status from "planned" to "active"
- Deactivates any existing active mesocycle
- **New Function**: `reorderMesocycles` - Updates order field for inactive mesocycles
- **New Function**: `getPreviousMesocycleRestTime` - Gets rest time from most recent completed mesocycle (or returns 3)

### 3. Create New Mesocycles Route

- **File**: `src/routes/mesocycles/index.tsx` (new)
- Create route at `/mesocycles` with three states matching the sketch:
- **Empty State**: Dashed box with "Create your first meso" and CTA button
- **Single Meso State**: Active meso card (if active) + "Create new meso" section below
- **Multiple Mesos State**: Active meso fixed at top + list of inactive mesos (rearrangeable) + "Create new meso" at bottom
- **Macrocycle Summary**: Display estimated completion time for full macrocycle at top (sum of all mesocycle durations)

#### MesocycleCard Component

- **File**: `src/components/mesocycle/MesocycleCard.tsx` (new)
- Display mesocycle info:
- Pattern names (e.g., "Push and Pull meso")
- Status badge (Active, Planned, Completed)
- Duration (e.g., "6 weeks")
- Click to expand/view details
- Visual distinction for active vs inactive
- Note: Individual mesocycle cards show duration/status, but macrocycle completion time is shown at page level

### 4. Simplified Creation Wizard

- **File**: `src/components/mesocycle/CreateMesocycleDialog.tsx` (new)
- **2-Step Wizard**:
- **Step 1**: Duration selection (4, 6, 8 weeks radio buttons)
- **Step 2**: Primary pattern selection (1-2 patterns, grid of pattern cards)
- Opens as a Dialog/Modal from the mesocycles page
- On submit, creates mesocycle with status "planned"
- Does NOT start the mesocycle

### 5. Activation Dialog

- **File**: `src/components/mesocycle/ActivateMesocycleDialog.tsx` (new)
- Opens when user clicks "Start" or "Activate" on a planned mesocycle
- **Configuration Steps**:
- **Sessions Per Week**: 2-7 selector (same as current wizard step 3)
- **Sets Per Primary Pattern Per Week**: Radio buttons filtered by sessions/week divisibility (same as current wizard step 4)
- **Rest Time**: Input field with default = previous mesocycle's rest time (or 3 if none)
- **Training History**: Radio buttons (Yes/No for wasPreviouslyTraining)
- Shows reactive session duration calculation
- On submit, calls `activateMesocycle` mutation

### 6. Drag-and-Drop Reordering

- **Library**: Install `@dnd-kit/core` and `@dnd-kit/sortable` (or similar)
- **File**: `src/components/mesocycle/MesocycleList.tsx` (new)
- Implement drag-and-drop for inactive mesocycles only
- Active mesocycle is fixed at top (not draggable)
- On reorder, call `reorderMesocycles` mutation to update order field
- Visual feedback during drag (opacity, shadow)

### 7. Estimated Macrocycle Completion Time

- **Calculate full macrocycle completion**: Sum of all mesocycle durations from the active mesocycle's start date
- If active mesocycle exists: `activeStartDate + (activeDuration + sum of all planned durations) * 7 * 24 * 60 * 60 * 1000`
- If no active, but planned exist: `firstPlannedStartDate + (sum of all planned durations) * 7 * 24 * 60 * 60 * 1000`
- **Display location**: Show at top of mesocycles page (header area or summary card)
- **Format**: "Macrocycle completes: Jan 15, 2026" or "in 12 weeks"
- **Update dynamically**: Recalculates when mesocycles are added, removed, or reordered
- Individual mesocycle cards still show their own duration/status, but the macrocycle completion is the main metric

### 8. Update Header Navigation

- **File**: `src/components/Header.tsx`
- Change navigation link:
- Label: "Setup Mesocycle" → "Mesocycles"
- Route: `/mesocycle/setup` → `/mesocycles`
- Keep icon: `SquareFunction` (or consider `Layers` for multiple mesocycles)

### 9. Update All Route References

- **File**: `src/routes/index.tsx` (3 references)
- **File**: `src/routes/workout/index.tsx` (2 references)
- Change all `<Link to="/mesocycle/setup">` to `<Link to="/mesocycles">`
- Update button text from "Set Up Mesocycle" to "Mesocycles" or "Create Mesocycle"

### 10. Route Handling

- **File**: `src/routes/mesocycle/setup.tsx`
- Option 1: Redirect to `/mesocycles` with a query param to open create dialog
- Option 2: Keep route but show simplified wizard that redirects to `/mesocycles` after creation
- Option 3: Deprecate and redirect entirely

### 11. UI/UX Considerations

- Use shadcn components: Card, Dialog, Badge, Button, RadioGroup
- Match the sketch design:
- Dashed boxes for empty/create states
- Clear visual hierarchy (active fixed at top)
- Drag handles or visual indicators for reorderable items
- Responsive design for mobile (touch-friendly drag)
- Smooth transitions when opening/closing dialogs
- Loading states during activation

## Implementation Order

1. Update schema to support planned status and nullable activation fields
2. Update backend mutations (createMesocycle simplified, add activateMesocycle)
3. Create simplified creation wizard component (2 steps: duration + patterns)
4. Create activation dialog component
5. Create mesocycles route with empty/single/multiple states and macrocycle completion time display
6. Create MesocycleCard component
7. Add drag-and-drop reordering for inactive mesocycles
8. Update Header navigation
9. Update all route references
10. Handle backward compatibility for old route

## Files to Create

- `src/routes/mesocycles/index.tsx` - **NEW** - Main management page
- `src/components/mesocycle/CreateMesocycleDialog.tsx` - **NEW** - Simplified 2-step creation wizard
- `src/components/mesocycle/ActivateMesocycleDialog.tsx` - **NEW** - Activation configuration dialog
- `src/components/mesocycle/MesocycleCard.tsx` - **NEW** - Mesocycle card component
- `src/components/mesocycle/MesocycleList.tsx` - **NEW** - List with drag-and-drop

## Files to Modify

- `convex/schema.ts` - Add "planned" status, order field, nullable activation fields
- `convex/mesocycles.ts` - Simplify createMesocycle, add activateMesocycle, reorderMesocycles
- `src/components/Header.tsx` - Update navigation
- `src/routes/index.tsx` - Update links (3 places)
- `src/routes/workout/index.tsx` - Update links (2 places)
- `src/routes/mesocycle/setup.tsx` - Redirect or deprecate

## Dependencies

- Install drag-and-drop library: `@dnd-kit/core` and `@dnd-kit/sortable` (or `react-beautiful-dnd`)

## Notes

- **Key Change**: Creation and activation are now separate flows
- Creation is simple (duration + patterns only)
- Activation configures the training parameters (sessions, sets, rest)
- Rest time defaults intelligently (previous meso or 3)
- Active mesocycle is always at top, others are rearrangeable
- Macrocycle completion time (sum of all mesocycle durations) displayed at page level to help users plan their full training cycle
