<script>
  export let width = 960;
  export let height = 540;
  export let mode = "kid"; // 'kid' | 'pro'
  // Expose methods to parent via bind:api
  export let api = {};

  // Anchor points for each block (center positions)
  const anchorMap = {
    callStack: { x: 150, y: 130 },
    webAPIs: { x: 810, y: 130 },
    microtaskQueue: { x: 180, y: 400 },
    macrotaskQueue: { x: 500, y: 400 },
    eventLoop: { x: 800, y: 400 },
  };

  /**
   * Returns the anchor coordinates for a given block name.
   * @param {string} name - Block name (callStack, webAPIs, microtaskQueue, macrotaskQueue, eventLoop)
   * @returns {{x: number, y: number} | undefined}
   */
  export function getAnchor(name) {
    return anchorMap[name];
  }
  export { anchorMap };

  // --- T2.3: Event → Motion Mapper ---
  import Token from "./Token.svelte";
  import gsap from "gsap";
  import { onMount } from "svelte";

  // Token state: { id, type, label, color, x, y }
  let tokens = [];

  // Master GSAP timeline
  let timeline = gsap.timeline({ paused: true });

  // Receive simulation events and map to token motions
  /**
   * Handles a simulation event and animates tokens accordingly.
   * @param {object} event - Simulation event
   */
  // Instance methods (accessible via bind:this)
  function handleSimEvent(event) {
    // Map SimEvent types from scenarios.ts to motion targets
    if (event.type === "token-move" && event.token) {
      let targetBlock = null;
      switch (event.to) {
        case "call-stack":
        case "call_stack":
        case "callstack":
          targetBlock = "callStack";
          break;
        case "web-api":
        case "webapi":
        case "web_api":
          targetBlock = "webAPIs";
          break;
        case "microtask-queue":
        case "microtask_queue":
        case "micro":
          targetBlock = "microtaskQueue";
          break;
        case "macrotask-queue":
        case "macrotask_queue":
        case "macro":
          targetBlock = "macrotaskQueue";
          break;
        default:
          targetBlock = null;
      }
      if (targetBlock) {
        const anchor = getAnchor(targetBlock);
        const toKind = (type) => {
          switch (type) {
            case "timer":
            case "macrotask":
              return "macro";
            case "promise":
            case "microtask":
              return "micro";
            case "fetch":
              return "webapi";
            default:
              return "sync";
          }
        };
        let idx = tokens.findIndex((t) => t.id === event.token.id);
        if (idx === -1) {
          tokens = [
            ...tokens,
            {
              id: event.token.id,
              kind: toKind(event.token.type),
              label: event.token.label,
              color: event.token.color,
              x: anchor.x,
              y: anchor.y,
            },
          ];
        } else {
          tokens = tokens.map((t, i) => (i === idx ? { ...t, x: anchor.x, y: anchor.y } : t));
        }
      }
    }
  }

  // Expose timeline controls
  function playTimeline() {
    timeline.play();
  }
  function pauseTimeline() {
    timeline.pause();
  }
  function stepTimeline() {
    timeline.seek(timeline.time() + 0.5);
  }
  function resetTimeline() {
    timeline.seek(0).pause();
  }
  function resetTokens() {
    tokens = [];
  }

  // Bind API for parent
  api = { handleSimEvent, playTimeline, pauseTimeline, stepTimeline, resetTimeline, resetTokens };
</script>

<svg
  {width}
  {height}
  viewBox={`0 0 ${width} ${height}`}
  class="w-full h-auto"
  role="img"
  aria-label={mode === "pro"
    ? "JavaScript runtime and engine stage"
    : "JavaScript runtime playground stage"}
