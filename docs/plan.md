# Project Plan: Under the Hood — JavaScript Visualizer

This plan turns the concept into a concrete roadmap with tasks, subtasks, and milestones. It starts with a kid-friendly MVP and leaves room for deeper modes.

## MVP Scope (Weeks 1–4)

1) Foundation & Setup
- Choose stack: Svelte + Vite, Tailwind CSS, SVG visuals, GSAP for animation timelines, XState for state machines.
- Initialize repo, package manager, lint/format, CI (optional).
- Baseline app shell and routing.

2) Visual Stage & Core Blocks (Kid Mode first)
- SVG stage with layout grid.
- Blocks: Call Stack, Web APIs, Microtask Queue, Macrotask Queue, Event Loop.
- Visual tokens and color/icon system.

3) Simulation Engine
- Deterministic event-loop simulator with a virtual clock.
- Steps: run sync → drain microtasks → run one macrotask → repeat.
- Scenario DSL: safe preset scripts emit simulation events.

4) Controls & Narration
- Play/Pause, Step, Restart, Speed slider.
- Narration bar (Kid copy) + captions.
- Reduced motion support toggles.

5) Scenarios (Kid Mode)
- Two logs (sync order).
- Timer vs Promise (microtask priority).
- Fetch robot (web API offload + callback enqueue).

6) Accessibility & Responsiveness
- High-contrast theme, keyboard nav, ARIA labels.
- Mobile layout (stacked panels).

## Post-MVP (Weeks 5–6)

7) Pro Mode
- Toggle to reveal Engine pipeline (Parser → Ignition → TurboFan), Heap/GC (light).
- Technical tooltips and logs panel.
- Optional Monaco editor (sandboxed subset).

8) Advanced Scenarios
- Microtask chains (starvation demo).
- Nested timeouts (FIFO order).
- Async/await mapping to microtasks.
- DOM event handler enqueue.

9) Polish & Testing
- Vitest for simulation.
- Playwright for user flows (press play, expect outcome order).
- Performance pass.

---

## Work Breakdown Structure (WBS)

A. Project Setup
- A1: Initialize Svelte project with Vite
- A2: Tailwind CSS setup
- A3: Linting/Prettier
- A4: Base theme & design tokens

B. Core Architecture
- B1: Route scaffold (home and learn page)
- B2: Global state with XState: AppMachine (Idle/Running/Paused)
- B3: EventLoopMachine (Sync/DrainMicrotasks/RunMacrotask)
- B4: Simulation clock (play/pause/step)

C. Visual Layer
- C1: Stage.svelte (SVG canvas and layout)
- C2: Block components: Stack, WebAPIs, MicroQueue, MacroQueue, EventLoop
- C3: Token renderer and Motion helpers (GSAP timeline)
- C4: Color, icons, and shapes (non-color cues)

D. Simulation & Scenarios
- D1: Scenario DSL (declarative steps)
- D2: Scenario runner (emit events to visuals)
- D3: Built-in scenarios (Kid Mode 3 cases)
- D4: Logging & narration mapping

E. Controls & UX
- E1: Controls.svelte (Play/Pause/Step/Restart/Speed)
- E2: NarrationBar.svelte (Kid text)
- E3: Reduced motion & sound toggle
- E4: Responsive layout

F. Accessibility & QA
- F1: Keyboard navigation & focus order
- F2: ARIA and landmarks
- F3: Unit tests (Vitest)
- F4: E2E (Playwright) basic flows

G. Pro Mode (Post-MVP)
- G1: Toggle & layout expansion
- G2: Engine pipeline visuals (Parser/Ignition/TurboFan)
- G3: Heap/GC mini-scene
- G4: Monaco editor (safe subset)

---

## Milestones

- M1: Stage + blocks + basic token animation path
- M2: Simulator drives Kid scenarios accurately
- M3: Controls and narration synced
- M4: Accessibility pass + mobile
- M5: Pro Mode scaffold

---

## Acceptance Criteria (MVP)

- Runs locally and deploys as static or Node adapter.
- Kid Mode: 3 scenarios playable with step & speed.
- Microtasks always drain before macrotasks; visual matches narration.
- Reduced motion mode works; keyboard control for core actions.

---

## Glossary (Kid-friendly metaphors)
- Call Stack: the slide queue (one kid at a time)
- Web APIs: helper robots doing tasks
- Microtask Queue: VIP fast lane
- Macrotask Queue: regular line
- Event Loop: gatekeeper checking the slide is free
