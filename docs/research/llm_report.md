# Requirements checklist

- Clear development plan for the web app (architecture, components, milestones).

- Recommendations for animations and the animation tech stack.

- Choice of web framework and supporting libraries.

- UX focused on extreme clarity—understandable by a 5-year-old.

- Interactivity to explore the call stack, heap, web APIs, queues, event loop, and (lightly) GC.

- Option to grow into deeper technical views for older users.

- Simple, performant, accessible, and responsive.

Status: addressed below.

## Recommended stack

Primary (simple, animation-friendly):

- Framework: SvelteKit (fast, minimal boilerplate, built-in transitions).

- Styling: Tailwind CSS + DaisyUI (fast theming, large, readable components).

- Animations:

- GSAP for timeline-based orchestration and fine control (scrubbing, sequencing).

- SVG for visuals (crisp, scalable, accessible).

- Motion One (optional, lightweight CSS-powered micro-animations).

- State logic: XState (finite state machines) to model event loop cycles deterministically.

- Editor: Monaco Editor (with “Kid Mode” turned off by default; show preset scenarios first).

- i18n: i18next (future multilingual support).

- Accessibility: Headless UI patterns + reduced motion support (prefers-reduced-motion).

Great alternative:

- React + Vite + Framer Motion (+ XState). Choose if your team prefers React. Framer Motion is excellent, but GSAP’s timelines are better for complex, multi-pane choreography.

Why this stack:

- SVG + GSAP is the sweet spot for teaching animations with precise, sequential storytelling.

- Svelte’s reactivity makes it easier to wire visual state to a simulation model without heavy code.

## Concept and UX: “Playground of JavaScript”

Kid-friendly mental model:

- Call Stack = Stack of plates.

- Memory Heap = Toy box.

- Web APIs = Helpful robots doing tasks in the background.

- Microtask Queue = VIP fast lane.

- Macrotask Queue = Regular line.

- Event Loop = Gatekeeper that lets the next kid through when the slide (stack) is empty.

- Engine Pipeline (Parser → Ignition → TurboFan) = “Factory” that prepares instructions fast, then upgrades them.

- Garbage Collector = Cleaning robot tidying the toy box.

Core screens/panels (always visible, side-by-side on desktop, stacked on mobile):

- Code/Scenario panel:

- Big toggle: Kid Mode (default) vs. Pro Mode.

- Preset scenarios as cards with a thumbnail animation (no typing needed for kids).

- Optional editor unlocks in Pro Mode with a safe subset (setTimeout, Promise.resolve, async/await, fetch simulated).

- Visualizer panel (SVG canvas):

- Blocks: Parser, Ignition, TurboFan, Call Stack, Heap, Web APIs, Microtask Queue, Macrotask Queue, Event Loop.

- Color-coded “task tokens” animate between blocks.

- Controls:

- Play/Pause, Step, Restart.

- Speed slider (turtle → rabbit).

- “Explain” voiceover toggle (Web Speech API, with captions).

- “Show details” toggles (e.g., show bytecode or ICs only in Pro Mode).

- Narration bar:

- One line, large text, uses very simple language in Kid Mode (“The robot waits. Promises go first!”).

- More technical copy in Pro Mode (“Microtasks drain before macrotasks; promises enqueue microtasks.”).

Micro-UX to help a 5-year-old:

- Very large controls, minimal text, few choices.

- Bold colors and consistent metaphors.

- Single action per frame; no abrupt camera moves.

- Every animation has a simple caption and a gentle sound cue (with mute).

- “Why?” button on each block shows a one-sentence reason (Kid Mode) or a two-sentence detail (Pro Mode).

## Simulation model (what’s under the visuals)

Keep it deterministic, not a full JS engine:

- Input: preset scenario or “safe” parsed snippet.

- Internal “event script” with steps like:

- push_stack(fnA); pop_stack();

- offload_to_webapi(timer 1s); enqueue_macrotask(cb);

- enqueue_microtask(promise_cb);

- event_loop_cycle: drain microtasks → run one macrotask.

- The simulator ticks via requestAnimationFrame or a virtual clock controlled by the GSAP timeline (so scrub/step is easy).

- XState state machines:

- Machine for “Engine & Runtime” (Idle → Running → Paused).

- Submachines for event loop cycles (Synchronous → DrainMicrotasks → RunOneMacrotask → Repeat).

- Guards for starvation demo (long microtask chains).

- Parsing:

- For Pro Mode: Use Acorn or Babel parser to detect setTimeout, Promise.then, async/await; instrument into the event script.

- For Kid Mode: No parsing—just curated scenarios.

Data contracts (lightweight):

- Task token: { id, kind: "sync" | "microtask" | "macrotask" | "webapi", label, color, duration, source }

- Animation cue: { from: "CallStack", to: "WebAPIs", tokenId, startAt, duration, easing }

- Narration snippet: { at: timelineTime, textKid, textPro }

## Animation strategy

- Primary: GSAP Timeline.

- Each step in the simulation emits events that append to a master timeline.