>
  <!-- Grid background -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />

  <!-- Placeholder blocks -->
  <g>
    <rect x="40" y="60" width="220" height="140" rx="12" fill="#e0f2fe" stroke="#0284c7" />
    <title>Call Stack: where synchronous JS runs</title>
    <text x="150" y="135" text-anchor="middle" class="fill-black" font-size="18">Call Stack</text>
  </g>

  <g>
    <rect x="700" y="60" width="220" height="140" rx="12" fill="#ecfccb" stroke="#65a30d" />
    <title>Web APIs: timers, fetch, and more</title>
    <text x="810" y="135" text-anchor="middle" class="fill-black" font-size="18">Web APIs</text>
  </g>

  <g>
    <rect x="40" y="340" width="280" height="120" rx="12" fill="#fef3c7" stroke="#d97706" />
    <title>Microtask Queue: promises first</title>
    <text x="180" y="405" text-anchor="middle" class="fill-black" font-size="18"
      >Microtask Queue</text
    >
  </g>

  <g>
    <rect x="360" y="340" width="280" height="120" rx="12" fill="#fee2e2" stroke="#ef4444" />
    <title>Macrotask Queue: timers and more</title>
    <text x="500" y="405" text-anchor="middle" class="fill-black" font-size="18"
      >Macrotask Queue</text
    >
  </g>

  <g>
    <rect x="680" y="340" width="240" height="120" rx="12" fill="#ede9fe" stroke="#7c3aed" />
    <title>Event Loop: picks what runs next</title>
    <text x="800" y="405" text-anchor="middle" class="fill-black" font-size="18">Event Loop</text>
  </g>

  {#if mode === "pro"}
    <!-- Pro Mode panels: Engine pipeline & Heap/GC preview -->
    <g>
      <rect x="40" y="200" width="480" height="100" rx="10" fill="#f0f9ff" stroke="#0ea5e9" />
      <title>Engine pipeline: Parser to Ignition to TurboFan</title>
      <text x="60" y="230" class="fill-black" font-size="14">Engine Pipeline</text>
      <!-- Simple boxes: Parser → Ignition → TurboFan -->
      <rect x="60" y="240" width="120" height="40" rx="6" fill="#e2e8f0" stroke="#64748b" />
      <text x="120" y="265" text-anchor="middle" class="fill-black" font-size="12">Parser</text>
      <text x="190" y="260" class="fill-black">→</text>
      <rect x="210" y="240" width="120" height="40" rx="6" fill="#e2e8f0" stroke="#64748b" />
      <text x="270" y="265" text-anchor="middle" class="fill-black" font-size="12">Ignition</text>
      <text x="350" y="260" class="fill-black">→</text>
      <rect x="370" y="240" width="120" height="40" rx="6" fill="#e2e8f0" stroke="#64748b" />
      <text x="430" y="265" text-anchor="middle" class="fill-black" font-size="12">TurboFan</text>
    </g>

    <g>
      <rect x="540" y="200" width="380" height="100" rx="10" fill="#faf5ff" stroke="#a855f7" />
      <title>Heap and Garbage Collector</title>
      <text x="560" y="230" class="fill-black" font-size="14">Heap / GC</text>
      <!-- simple heap blocks and a sweeper bot icon -->
      <rect x="560" y="240" width="60" height="40" rx="6" fill="#fde68a" stroke="#d97706" />
      <rect x="630" y="240" width="60" height="40" rx="6" fill="#bbf7d0" stroke="#16a34a" />
      <rect x="700" y="240" width="60" height="40" rx="6" fill="#fecaca" stroke="#ef4444" />
      <!-- robot head -->
      <circle cx="840" cy="260" r="16" fill="#e5e7eb" stroke="#6b7280" />
      <circle cx="835" cy="256" r="3" fill="#0ea5e9" />
      <circle cx="845" cy="256" r="3" fill="#0ea5e9" />
      <rect x="833" y="266" width="14" height="3" fill="#6b7280" />
    </g>
  {/if}
  <!-- Render tokens -->
  {#each tokens as token (token.id)}
    <Token {...token} />
  {/each}
  <!-- End of SVG content -->
</svg>

<style>
  .fill-black {
    fill: #111827;
  }
  :global(html.dark) .fill-black {
    fill: #f3f4f6;
  }
</style>
