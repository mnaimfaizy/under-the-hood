# Remaining Tasks: Under the Hood — JavaScript Visualizer

This file outlines all remaining and necessary features to improve the web app, based on a comprehensive review of the docs. It builds on the completed MVP (T1–T9) and partial T10, prioritizing kid-friendly clarity, Pro Mode extensibility, and deterministic simulation. Tasks are grouped by category for logical progression. Each task includes detailed description, acceptance criteria, effort estimate, dependencies, and rationale.

Tasks are ordered to tackle high-impact, low-risk items first (e.g., content expansion before advanced tooling). Aim to complete in phases: Phase 1 (Content & UI Polish), Phase 2 (Pro Mode & Testing), Phase 3 (Deployment & Community).

---

## 1. Content Expansion (Scenarios and Narration)

### Task 1.1: Implement Advanced Kid Mode Scenarios

**Description**: Add Tier 2 scenarios from the plan to demonstrate edge cases and deepen understanding without overwhelming simplicity. Include:

- Microtask Chain (starvation demo): Show a chain of promises that blocks macrotasks, explaining "fairness" in queues.
- Nested Timeouts (FIFO order): Multiple setTimeout calls to illustrate first-in-first-out macrotask processing.
- Async/Await Mapping: Visualize how async/await desugars to microtasks, with step-by-step breakdown.
- DOM Click Event: Simulate a user click enqueuing an event handler, requiring the call stack to be free.

For each: Define scenario DSL in `src/lib/sim/scenarios.ts`, emit precise events, map to GSAP animations, and add kid-friendly narration (e.g., "The promises are taking turns, so the timer has to wait!").

**Acceptance Criteria**:

- All 4 scenarios selectable in Kid Mode dropdown.
- Animations match expected event order (e.g., microtasks drain fully before macrotasks).
- Narration updates dynamically with simple metaphors (e.g., "VIP lane is busy!").
- Unit tests in `src/lib/sim/scenarios.test.ts` verify event sequences.
- E2E tests in Playwright confirm end-to-end playback.

**Effort Estimate**: Medium (2–3 days per scenario, total 1–2 weeks).
**Dependencies**: T1 (Simulation Engine), T4 (Basic Scenarios).
**Rationale**: Increases replayability and teaches advanced concepts; aligns with research on queue priority.

### Task 1.2: Enhance Narration System

**Description**: Upgrade narration for dynamism and accessibility. Add scenario-specific voiceovers, rolling history (last 10–20 lines), and Web Speech API integration for optional audio playback. Support reduced-motion users with text-only cues. Extend glossary with new metaphors (e.g., "starvation" as "VIP friends hogging the slide").

**Acceptance Criteria**:

- Narration adapts per scenario/step (e.g., custom text for microtask chains).
- Rolling history toggle in UI, with `aria-live="polite"` for screen readers.
- Web Speech API enabled via toggle (muted by default, respects user preferences).
- Fallback to text if speech fails; no audio in reduced-motion mode.
- Manual testing confirms clarity for kids (e.g., short sentences, no jargon).

**Effort Estimate**: Small-Medium (3–5 days).
**Dependencies**: T3 (Basic Narration).
**Rationale**: Improves engagement and accessibility; research emphasizes "gentle motion and captions."

### Task 1.3: Add Pro Mode Advanced Scenarios

**Description**: Implement Pro-only scenarios for technical depth. Include:

- Inline Cache Peek: Visualize property access speeding up with ICs (show "hot spots" in TurboFan).
- GC Sweep Details: Animate mark/sweep/compacting phases with the cleaning robot, explaining young/old generations.

Make these toggleable in Pro Mode, with technical tooltips and logs integration.

**Acceptance Criteria**:

- Scenarios appear only in Pro Mode; Kid Mode unchanged.
- Animations use GSAP for phases (e.g., robot "sweeping" heap).
- Tooltips explain concepts (e.g., "ICs cache property lookups for speed").
- Logs capture GC events; unit tests verify sequences.

