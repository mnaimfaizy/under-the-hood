# Tasks Handoff — Under the Hood: JavaScript Visualizer

This document lists actionable tasks and subtasks for the next agent to continue from the current scaffold.

## Current status (handoff snapshot)
- Stack: Svelte + Vite, Tailwind, GSAP, XState installed.
- App shell: `src/App.svelte` with controls and narration placeholder.
- Visual stage: `src/lib/Stage.svelte` with SVG blocks (Call Stack, Web APIs, Micro/Macro queues, Event Loop).
- Docs: `docs/plan.md`, research report, and this handoff.
- Node: Local Node is v20.15.0; Vite expects >=20.19. Please upgrade.

## Environment prerequisites
- Node.js >= 20.19 (or 22.12+)
- npm >= 10
- Optional: GitHub CLI (`gh`) for automated repo creation and push

---

## T1 — Simulation Engine (MVP)
Owner: TBD | Effort: Medium | Depends on: None

### T1.1 Define core types
- Token shape: `{ id, kind: 'sync'|'micro'|'macro'|'webapi', label, color }`
- Events: `push_stack`, `pop_stack`, `offload_to_webapi`, `enqueue_micro`, `enqueue_macro`, `loop_cycle_start`, `loop_drain_micro`, `loop_run_macro`.
- Acceptance: Types exported from `src/lib/sim/types.ts` with JSDoc.

### T1.2 Event-loop runner
- Implement deterministic cycle: Sync → DrainMicrotasks → RunOneMacrotask → Repeat.
- Drive with a virtual clock (requestAnimationFrame or GSAP timeline time).
- API contract:
  - `createRunner({ onEvent, speed }): { play(), pause(), step(), reset(), load(scenario) }`
- Acceptance: Unit tests verifying microtasks drain before macrotasks.

### T1.3 Scenario DSL
- Create `src/lib/sim/scenarios.ts` with small helpers:
  - `scenarioTimerVsPromise()` emits a sequence when played.
  - `scenarioTwoLogs()` and `scenarioFetchRobot()`.
- Acceptance: Scenarios emit expected events without UI.

---

## T2 — Visual Layer Integration
Owner: TBD | Effort: Medium | Depends on: T1

### T2.1 Block anchors and layout map
- Expose anchor points for Stage blocks (from/to positions) in `Stage.svelte` via a mapping export or store.
- Acceptance: A function `getAnchor(name)` returns SVG coords for blocks.

### T2.2 Token renderer
- `src/lib/Token.svelte`: rounded rectangle + icon (⏱ timer, 🔗 promise, 🌐 fetch) + label.
- Accepts `x,y` and transitions via GSAP.
- Acceptance: Token can move between two anchors smoothly.

### T2.3 Event → Motion mapper
- Map simulation events to GSAP timeline actions.
- Keep a single master timeline and expose play/pause/step.
- Acceptance: “Timer vs Promise” visually shows microtasks draining before the timeout runs.

---

## T3 — Controls & Narration
Owner: TBD | Effort: Small | Depends on: T1, T2

### T3.1 Wire controls to runner
- Hook Play/Pause/Restart/Speed to runner API in `App.svelte`.
- Acceptance: Buttons control the animation deterministically.

### T3.2 Narration script
- Map each major step to a Kid-friendly one-liner.
- Aria-live updates; optional sound cue (muted by default).
- Acceptance: Narration changes on each step; accessible.

---

## T4 — Kid Mode Scenarios (MVP)
Owner: TBD | Effort: Small-Medium | Depends on: T1–T3

- Scenario 1: Two Logs (sync order)
- Scenario 2: Timer vs Promise (microtask priority)
- Scenario 3: Fetch Robot (offload → enqueue later)
- Acceptance: Each scenario selectable and plays end-to-end correctly.

---

## T5 — Accessibility & Responsiveness
Owner: TBD | Effort: Small | Depends on: T2–T4

- Keyboard: Space/Enter (Play/Pause), ArrowRight (Step)
- prefers-reduced-motion: switch to discrete fades
- High-contrast theme; icons + shapes (not color-only)
- Acceptance: Manual QA on keyboard and reduced motion.

---

## T6 — Testing & Quality
Owner: TBD | Effort: Small-Medium | Depends on: T1–T4

- Vitest unit tests for the runner (micro vs macro ordering)
- Playwright smoke test: load scenario → play → expect visual token order
- Acceptance: CI passes on Node 20.19+.

---

## T7 — Pro Mode (Post-MVP)
Owner: TBD | Effort: Medium | Depends on: T1–T6

- Toggle to reveal Engine pipeline (Parser → Ignition → TurboFan)
- Heap/GC mini-scene (cleaning robot)
- Logs panel & simple tooltips
- Optional Monaco editor (safe subset) and sandbox
- Acceptance: Pro Mode renders extra panels; Kid Mode unchanged.

---

## T8 — Tooling & CI
Owner: TBD | Effort: Small | Depends on: None

- ESLint/Prettier setup for Svelte
- GitHub Actions: build + tests on push
- Conventional commits or Husky pre-commit hook (optional)
- Acceptance: CI badge in README; green build

---

## T9 — Content & Docs
Owner: TBD | Effort: Small | Depends on: MVP

- Update README with how-to-run and scenarios
- Short glossary (Kid vs Pro)
- LICENSE (MIT suggested)
- Acceptance: Docs reviewed; repo ready for public.

---

## How to run locally (after Node upgrade)
- Install: `npm install`
- Dev: `npm run dev` (open printed localhost URL)
- Build: `npm run build`

## Known risks / notes
- Node mismatch (upgrade required).
- Performance: keep animations transform-only; avoid large DOM.
- Accuracy vs simplicity: Kid Mode first, Pro Mode later with nuance.
