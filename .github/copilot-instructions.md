# Copilot Instructions for Under the Hood: JavaScript Visualizer

## Purpose

This file provides guidance for LLM agents (Copilot) working on the "Under the Hood" JavaScript Visualizer project. It summarizes the project goals, architecture, workflow, and best practices, ensuring consistent, high-quality contributions.

---

## Project Overview

- **Goal:** Build an interactive, kid-friendly web app that visualizes JavaScript internals: call stack, web APIs, micro/macro task queues, event loop, and a light peek at engine/GC.
- **Modes:**
  - **Kid Mode:** Simple, accessible, and visually intuitive for young learners.
  - **Pro Mode:** Deeper technical views, engine pipeline, heap/GC, and code editor.
- **Stack:** Svelte + Vite, Tailwind CSS, SVG, GSAP (animation), XState (state machines).
- **Docs:** See `/docs/plan.md`, `/docs/tasks.md`, `/docs/research/` for roadmap, handoff, and technical background.

---

## Key Principles

- **Deterministic Simulation:** All animations and state changes are driven by a simulation engine, not ad-hoc timers.
- **Accessibility:** High-contrast theme, keyboard navigation, ARIA labels, reduced motion support.
- **Responsiveness:** Mobile-friendly layouts, large controls, minimal text in Kid Mode.
- **Clarity:** Use metaphors (slide queue, robots, VIP lane) and simple language for Kid Mode.
- **Extensibility:** Pro Mode unlocks technical details, editor, and advanced scenarios.

---

## Architecture & Components

- **Core files:**
  - `src/App.svelte`: App shell, controls, narration.
  - `src/lib/Stage.svelte`: SVG visual stage.
  - `src/lib/sim/types.ts`: Simulation types.
  - `src/lib/sim/scenarios.ts`: Scenario DSL and helpers.
  - `src/lib/Token.svelte`: Visual tokens.
  - `src/lib/sim/engine.ts`: Simulation runner.
  - `src/lib/state/machines.ts`: XState state machines.
- **Testing:** Use Vitest for simulation logic, Playwright for user flows.
- **Accessibility:** All actions must be keyboard operable; support reduced motion.

---

## Workflow Instructions

1. **Branching:**
   - If there is not a branch already created for the issue/task, ALWAYS create a new branch.
   - NEVER work directly in the `main` branch.
   - Use descriptive branch names (e.g., `feature/simulation-engine`, `fix/accessibility-controls`).
2. **Task Handoff:**
   - Review `/docs/tasks.md` for current status and actionable tasks.
   - Follow the work breakdown structure and acceptance criteria in `/docs/plan.md`.
3. **Development:**
   - Prioritize Kid Mode MVP features first.
   - Use the recommended tech stack and architecture.
   - Ensure all new features are accessible and responsive.
   - Keep code and visuals simple; avoid over-complicating for Kid Mode.
   - For Pro Mode, add technical details, tooltips, and editor features as described in docs.
4. **Testing & Quality:**
   - Write unit tests for simulation logic.
   - Add E2E tests for core user flows.
   - Run CI and ensure all tests pass before merging.
5. **Documentation:**
   - Update README and relevant docs for new features or changes.
   - Add/maintain glossary for metaphors and technical terms.

---

## Research & References

- See `/docs/research/JavaScript Execution Flow Report.md` for deep technical background on JS engines, runtimes, event loop, and GC.
- See `/docs/research/llm_report.md` for requirements, stack recommendations, and UX principles.

---

## Accessibility & Inclusivity

- Always provide high-contrast themes, keyboard navigation, and reduced motion options.
- Use color + shape + icon encoding (not color alone).
- Narration and captions must be simple in Kid Mode, technical in Pro Mode.

---

## Summary

- **Start every task by reviewing the relevant docs and current status.**
- **Never work directly in `main`; always use a feature branch.**
- **Prioritize accessibility, clarity, and responsiveness.**
- **Drive all visuals and state from the simulation engine.**
- **Keep Kid Mode simple; add complexity only in Pro Mode.**

---

For further details, consult the documentation in `/docs` and follow the architecture and workflow described above.