**Effort Estimate**: Medium (1 week).
**Dependencies**: T7 (Basic Pro Mode).
**Rationale**: Unlocks "deeper technical views" for advanced learners, per plan.

---

## 2. Pro Mode Features and Editor

### Task 2.1: Integrate Monaco Editor for Pro Mode

**Description**: Add a sandboxed Monaco editor allowing safe JS subsets (e.g., setTimeout, Promise.resolve, async/await, console.log). Parse user code via Acorn/Babel to generate simulation events, preventing arbitrary execution. Display in Pro Mode with a "Run" button; show errors gracefully.

**Acceptance Criteria**:

- Editor appears in Pro Mode; hidden in Kid Mode.
- Safe subset enforced (e.g., no eval, limited globals).
- "Run" parses code into scenario events and plays simulation.
- Errors shown in logs (e.g., "Syntax error: invalid code").
- E2E test for valid/invalid code execution.

**Effort Estimate**: Medium-High (1–2 weeks).
**Dependencies**: T7 (Pro Mode), T1 (Simulation Engine).
**Rationale**: Enables experimentation; deferred in T7 PR but critical for Pro users.

### Task 2.2: Add Runtime Toggle (Browser vs. Node)

**Description**: Implement a toggle in Pro Mode to switch between Browser and Node.js runtimes. Adjust Web APIs (e.g., fetch for Browser, fs for Node) and labels. Use simulation to mock differences without real execution.

**Acceptance Criteria**:

- Toggle in Pro Mode header; defaults to Browser.
- Web API blocks update (e.g., "Fetch Robot" vs. "File Read").
- Narration/logs reflect runtime (e.g., "In Node, we use files instead of networks").
- No functional change in Kid Mode.

**Effort Estimate**: Small (2–3 days).
**Dependencies**: T7 (Pro Mode).
**Rationale**: Demonstrates runtime differences; mentioned in plan.

### Task 2.3: Enhance Logs and Instrumentation

**Description**: Upgrade Pro Mode logs with filtering (by event type: sync, micro, macro), export (JSON/CSV), and integration with editor (e.g., highlight logged lines). Add performance metrics (e.g., simulation ticks/second).

**Acceptance Criteria**:

- Filter dropdown in logs panel.
- Export button downloads file with events.
- Editor integration: Click log to highlight code.
- Metrics shown in Pro Mode (e.g., "Simulation running at 60 FPS").

**Effort Estimate**: Small-Medium (4–5 days).
**Dependencies**: T7 (Logs), T2.1 (Editor).
**Rationale**: Improves debugging; builds on existing logs.

---

## 3. UI/UX Polish and Responsiveness

### Task 3.1: Complete T10 Token Animations and Lifecycle

**Description**: Add entrance (scale/fade-in) and exit (shrink/fade-out) animations for tokens using GSAP. Ensure 400ms duration, respecting reduced-motion (instant updates). Differentiate by kind (e.g., microtasks "pop" faster).

**Acceptance Criteria**:

- Tokens animate in/out on enqueue/dequeue.
- Reduced-motion skips tweens (gsap.set).
- No performance impact (test on low-end devices).
- Visual tests confirm accessibility (no flashing).

**Effort Estimate**: Small (2–3 days).
**Dependencies**: T2 (Visual Layer).
**Rationale**: Enhances clarity; part of T10.

### Task 3.2: Implement Responsive Stage Layout

**Description**: Reflow controls beneath stage on <900px width. Ensure tap targets ≥44px, stacked panels, and mobile-friendly narration. Use Tailwind breakpoints.

**Acceptance Criteria**:

- Desktop: Side-by-side; Mobile: Stacked.
- No horizontal scroll; controls accessible via touch.
- Playwright test for mobile viewport.

**Effort Estimate**: Small (2–3 days).
**Dependencies**: T5 (Responsiveness).
**Rationale**: Improves mobile UX; part of T10.