- Timeline controls map to Play/Pause/Step/Restart.

- Visual primitives:

- SVG groups for each block with fixed anchors.

- Tokens are rounded rectangles with icons (⏱ timer, 🔗 promise, 🌐 fetch).

- Path motions: simple curves between blocks; GSAP MotionPath plugin if needed.

- Choreography rules:

- Only one highlighted action at a time.

- Microtasks drain: loop visually in place until empty, then proceed.

- “Event Loop” pulses when it checks queues; gate animation opens to move the next token.

- Performance:

- Prefer transforms (translate/scale/opacity).

- Offload heavy layout to initial render; keep animations lightweight.

- Respect prefers-reduced-motion; switch to step-by-step highlight with fades.

## Content: preset scenarios (Kid Mode first)

Tier 1 (Kid Mode only):

- “Two logs”: show stack push/pop order.

- “Timer vs. Promise”: promise runs before timeout 0.

- “Fetch robot”: Web API does work; callback enqueues later.

Tier 2 (Kid + Pro):

- “Microtask chain”: starves macrotask; explain fairness.

- “Nested timeouts”: FIFO macrotasks visualized.

- “Async/await sugar”: maps to microtasks.

- “DOM click event”: event handler enters queue; stack must be free.

Tier 3 (Pro Mode only, optional toggles):

- “Engine factory”: Parser → Ignition bytecode → TurboFan optimization/deopt.

- “Inline cache peek”: repeated property access speeds up.

- “GC sweep”: cleaning robot marks and tidies toy box (no scary compaction details in Kid Mode).

## Accessibility and inclusivity

- High-contrast theme; toggle for dyslexia-friendly font (OpenDyslexic).

- All actions keyboard operable (Tab/Enter/Space, arrow keys to step).

- Voiceover via Web Speech API + captions.

- Reduced-motion mode with no movement, only highlights and step transitions.

- Color + shape + icon encoding (not color alone).

## Information hierarchy

- Kid Mode defaults:

- Only: Call Stack, Event Loop, Web APIs, Micro/Macro Queues.

- Narration uses 1-sentence child-level language.

- No code editor, only scenario cards.

- Pro Mode:

- Unlock: Engine pipeline blocks, Heap/GC, editor, logs panel.

- Technical copy and tooltips appear.

## Architecture

- SvelteKit pages:

- / (home: choose Kid vs. Pro)

- /learn (Kid Mode scenarios)

- /lab (Pro Mode with editor)

- Core modules:

- simulation/engine.ts (event script executor)

- simulation/scenarios.ts (preset scenario DSL)

- state/machines.ts (XState machines)

- visuals/Stage.svelte (SVG canvas + GSAP bindings)

- visuals/Blocks/\*.svelte (Stack, Queues, APIs, Loop, Heap)

- ui/Controls.svelte, NarrationBar.svelte, ScenarioCards.svelte

- Testing:

- Vitest for logic

- Playwright for “press play → expect token arrives in microtask queue first” interactions

## MVP scope (4–6 weeks)

- Week 1: Skeleton app, Tailwind, basic SVG stage, GSAP wired, XState loop skeleton.

- Week 2: Implement Call Stack, Web APIs, Micro/Macro queues, Event Loop motions; 3 Kid scenarios.

- Week 3: Controls + narration, speed/step, reduced-motion, sound toggle, responsive layout.

- Week 4: Pro Mode basic: editor OFF; add “Timer vs Promise” advanced view with microtasks.

- Week 5: Polish visuals, accessibility pass, telemetry (anonymous usage to refine UX).

- Week 6: Usability with kids/novices; refine captions and speeds.

Nice-to-haves (post-MVP):

- Monaco editor in Pro Mode with safe-run sandbox.

- “Engine factory” visualization.

- GC cleaning robot scene.

- Node vs. Browser runtime toggle (switch Web APIs set and labels).

- Export/share scenario links.

## Risks and mitigations

- Over-complexity for kids: Default to curated scenarios; hide editor; keep one action per frame.

- Performance jank: Use SVG transforms + GSAP; keep DOM small; throttle at high speeds.

- Misleading accuracy: Add “Kid vs. Pro” fidelity; show simple mental model first; provide “Details” links in Pro Mode.

- Parsing arbitrary JS: Limit to safe subset; or compile scenarios from a controlled DSL.

## Why this will feel intuitive to a 5-year-old

- It’s a playground: lines, gates, helpers, and a slide. Tokens are “kids with tickets” moving in lines.

- Minimal words, large icons, gentle motion, and a single next step always visible.

- Immediate feedback: pressing Step always shows exactly one move, with a short caption.

## Summary recommendations

- Use SvelteKit + Tailwind + SVG + GSAP + XState for a precise, timeline-driven, educational animation app.

- Start with Kid Mode presets; reveal complexity only in Pro Mode.

- Drive visuals from a deterministic simulation timeline so animations and narration stay perfectly in sync.

- Prioritize accessibility and reduced motion from day one.
