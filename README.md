# Under the Hood: JavaScript Visualizer

[![CI](https://github.com/mnaimfaizy/under-the-hood/actions/workflows/ci.yml/badge.svg)](https://github.com/mnaimfaizy/under-the-hood/actions/workflows/ci.yml)
[![E2E](https://github.com/mnaimfaizy/under-the-hood/actions/workflows/e2e.yml/badge.svg)](https://github.com/mnaimfaizy/under-the-hood/actions/workflows/e2e.yml)

Interactive visualizer for the JavaScript event loop, built with Svelte, Vite, Tailwind, and GSAP.

## Quick start

Requirements:

- Node 20.19+ (or 22.12+)
- npm 10+

Install and run:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

Open the dev server URL printed in the terminal. Use the scenario selector to try different demos.

## Quality

- Lint: `npm run lint` (ESLint for JS/TS/Svelte)
- Format check: `npm run format` (Prettier)
- Unit tests: `npm run test:unit`
- E2E: `npm run test:e2e`

## Scenarios (Kid Mode)

- Two Logs: shows synchronous order.
- Timer vs Promise: demonstrates microtask priority (Promises before setTimeout).
- Fetch Robot: work offloaded to Web APIs and enqueued back later.

## Docs

- Plan and milestones: `docs/plan.md`
- Task board and status: `docs/tasks.md`
- Research report: `docs/research/JavaScript Execution Flow Report.md`
- Glossary: `docs/glossary.md`

## Handoff tasks

- See `docs/tasks.md` for the actionable next steps.
- Start with T1 (simulation engine) and T2 (visual mapping). First scenario: “Timer vs Promise”.

## Project structure

- `src/App.svelte`: App shell and controls
- `src/lib/Stage.svelte`: SVG stage for Call Stack, Web APIs, Queues, Event Loop
- `docs/plan.md`: Overall plan
- `docs/tasks.md` and `tasks.md`: Handoff tasks
- `docs/glossary.md`: Kid vs Pro mode terms and metaphors

## Notes

- If Node < 20.19, dev may start but builds/CI can fail. Please upgrade.

---

License: MIT — see `LICENSE`.
