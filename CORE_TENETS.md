# Core Tenets - Training Tracker App

These are the fundamental principles and design decisions that guide the entire application.

## 1. COFVIR Framework - "Make the user think as little as possible"

The app controls for scientifically-backed training variables, leaving only exercise choice to the user:

- **C**hoice: User swipes to pick exercise (their preference)
- **O**rder: System enforces primary patterns first ("biggest rocks first")
- **F**requency: User sets during initial setup
- **V**olume: System ensures target sets are completed
- **I**ntensity: 8-12 rep range keeps user in hypertrophy zone
- **R**est: System manages rest periods between sets

**Philosophy**: "Here's what's important for gains, you handle exercise preference. Don't like an exercise? Just swipe it."

## 2. Pattern-Based Training (Not Exercise-Based)

- **Sets are tied to patterns, not exercises**
- User can select different exercises for each set of the same pattern
- Maximum flexibility: vary exercises based on gym equipment, fatigue, or preference
- Still maintains pattern focus for balanced development
- Example: Push pattern with 5 sets → could be 3 sets bench, 1 set pushups, 1 set dips

## 3. Auto-Progression is CORE (Not Optional)

**This is a fundamental feature, not an enhancement.**

- Automatically suggests weight changes based on 8-12 rep range
- If reps ≥ 12 → suggest weight increase (+2.5kg)
- If reps < 8 → suggest weight decrease (-2.5kg)
- If 8-12 → maintain weight (sweet spot)
- Removes decision fatigue
- Keeps users progressing and in optimal training zone
- System automatically adjusts suggested weight for that specific exercise

## 4. "Biggest Rocks First" - Primary Patterns Come First

- Primary patterns (user's focus) are performed first when user is fresh
- System locks user into primary pattern sequence (can't skip to maintenance patterns)
- After primary patterns complete, user can choose maintenance patterns
- Ensures focus work gets done when energy is highest

## 5. Full-Screen Pattern-by-Pattern Experience

- One pattern at a time, full screen
- Minimizes cognitive load
- Clear progress indicator: "Push - Set 3 of 6"
- Large touch targets for gym use (sweaty hands)
- Pattern completion clearly indicated

## 6. Reactive Configuration with User Feedback

- Session duration calculated reactively as user adjusts parameters
- User can adjust sets/week up or down to fit their schedule
- System shows exactly what the session will look like before confirming
- Example: "17 sets/session = 85 min" → user can reduce if too long

## 7. Intelligent Set Distribution

- Target sets/week must be divisible by sessions/week (no odd distributions)
- System only shows valid options (e.g., 3 sessions/week → 12, 15, 18 sets/week)
- Sets distributed evenly across sessions
- Build-up logic for new trainees: Weeks 1-2 (50%), Weeks 3-4 (75%), Weeks 5+ (100%)

## 8. Per-Set Exercise Selection (Not Per-Workout)

- Each set can use a different exercise within the pattern
- Data persisted: "push - 1x bench 9x60kg, 1x pushups, 1x pec deck 12x50kg"
- Swipeable carousel for easy selection
- Remembers last used exercise as default

## 9. Always Show Last Performance

- Builds confidence
- Tracks progress
- Shows "Last: 60kg, 10 reps" for quick reference
- Helps user make informed decisions

## 10. Automatic Rest Timer Management

- Rest timer triggers automatically after set completion
- Countdown display with notifications
- System manages timing, user doesn't think about it
- Configurable rest time (default 3 min) based on research

## 11. Research-Backed Defaults

- 10-20 sets/week optimal range for hypertrophy (with citations)
- 8-12 rep range for hypertrophy
- 2-3 minutes rest optimal for muscle gains
- 6-week mesocycle default (configurable)

## 12. Minimal Cognitive Load During Workouts

- Full-screen focus on current pattern
- Large, easy-to-tap buttons
- Automatic progression suggestions
- Clear visual feedback
- "Conclude Session" always available (flexibility)

## 13. Data-Driven Learning

- System tracks actual set durations
- Improves session duration estimates over time
- Tracks progression patterns
- Enables better future recommendations

## 14. Deload Automation

- System detects mesocycle completion
- Automatically suggests deload week (40% volume)
- Guides user through recovery before next mesocycle

## 15. Movement Pattern Focus

- 6 patterns: Push, Pull, Squat, Hinge, Lunge, Twist
- User selects 1-2 primary patterns per mesocycle
- All non-primary patterns get 1 set/session for maintenance
- Ensures balanced development

## 16. Diagnostic Flow Onboarding

- Discover a person's 1RM (one-rep max) to establish optimal hypertrophy parameters for intensity
- Enables precise weight recommendations based on individual strength levels
- Ensures users start with appropriate training loads for the 8-12 rep range
- Foundation for accurate auto-progression system

---

## Summary

The app's core value proposition: **"Here's what's important for my gains, you handle the rest"**

The system controls for scientifically-backed training variables (COFVIR), leaving only exercise choice to the user. This removes decision fatigue while ensuring optimal training outcomes. Auto-progression, pattern-based training, and intelligent set distribution work together to keep users progressing without overthinking.
