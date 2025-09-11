# PR: Task 7 (Pro Mode)

## Summary

Implements Task 7 by introducing a Pro Mode that augments the Kid Mode UI with additional technical panels and instrumentation without changing core behavior. Users can toggle Pro Mode on/off. All visuals remain deterministic and driven by the simulation engine.

Branch: `feature/t7-pro-mode`
Open PR: https://github.com/mnaimfaizy/under-the-hood/pull/new/feature/t7-pro-mode

## What’s included

- Pro Mode toggle
  - Header switch toggles between Kid and Pro modes (Kid Mode by default)
  - Clears logs when toggling back to Kid Mode
- Stage enhancements (`src/lib/Stage.svelte`)
  - Accepts `mode` prop
  - Pro-only panels:
    - Engine Pipeline: Parser → Ignition → TurboFan
    - Heap/GC mini-scene with a small “cleaning robot” icon
  - Added `<title>` tooltips for Call Stack, Web APIs, Micro/Macro queues, Event Loop, and Pro panels
- Logs panel (`src/App.svelte`)
  - Simple, scrollable event log when Pro Mode is enabled
  - Logs notable events: token moves, microtask drain, macrotask run, sync steps, scenario end
  - `data-testid="logs"` for future E2E coverage
- Accessibility
  - Stage `<svg>` aria-label adapts by mode
  - Tooltips via `<title>` on SVG shapes (assistive hover hints)
- Repo hygiene
  - `.gitignore` includes test/build artifacts and IDE folders

## Acceptance criteria

- Pro Mode renders extra panels (Engine pipeline, Heap/GC) — Done
- Kid Mode unchanged (default experience + existing flows) — Done

## How to verify

- Dev: `npm run dev`
  - Toggle Pro Mode in the header
  - Observe Engine Pipeline and Heap/GC panels on the stage
  - Press Play; confirm logs populate in the Pro Mode “Logs” panel
- Tests
  - Unit: `npm run test:unit` (runner + scenarios stay green)
  - E2E: `npm run test:e2e` (Kid Mode smoke remains passing)
- Build: `npm run build` (ensures Svelte/Vite prod build succeeds)

## Notes / Follow-ups

- Optional Monaco editor + sandbox (deferred; out of scope for this PR)
- Add a Playwright test for Pro Mode (toggle on → play → logs appear)
- Consider minor ARIA refinements for Pro panels (e.g., descriptions)
- Proceed to Task 8 (Tooling & CI): ESLint/Prettier for Svelte and GitHub Actions
