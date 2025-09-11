<script>
  /* global queueMicrotask Blob URL */
  import { gsap } from "gsap";
  export let api = {};
  export let onNarrate = null; // function(line:string)
  // mode prop removed (unused)
  let callStack = [];
  let microQueue = [];
  let macroQueue = [];
  let webAPIs = [];
  let tokens = new Map();
  let consoleLines = [];
  let currentPhase = null; // 'run-sync' | 'drain-micro' | 'run-macro'
  let history = []; // token/event history
  const activeTweens = new Set();
  // Reduced motion preference
  let reducedMotion = false;
  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotion = mq.matches;
      mq.addEventListener("change", (e) => (reducedMotion = e.matches));
    } catch (err) {
      // ignore matchMedia errors (e.g., unsupported environment)
    }
  }

  function track(tween) {
    if (!tween) return tween;
    if (reducedMotion) {
      // Immediately jump to end state if motion reduced
      try {
        tween.progress(1);
      } catch (err) {
        // ignore tween errors when forcing progress
      }
      return tween;
    }
    activeTweens.add(tween);
    tween.eventCallback("onComplete", () => activeTweens.delete(tween));
    return tween;
  }

  function pushFrame(frame) {
    callStack = [...callStack, frame];
  }
  function popFrame(frame) {
    // If a specific frame name is supplied, remove all matching; otherwise drop top
    if (frame) {
      callStack = callStack.filter((f) => f !== frame);
    } else if (callStack.length) {
      callStack = callStack.slice(0, callStack.length - 1);
    }
  }
  function enqueueMicro(token) {
    microQueue = [...microQueue, token];
    tokens.set(token.id, token);
  }
  function enqueueMacro(token) {
    macroQueue = [...macroQueue, token];
    tokens.set(token.id, token);
  }
  function dequeueMicro(token) {
    microQueue = microQueue.filter((t) => t.id !== token.id);
  }
  function dequeueMacro(token) {
    macroQueue = macroQueue.filter((t) => t.id !== token.id);
  }

  function handleSimEvent(e) {
    switch (e.type) {
      case "stack-push":
        pushFrame(e.frame);
        break;
      case "stack-pop":
        popFrame(e.frame);
        break;
      case "enqueue-micro":
        enqueueMicro(e.token);
        break;
      case "enqueue-macro":
        enqueueMacro(e.token);
        break;
      case "dequeue-micro":
        animateRunFromQueue(e.token, "micro");
        pushHistory(e.token, "micro-run");
        break;
      case "dequeue-macro":
        animateRunFromQueue(e.token, "macro");
        pushHistory(e.token, "macro-run");
        break;
      case "token-move":
        break;
      case "sync":
        if (e.description?.startsWith("console.log")) {
          const msg = e.description.match(/console\.log\('(.*)'\)/)?.[1] || e.description;
          consoleLines = [...consoleLines, msg].slice(-50);
          narrate(`Console output: ${msg}`);
        } else if (e.description) {
          narrate(e.description);
        }
        break;
      case "tick":
        // highlight phase temporarily
        pulsePhase(e.phase);
        currentPhase = e.phase;
        narrate(phaseNarration(e.phase));
        break;
      case "webapi-add":
        webAPIs = [...webAPIs, e.token];
        queueMicrotask(() => {
          const el = document.querySelector(`[data-token="${e.token.id}"]`);
          if (el)
            track(
              gsap.from(el, { scale: 0.55, opacity: 0, duration: 0.35, ease: "back.out(1.6)" })
            );
        });
        narrate(`${e.token.label} scheduled in Web API`);
        pushHistory(e.token, "webapi-add");
        break;
      case "webapi-complete": {
        const el = document.querySelector(`[data-token="${e.token.id}"]`);
        if (el) {
          track(
            gsap.to(el, {
              scale: 0.35,
              opacity: 0,
              duration: 0.3,
              ease: "power1.in",
              onComplete: () => {
                webAPIs = webAPIs.filter((t) => t.id !== e.token.id);
              },
            })
          );
        } else {
          webAPIs = webAPIs.filter((t) => t.id !== e.token.id);
        }
        narrate(`${e.token.label} finished; callback ready`);
        pushHistory(e.token, "webapi-complete");
        break;
      }
    }
  }

  function animateRunFromQueue(token, kind) {
    const el = document.querySelector(`[data-token="${token.id}"]`);
    if (el) {
      const stack = document.querySelector(".panel.stack");
      const stackRect = stack?.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      let dx = 0,
        dy = -70;
      if (stackRect) {
        dx = stackRect.left + stackRect.width / 2 - (elRect.left + elRect.width / 2);
        dy = stackRect.top + 40 - (elRect.top + elRect.height / 2);
      }
      // Dynamic arc trajectory & duration per kind
      const arcLift = kind === "micro" ? 90 : 55;
      const totalDur = kind === "micro" ? 0.52 : 0.7;
      const firstDur = totalDur * 0.45;
      const secondDur = totalDur - firstDur;
      const midX = dx * 0.45;
      const midY = dy * 0.25 - arcLift;
      if (reducedMotion) {
        // Directly remove from queue without animation
        if (kind === "micro") dequeueMicro(token);
        else dequeueMacro(token);
      } else {
        track(
          gsap.to(el, {
            keyframes: [
              { x: midX, y: midY, scale: 0.88, duration: firstDur, ease: "power2.out" },
              {
                x: dx,
                y: dy,
                scale: 0.52,
                opacity: 0,
                duration: secondDur,
                ease: "power1.in",
                onComplete: () => {
                  if (kind === "micro") dequeueMicro(token);
                  else dequeueMacro(token);
                },
              },
            ],
          })
        );
      }
    } else {
      if (kind === "micro") dequeueMicro(token);
      else dequeueMacro(token);
    }
    flashStack();
  }
  function reset() {
    callStack = [];
    microQueue = [];
    macroQueue = [];
    webAPIs = [];
    tokens.clear();
    consoleLines = [];
    history = [];
  }
  api = { handleSimEvent, reset };

  function pulsePhase(phase) {
    const el = document.querySelector(`[data-phase="${phase}"]`);
    if (!el) return;
    el.classList.add("pulse");
    // force reflow
    void (/** @type {HTMLElement} */ (el).offsetWidth);
    setTimeout(() => el.classList.remove("pulse"), 350);
  }

  function narrate(line) {
    if (typeof onNarrate === "function" && line) onNarrate(line);
  }

  function phaseNarration(phase) {
    switch (phase) {
      case "run-sync":
        return "Running synchronous code on the call stack";
      case "drain-micro":
        return "Draining all microtasks (Promises etc.) before macrotasks";
      case "run-macro":
        return "Running one macrotask from the macrotask queue";
      default:
        return "";
    }
  }

  function flashStack() {
    const stackEl = document.querySelector(".panel.stack .stack-frames");
    if (stackEl) {
      stackEl.classList.add("executing");
      setTimeout(() => stackEl.classList.remove("executing"), 420);
    }
  }

  function flyIn(node) {
    const isMicro = node.classList.contains("micro");
    const isMacro = node.classList.contains("macro");
    const isApi = node.classList.contains("api-token");
    let dur = 0.4;
    if (isMicro) dur = 0.28;
    else if (isMacro) dur = 0.45;
    else if (isApi) dur = 0.38;
    if (reducedMotion) return; // skip entrance animation
    track(
      gsap.from(node, { y: 14, opacity: 0, scale: 0.85, duration: dur, ease: "back.out(1.7)" })
    );
  }

  function getTooltip(token) {
    if (!token) return "";
    const map = {
      timer: "Timer callback (macrotask) waits in Web APIs then macrotask queue",
      promise: "Promise then/callback (microtask) runs before macrotasks",
      microtask: "Microtask runs in the microtask drain phase",
      macrotask: "Macrotask runs after microtasks are empty",
      fetch: "Fetch / network operation handled by Web APIs",
      log: "Console log output",
    };
    return map[token.type] || token.type;
  }

  function pushHistory(token, kind) {
    if (!token) return;
    history = [...history, { t: Date.now(), id: token.id, label: token.label, kind }].slice(-120);
  }

  // -- Timeline compatibility layer for shared Controls component --
  function playTimeline() {
    activeTweens.forEach((t) => t.resume());
  }
  function pauseTimeline() {
    activeTweens.forEach((t) => t.pause());
  }
  function stepTimeline() {
    // Finish any active animations instantly before next runner step
    activeTweens.forEach((t) => t.progress(1));
  }
  function resetTimeline() {
    activeTweens.forEach((t) => t.kill());
    activeTweens.clear();
  }
  function resetTokens() {
    reset();
  }
  let animationSpeed = 1;
  let smoothSpeed = true;
  function setTimeScale(ts) {
    const scale = Math.max(0.05, ts || 1);
    animationSpeed = scale;
    if (reducedMotion) {
      gsap.globalTimeline.timeScale(scale);
    } else if (smoothSpeed) {
      track(gsap.to(gsap.globalTimeline, { timeScale: scale, duration: 0.35, ease: "power2.out" }));
    } else {
      gsap.globalTimeline.timeScale(scale);
    }
  }
  function setSmoothSpeed(v) {
    smoothSpeed = !!v;
    // re-apply current speed with new smoothing behavior
    setTimeScale(animationSpeed);
  }
  function exportHistory() {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "token-history.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function clearHistory() {
    history = [];
  }

  api = {
    handleSimEvent,
    reset,
    playTimeline,
    pauseTimeline,
    stepTimeline,
    resetTimeline,
    resetTokens,
    setTimeScale,
    setSmoothSpeed,
    exportHistory,
    clearHistory,
  };
