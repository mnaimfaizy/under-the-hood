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

Owner: Complete ✅ | Effort: Medium | Depends on: None

### T1.1 Define core types

**[✔️ Complete]** Token shape: `{ id, kind: 'sync'|'micro'|'macro'|'webapi', label, color }`
**[✔️ Complete]** Events: `push_stack`, `pop_stack`, `offload_to_webapi`, `enqueue_micro`, `enqueue_macro`, `loop_cycle_start`, `loop_drain_micro`, `loop_run_macro`.
**[✔️ Complete]** Acceptance: Types exported from `src/lib/sim/types.ts` with JSDoc.

### T1.2 Event-loop runner

**[✔️ Complete]** Implement deterministic cycle: Sync → DrainMicrotasks → RunOneMacrotask → Repeat.
**[✔️ Complete]** Drive with a virtual clock (requestAnimationFrame or GSAP timeline time).
**[✔️ Complete]** API contract:

- `createRunner({ onEvent, speed }): { play(), pause(), step(), reset(), load(scenario) }`
  **[✔️ Complete]** Acceptance: Unit tests verifying microtasks drain before macrotasks.

### T1.3 Scenario DSL

**[✔️ Complete]** Create `src/lib/sim/scenarios.ts` with small helpers:

- `scenarioTimerVsPromise()` emits a sequence when played.
- `scenarioTwoLogs()` and `scenarioFetchRobot()`.
  **[✔️ Complete]** Acceptance: Scenarios emit expected events without UI.

---

## T2 — Visual Layer Integration

Owner: TBD | Effort: Medium | Depends on: T1

### T2 — Visual Layer Integration

Owner: Complete ✅ | Effort: Medium | Depends on: T1

#### T2.1 Block anchors and layout map

**[✔️ Complete]** Anchor points exposed in `Stage.svelte` via mapping and `getAnchor(name)` function.

#### T2.2 Token renderer

**[✔️ Complete]** `Token.svelte` renders tokens with icon, label, and GSAP movement.

#### T2.3 Event → Motion mapper

**[✔️ Complete]** Simulation events mapped to GSAP timeline actions; master timeline and controls scaffolded.

---

## T3 — Controls & Narration

Owner: Complete ✅ | Effort: Small | Depends on: T1, T2

### T3.1 Wire controls to runner

**[✔️ Complete]** Hook Play/Pause/Restart/Speed to runner API in `App.svelte`.
**[✔️ Complete]** Acceptance: Buttons control the animation deterministically.

### T3.2 Narration script

**[✔️ Complete]** Map each major step to a Kid-friendly one-liner.
**[✔️ Complete]** Aria-live updates; optional sound cue (muted by default).
**[✔️ Complete]** Acceptance: Narration changes on each step; accessible.

---

## T4 — Kid Mode Scenarios (MVP)

Owner: Complete ✅ | Effort: Small-Medium | Depends on: T1–T3

**[✔️ Complete]** Scenario 1: Two Logs (sync order)
**[✔️ Complete]** Scenario 2: Timer vs Promise (microtask priority)
**[✔️ Complete]** Scenario 3: Fetch Robot (offload → enqueue later)
**[✔️ Complete]** Acceptance: Each scenario selectable and plays end-to-end correctly.

---

## T5 — Accessibility & Responsiveness

Owner: Complete ✅ | Effort: Small | Depends on: T2–T4

**[✔️ Complete]** Keyboard: Space/Enter (Play/Pause), ArrowRight (Step)

**[✔️ Complete]** prefers-reduced-motion: disable motion on tokens (instant updates; no tween)

**[✔️ Complete]** High-contrast/focus: visible focus rings on primary controls; icons + shapes (not color-only)

**[✔️ Complete]** Acceptance: Manually verified keyboard controls and reduced-motion behavior

---

## T6 — Testing & Quality

Owner: Complete ✅ | Effort: Small-Medium | Depends on: T1–T4

**[✔️ Complete]** Vitest unit tests for the runner (micro vs macro ordering) remain green

**[✔️ Complete]** Playwright smoke test: load scenario → play → expect narration order (Promises before Timers) and scenario end

**[✔️ Complete]** Acceptance: Unit + E2E tests pass locally on Node ≥ 20.19; CI integration tracked in T8

---

## T7 — Pro Mode (Post-MVP)

Owner: Complete ✅ | Effort: Medium | Depends on: T1–T6

- Toggle to reveal Engine pipeline (Parser → Ignition → TurboFan)
- Heap/GC mini-scene (cleaning robot)
- Logs panel & simple tooltips
- Optional Monaco editor (safe subset) and sandbox
- Acceptance: Pro Mode renders extra panels; Kid Mode unchanged.

---

## T8 — Tooling & CI

Owner: Complete ✅ | Effort: Small | Depends on: None

- ESLint/Prettier setup for Svelte — Complete
- GitHub Actions: build + tests on push — Complete
- Conventional commits or Husky pre-commit hook (optional) — Husky pre-commit added
- Acceptance: CI badge in README; green build — Met

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