### Task 3.3: Add Block Legends and ARIA Labeling

**Description**: Create a persistent legend explaining shapes/colors/icons (Kid + Pro). Add ARIA labels per block (e.g., "Call Stack: LIFO stack of executing frames"). Make focus-safe tooltips.

**Acceptance Criteria**:

- Legend maps 1:1 with visuals; toggleable.
- ARIA labels for screen readers; axe audit passes.
- Tooltips on hover/focus.

**Effort Estimate**: Small (3–4 days).
**Dependencies**: T5 (Accessibility).
**Rationale**: Boosts accessibility; part of T10.

### Task 3.4: Persist Dark Mode and Preferences

**Description**: Save theme (light/dark) and other prefs (e.g., sound, speed) to localStorage. Sync with prefers-color-scheme. Add system preference detection.

**Acceptance Criteria**:

- Theme persists across reloads; matches system if unset.
- Other prefs (e.g., narration history) saved.
- No regressions in Kid Mode.

**Effort Estimate**: Small (2 days).
**Dependencies**: T10 (UI Polish).
**Rationale**: User convenience; part of T10.

### Task 3.5: Optimize Token Performance

**Description**: Switch token storage to Map/object for faster updates. Profile and document improvements (e.g., fewer allocations).

**Acceptance Criteria**:

- No functional change; benchmark shows 20–30% faster updates.
- PR notes include metrics.

**Effort Estimate**: Small (1–2 days).
**Dependencies**: T2 (Visual Layer).
**Rationale**: Prevents jank; part of T10.

### Task 3.6: Extract Controls Component

**Description**: Move control bar into `src/lib/Controls.svelte` for modularity. Ensure all functionality (play/pause/step/speed/select) remains.

**Acceptance Criteria**:

- `App.svelte` shrinks; tests pass.
- Reusable for future features.

**Effort Estimate**: Small (1 day).
**Dependencies**: T3 (Controls).
**Rationale**: Code organization; part of T10.

### Task 3.7: Add Pro Mode Tooltips and Legend

**Description**: Extend tooltips for Pro panels (e.g., "Parser: Converts code to AST"). Integrate with legend.

**Acceptance Criteria**:

- Keyboard focus reveals tooltips; instant for reduced-motion.
- No jitter; accessible.

**Effort Estimate**: Small (2 days).
**Dependencies**: T7 (Pro Mode), T3.3 (Legend).
**Rationale**: Technical clarity; part of T10.

### Task 3.8: Update README with Screenshots and Docs

**Description**: Add screenshots (or alt text descriptions) of Kid/Pro modes, legend, and scenarios. Update instructions.

**Acceptance Criteria**:

- README includes visuals and new features.
- Links to glossary/research.

**Effort Estimate**: Small (1 day).
**Dependencies**: T9 (Content Docs).
**Rationale**: User onboarding; part of T10.

---

## 4. Testing, Quality, and Tooling

### Task 4.1: Expand E2E Test Coverage

**Description**: Add Playwright tests for new scenarios, Pro Mode toggles, keyboard nav, reduced motion, and mobile layouts. Include visual regression (screenshots).

**Acceptance Criteria**:

- Tests for all new scenarios and features.
- CI runs E2E; failures block merges.
- Accessibility axe integration in tests.

**Effort Estimate**: Medium (1 week).
**Dependencies**: T6 (Basic Testing).
**Rationale**: Ensures quality; gaps noted in PRs.

### Task 4.2: Add Performance Monitoring and Telemetry

**Description**: Implement anonymous usage tracking (e.g., scenario plays, errors) via self-hosted or Google Analytics. Add bundle size monitoring and animation profiling.

**Acceptance Criteria**:

- Opt-in telemetry; respects privacy.
- Dashboard for metrics (e.g., "Most played scenario").
- Performance benchmarks in CI.

**Effort Estimate**: Small-Medium (3–5 days).
**Dependencies**: T8 (CI).
**Rationale**: Informs improvements; per plan.