</script>

<div class="hf-grid" aria-label="JavaScript runtime high fidelity visualization">
  <div class="panel code" aria-label="Source Code">
    <div class="code-window">
      <pre><code
          >console.log('Start!')

setTimeout(() => {console.log("Timeout!")}, 0)

Promise.resolve('Promise!')
  .then(res => console.log(res))

console.log('End!')</code
        ></pre>
    </div>
  </div>
  <div class="panel stack" aria-label="Call Stack">
    <h3>CALL STACK</h3>
    <div class="stack-frames" data-empty={callStack.length === 0}>
      {#each [...callStack].slice().reverse() as frame (frame)}
        <div class="frame">{frame}</div>
      {/each}
    </div>
  </div>
  <div class="panel webapi" aria-label="Web API">
    <h3>WEB API</h3>
    <div class="api-area" data-empty={webAPIs.length === 0}>
      {#each webAPIs as t (t.id)}
        <div
          class="api-token"
          data-token={t.id}
          use:flyIn
          data-tooltip={getTooltip(t)}
          aria-label={`${t.label}: ${getTooltip(t)}`}
        >
          {t.label}
        </div>
      {/each}
    </div>
  </div>
  <div class="panel micro" aria-label="Microtask Queue">
    <h3>MICROTASK QUEUE</h3>
    <div class="queue" data-empty={microQueue.length === 0}>
      {#each microQueue as t (t.id)}<div
          class="q-item micro"
          data-token={t.id}
          use:flyIn
          data-tooltip={getTooltip(t)}
          aria-label={`${t.label}: ${getTooltip(t)}`}
        >
          {t.label}
        </div>{/each}
    </div>
  </div>
  <div class="panel macro" aria-label="Macrotask Queue">
    <h3>MACROTASK QUEUE</h3>
    <div class="queue" data-empty={macroQueue.length === 0}>
      {#each macroQueue as t (t.id)}<div
          class="q-item macro"
          data-token={t.id}
          use:flyIn
          data-tooltip={getTooltip(t)}
          aria-label={`${t.label}: ${getTooltip(t)}`}
        >
          {t.label}
        </div>{/each}
    </div>
  </div>
  <div class="panel console" aria-label="Console Output">
    <h2 class="panel-title">Console</h2>
    <div class="console-lines">
      {#each consoleLines as line, i (i)}
        <div class="console-line">{line}</div>
      {/each}
    </div>
  </div>
  <div class="panel loop" aria-label="Event Loop">
    <h3>EVENT LOOP</h3>
    <div
      class="loop-icon {currentPhase ? currentPhase : ''}"
      aria-live="polite"
      aria-label={currentPhase ? `Event loop phase: ${currentPhase}` : "Event loop idle"}
    >
      ↻
    </div>
  </div>
</div>
<div class="timeline" aria-label="Token history" data-empty={history.length === 0}>
  {#each history as h (h.t + h.id + h.kind)}
    <span class="tl-item" data-kind={h.kind} aria-label={`${h.label} ${h.kind}`}>{h.label}</span>
  {/each}
</div>
<svg class="flow-arrows" aria-hidden="true">
  <defs>
    <marker
      id="arrow"
      markerWidth="6"
      markerHeight="6"
      refX="5"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M0,0 L6,3 L0,6 z" fill="currentColor" />
    </marker>
  </defs>
  <line class="arrow" data-phase="macro" x1="75%" y1="65%" x2="85%" y2="50%" />
  <line class="arrow" data-phase="micro" x1="55%" y1="65%" x2="85%" y2="50%" />
  <line class="arrow" data-phase="webapi" x1="35%" y1="35%" x2="85%" y2="50%" />
</svg>
<!-- hidden usage to satisfy Svelte CSS selector reference -->
<span style="display:none" class="pulse stack-frames executing" aria-hidden="true"></span>

<style>
  .hf-grid {
    display: grid;
    grid-template-columns: 380px 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 1.5rem;
  }
  .panel {
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 0.75rem 1rem 1rem;
    background: #111418;
    box-shadow:
      0 2px 4px -2px rgba(0, 0, 0, 0.5),
      0 4px 16px -4px rgba(0, 0, 0, 0.35);
  }
  h3 {
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    font-weight: 600;
    opacity: 0.7;
    margin: 0 0 0.5rem;
  }
  .panel.stack {
    grid-column: 2;
  }
  .panel.webapi {
    grid-column: 3;
  }
  .panel.micro {
    grid-column: 2 / span 1;
  }
  .panel.macro {
    grid-column: 3 / span 1;
  }
  .panel.loop {
    grid-column: 2 / span 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .code-window {
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.72rem;
    line-height: 1.15rem;
    background: #181d23;
    color: #f3f5f7;
  }
  pre {
    margin: 0;
  }
  .stack-frames {
    min-height: 160px;
    display: flex;
    flex-direction: column-reverse;
    gap: 6px;
    justify-content: flex-start;
  }
  .stack-frames.executing {
    outline: 2px solid #0ea5e9;
    box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.25) inset;
  }
  .frame {
    background: #182a38;
    border: 1px solid #1f394b;
    padding: 4px 8px;
    font-size: 0.65rem;
    font-family: ui-monospace, monospace;
    border-radius: 6px;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.4);
  }
  .queue {
    min-height: 86px;
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 2px;
  }
  .q-item {
    background: #1d2530;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.6rem;
    font-family: ui-monospace, monospace;
    border: 1px solid #293341;
    position: relative;
  }
  .q-item.micro {
    box-shadow: 0 0 0 1px #0ea5e9 inset;
  }
  .q-item.macro {
    box-shadow: 0 0 0 1px #eab308 inset;
  }
  .api-area {
    min-height: 90px;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .api-token {
    background: #1d2530;
    border: 1px solid #334150;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.6rem;
    font-family: ui-monospace, monospace;
    position: relative;
    box-shadow: 0 0 0 1px #6366f1 inset;
  }
  .loop-icon {
    width: 64px;
    height: 64px;
    border: 2px solid #0ea5e9;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    font-size: 1.75rem;
    color: #0ea5e9;
    background: #162027;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
  }
  .loop-icon.run-sync {
    border-color: #6366f1;
    color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  }
  .loop-icon.drain-micro {
    border-color: #0ea5e9;
    color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.25);
  }
  .loop-icon.run-macro {
    border-color: #eab308;
    color: #eab308;
    box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.25);
  }
  [data-empty="true"]::after {
    content: "(empty)";
    font-size: 0.6rem;
    opacity: 0.4;
    font-style: italic;
  }
  @media (max-width: 1100px) {
    .hf-grid {
      grid-template-columns: 1fr 1fr;
    }
    .panel.code {
      grid-column: 1 / span 2;
    }
  }
  @media (max-width: 780px) {
    .hf-grid {
      grid-template-columns: 1fr;
    }
    .panel.loop {
      grid-column: 1;
    }
    .panel.stack,
    .panel.webapi,
    .panel.micro,
    .panel.macro {
      grid-column: 1;
    }
  }
  /* Console panel */
  .panel.console {
    grid-column: 1 / span 1;
    max-height: 160px;
    display: flex;
    flex-direction: column;
  }
  .panel.console h2 {
    margin: 0 0 0.25rem;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    opacity: 0.7;
  }
  .console-lines {
    flex: 1;
    overflow-y: auto;
    font-family: ui-monospace, monospace;
    font-size: 0.6rem;
    line-height: 1.05rem;
    padding-right: 4px;
  }
  .console-line {
    padding: 1px 2px;
  }
  .console-line:nth-child(odd) {
    background: rgba(255, 255, 255, 0.025);
  }
  /* Flow arrows */
  .flow-arrows {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .arrow {
    stroke: rgba(255, 255, 255, 0.35);
    stroke-width: 2;
    marker-end: url(#arrow);
  }
  /* pulse class is dynamically added to panels/lines */
  .pulse {
    animation: pulse 0.35s ease-out;
  }
  @keyframes pulse {
    from {
      transform: scale(0.92);
    }
    to {
      transform: scale(1);
    }
  }
  /* Tooltip */
  [data-tooltip] {
    position: relative;
    cursor: help;
  }
  [data-tooltip]:focus-visible::after,
  [data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 50%;
    top: -6px;
    transform: translate(-50%, -100%);
    background: #1f2933;
    color: #fff;
    font-size: 0.55rem;
    white-space: nowrap;
    padding: 4px 6px;
    border-radius: 4px;
    box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.4);
    z-index: 10;
    pointer-events: none;
  }

  /* Timeline */
  .timeline {
    margin-top: 1rem;
    display: flex;
    gap: 6px;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 4px 2px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: #10151a;
    min-height: 40px;
    align-items: center;
  }
  .timeline[data-empty="true"]::after {
    content: "(no history yet)";
    font-size: 0.6rem;
    opacity: 0.5;
    font-style: italic;
    padding: 0 6px;
  }
  .tl-item {
    flex: 0 0 auto;
    background: #1d2530;
    border: 1px solid #293341;
    padding: 4px 8px;
    font-size: 0.55rem;
    font-family: ui-monospace, monospace;
    border-radius: 6px;
    position: relative;
  }
  .tl-item[data-kind^="micro"] {
    box-shadow: 0 0 0 1px #0ea5e9 inset;
  }
  .tl-item[data-kind^="macro"] {
    box-shadow: 0 0 0 1px #eab308 inset;
  }
  .tl-item[data-kind^="webapi"] {
    box-shadow: 0 0 0 1px #6366f1 inset;
  }
</style>
