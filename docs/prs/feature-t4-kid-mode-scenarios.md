# PR: Task 3 (Controls & Narration), Task 4 (Kid Mode Scenarios), and CI Tests

## Summary

Implements Task 3 (Controls & Narration) and Task 4 (Kid Mode Scenarios), and adds a CI test workflow. The app now offers deterministic controls, accessible narration, selectable scenarios, and automated tests in CI.

## What’s included

- T3 — Controls & Narration
  - Wired Play/Pause/Restart/Speed to the runner in `App.svelte`
  - Keyboard: Space/Enter toggle play/pause, ArrowRight step
  - Aria-live narration with kid-friendly messages
  - Optional sound cue (muted by default)

- T4 — Kid Mode Scenarios (MVP)
  - Three selectable scenarios via dropdown:
    - Two Logs (sync order)
    - Timer vs Promise (microtask priority)
    - Fetch Robot (offload → microtask → macrotask)
  - Event → motion mapping in `Stage.svelte`
  - Token rendering and movement via `Token.svelte` + GSAP

- Testing & CI
  - Unit tests verifying event ordering and scenario completion
    - `src/lib/sim/engine.test.ts`
    - `src/lib/sim/scenarios.test.ts` (new)
  - GitHub Actions: `.github/workflows/test.yml`
    - Runs Vitest on push and PR for Node 20.19.0 and 22.x
    - Uses npm cache for faster installs

- Docs
  - `docs/tasks.md`: Marked T3 and T4 as Complete with acceptance criteria

## Acceptance criteria

- T3:
  - Buttons control the animation deterministically
  - Narration updates per step; accessible via `aria-live`

- T4:
  - All three scenarios are selectable and play end-to-end
  - Tests confirm expected sequencing and `scenario-end`

## How to verify

- Tests: `npm test`
- Build: `npm run build`
- Dev: `npm run dev`
  - Select each scenario and click Play
  - Confirm narration updates
  - Keyboard: Space/Enter toggles play/pause, ArrowRight steps
  - Optional: enable Sound for a tick per event

## CI

- Workflow “Test” runs Vitest on push/PR (Node 20.19.0 & 22.x)
- Ensures green tests before merge

## Notes / Follow-ups

- Recommend T5/T6 next:
  - prefers-reduced-motion variants
  - High-contrast styling and focus outlines
  - Playwright smoke test for visual order
  - ESLint/Prettier setup for Svelte
- Engines in `package.json`: Node >= 20.19.0, npm >= 10