### Task 4.3: Implement Error Handling and Fallbacks

**Description**: Add try/catch for GSAP/scenarios, graceful degradation (e.g., text-only if animations fail), and browser compatibility checks.

**Acceptance Criteria**:

- Errors logged; app continues with fallbacks.
- Unsupported browsers show warning.

**Effort Estimate**: Small (2–3 days).
**Dependencies**: T1 (Engine).
**Rationale**: Robustness; prevents crashes.

---

## 5. Deployment, Distribution, and User Engagement

### Task 5.1: Set Up Deployment Pipeline

**Description**: Configure static deployment (Vite build) to Netlify/Vercel. Add PWA features (service worker, manifest) for offline/installable app.

**Acceptance Criteria**:

- Live demo URL; deploys on push to main.
- PWA installable; works offline for cached scenarios.

**Effort Estimate**: Small (2–3 days).
**Dependencies**: T8 (CI).
**Rationale**: Makes app accessible; per plan.

### Task 5.2: Add Sharing and Export Features

**Description**: Enable URL-based scenario sharing (e.g., ?scenario=microtask-chain). Add animation export (GIF/video) for social sharing.

**Acceptance Criteria**:

- Shareable links load scenarios directly.
- Export button generates media file.

**Effort Estimate**: Medium (4–5 days).
**Dependencies**: T1 (Scenarios).
**Rationale**: Increases virality; per plan.

### Task 5.3: Conduct User Testing with Kids

**Description**: Run usability tests with 5–10 children (ages 5–10). Gather feedback on clarity, fun, and confusion. Iterate based on results.

**Acceptance Criteria**:

- Test script and notes documented.
- 3–5 iterations; metrics (e.g., "Understood queues: 80%").
- Changes implemented (e.g., simpler narration).

**Effort Estimate**: Medium (1 week, including prep).
**Dependencies**: MVP Complete.
**Rationale**: Ensures kid-friendliness; per plan.

### Task 5.4: Add Multilingual Support (i18n)

**Description**: Integrate i18next for narration/UI in multiple languages (e.g., Spanish, French). Start with 2–3 langs.

**Acceptance Criteria**:

- Language selector; persists preference.
- Narration translates dynamically.

**Effort Estimate**: Medium (1 week).
**Dependencies**: T3 (Narration).
**Rationale**: Broadens reach; recommended in stack.

---

## 6. Documentation and Community

### Task 6.1: Create User-Facing Documentation

**Description**: Add a "For Learners" section to README with tutorials, FAQ (e.g., "Why microtasks first?"), and video links. Create in-app help tooltips.

**Acceptance Criteria**:

- README has learner guide; links to research.
- In-app "?" button shows context help.

**Effort Estimate**: Small (3–4 days).
**Dependencies**: T9 (Docs).
**Rationale**: Improves usability; dev docs are strong but user-focused is missing.

### Task 6.2: Enhance Open Source Community Features

**Description**: Add contributing guidelines, issue templates (e.g., "New Scenario Request"), and code of conduct. Encourage PRs for scenarios.

**Acceptance Criteria**:

- Guidelines in repo; templates used.
- Community growth (e.g., 5+ issues/PRs).

**Effort Estimate**: Small (2 days).
**Dependencies**: T9 (License).
**Rationale**: Supports collaboration; repo is MIT-licensed.

---

## Phase Recommendations

- **Phase 1 (2–3 weeks)**: 1.1, 1.2, 3.1–3.4, 3.6, 3.8 (Content and UI core).
- **Phase 2 (2–3 weeks)**: 2.1–2.3, 1.3, 3.5, 3.7, 4.1 (Pro Mode and testing).
- **Phase 3 (1–2 weeks)**: 4.2–4.3, 5.1–5.4, 6.1–6.2 (Polish, deploy, community).

Total estimated effort: 8–12 weeks, scalable. Prioritize based on user feedback from Task 5.3.
