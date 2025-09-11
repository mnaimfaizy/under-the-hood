# Under the Hood: JavaScript Visualizer

This project is an interactive, kid-friendly web app that visualizes how JavaScript runs under the hood: call stack, web APIs, micro/macro task queues, the event loop, and a light peek at engine/GC.

- Start here: `docs/plan.md` for the roadmap, tasks, and milestones.
- Research source: keep research notes in `docs/research/` (the full report is stored there).

## High-level goals

- Make the event loop feel obvious to a 5-year-old (Kid Mode) while keeping accurate, deeper views for learners (Pro Mode).
- Use simple, synchronized animations driven by a deterministic simulation, not ad-hoc timers.
- Be accessible, responsive, and friendly.
