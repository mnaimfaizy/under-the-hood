# Under the Hood: JavaScript Visualizer

[![CI](https://github.com/mnaimfaizy/under-the-hood/actions/workflows/ci.yml/badge.svg)](https://github.com/mnaimfaizy/under-the-hood/actions/workflows/ci.yml)

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

## Handoff tasks

- See `docs/tasks.md` for the actionable next steps.
- Start with T1 (simulation engine) and T2 (visual mapping). First scenario: “Timer vs Promise”.

## Project structure

- `src/App.svelte`: App shell and controls
- `src/lib/Stage.svelte`: SVG stage for Call Stack, Web APIs, Queues, Event Loop
- `docs/plan.md`: Overall plan
- `docs/tasks.md` and `tasks.md`: Handoff tasks

## Notes

- If Node < 20.19, dev may start but builds/CI can fail. Please upgrade.
