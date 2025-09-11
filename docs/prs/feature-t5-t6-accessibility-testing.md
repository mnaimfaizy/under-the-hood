# PR: Task 5 (Accessibility & Responsiveness) and Task 6 (Testing & Quality)

## Summary

Implements Task 5 and Task 6 for the Kid Mode MVP. Adds accessible controls and semantics, respects reduced-motion preferences, and introduces a Playwright E2E smoke test alongside existing unit tests. Visual behavior remains deterministic and driven by the simulation engine.

Branch: `feature/t5-t6-accessibility-testing`
Open PR: https://github.com/mnaimfaizy/under-the-hood/pull/new/feature/t5-t6-accessibility-testing

## What’s included

### T5 — Accessibility & Responsiveness

- Keyboard
  - Space/Enter toggles Play/Pause; ArrowRight steps (existing behavior validated)
- ARIA & semantics
  - `Stage.svelte`: `<svg>` labeled with `role="img"` and descriptive `aria-label`
  - `App.svelte`: buttons have explicit `aria-label`s, Play keeps `aria-pressed`; narration uses `aria-live="polite"`
  - `Token.svelte`: token groups carry `role="img"` with `aria-label`
- Focus & contrast
  - Tailwind focus rings on primary controls for visible focus
- Reduced motion
  - `Token.svelte` detects `prefers-reduced-motion`; when enabled, replaces GSAP tweens with instantaneous `gsap.set`

### T6 — Testing & Quality

- Unit tests (Vitest)
  - Existing tests remain green: `src/lib/sim/engine.test.ts`, `src/lib/sim/scenarios.test.ts`
  - `vitest.config.ts` excludes E2E files from unit runs
- E2E (Playwright)
  - `playwright.config.ts` spins up Vite dev server and runs Chromium tests
  - `tests/e2e/kid-mode.spec.ts`: loads app → selects "Timer vs Promise" → Play → asserts narration mentions Promises (microtasks) before Timers (macrotasks) → ends
- Scripts in `package.json`
  - `test:unit` → Vitest; `test:e2e` → Playwright; `test:all` → both
- Tooling hygiene
  - `.gitignore` updated to ignore Playwright/Vitest artifacts and IDE folders

## Acceptance criteria

- T5
  - Space/Enter (Play/Pause) and ArrowRight (Step) — Done
  - Reduced motion mode disables animations — Done
  - High-contrast/focus rings and ARIA labels — Done
- T6
  - Unit tests verify runner ordering — Pass
  - E2E smoke verifies Kid Mode flow — Pass

## How to verify

- Install: `npm install` (first time: `npx playwright install`)
- Unit tests: `npm run test:unit`
- E2E tests: `npm run test:e2e`
- Build: `npm run build`
- Dev: `npm run dev` and open the printed URL

## Notes / follow-ups

- Consider CI (Task 8) to run Vitest + Playwright on push/PR
- Add Svelte ESLint/Prettier (Task 8) for formatting
- Expand E2E to other scenarios and keyboard interactions
- Optional: discrete fades for reduced-motion users on stage transitions
