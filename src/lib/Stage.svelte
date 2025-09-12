<script>
  export let width = 960;
  export let height = 540;
  export let mode = "kid"; // 'kid' | 'pro'
  // Expose methods to parent via bind:api
  export let api = {};

  // Anchor points for each block (center positions)
  const anchorMap = {
    callStack: { x: 120, y: 130 },
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

  // Token state Map for performance keyed by id
  let tokenMap = new Map();
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
        const existing = tokenMap.get(event.token.id);
        const next = {
          id: event.token.id,
          kind: toKind(event.token.type),
          label: event.token.label,
          color: event.token.color,
          x: anchor.x,
          y: anchor.y,
        };
        tokenMap.set(event.token.id, { ...(existing || {}), ...next });
        tokens = Array.from(tokenMap.values());
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
    tokenMap.clear();
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
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.04)" stroke-width="1" />
    </pattern>
    <filter id="tokenShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000" flood-opacity="0.28" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />

  <!-- Placeholder blocks -->
  {#if mode === "kid"}
    <!-- Kid Mode: Fun characters and shapes that fill the areas -->
    <g role="group" aria-label="Task Robot - where tasks run one by one">
      <!-- Robot factory background -->
      <rect x="40" y="60" width="220" height="140" rx="12" fill="#fef3c7" stroke="#d97706" stroke-width="3">
        <title>Task Robot: runs tasks in order</title>
      </rect>
      <!-- Robot: head, body, arms -->
      <circle cx="110" cy="110" r="20" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
      <rect x="95" y="130" width="30" height="40" rx="6" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
      <rect x="85" y="140" width="10" height="25" rx="3" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
      <rect x="125" y="140" width="10" height="25" rx="3" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
      <!-- Eyes -->
      <circle cx="105" cy="105" r="3" fill="#1f2937" />
      <circle cx="115" cy="105" r="3" fill="#1f2937" />
      <!-- Conveyor belt -->
      <rect x="50" y="175" width="180" height="8" fill="#9ca3af" />
      <rect x="50" y="175" width="20" height="8" fill="#6b7280" />
      <rect x="80" y="175" width="20" height="8" fill="#6b7280" />
      <rect x="110" y="175" width="20" height="8" fill="#6b7280" />
      <rect x="140" y="175" width="20" height="8" fill="#6b7280" />
      <rect x="170" y="175" width="20" height="8" fill="#6b7280" />
      <text x="150" y="200" text-anchor="middle" class="fill-black" font-size="14">Task Robot</text>
    </g>

    <g role="group" aria-label="Magic Cloud - handles special tasks like timers">
      <!-- Cloud background -->
      <rect x="700" y="60" width="220" height="140" rx="12" fill="#dbeafe" stroke="#3b82f6" stroke-width="3">
        <title>Magic Cloud: handles timers and web tasks</title>
      </rect>
      <!-- Cloud shape overlay -->
      <path d="M 750 80 Q 730 70 750 80 Q 770 70 790 80 Q 810 70 790 80 Q 810 110 790 130 Q 770 140 750 130 Q 730 140 750 130 Q 730 110 750 80 Z" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2" />
      <!-- Server icons -->
      <rect x="765" y="95" width="25" height="15" rx="2" fill="#1e40af" stroke="#1e3a8a" stroke-width="1" />
      <rect x="767" y="97" width="21" height="3" rx="1" fill="#60a5fa" />
      <rect x="767" y="102" width="21" height="3" rx="1" fill="#60a5fa" />
      <rect x="767" y="107" width="21" height="3" rx="1" fill="#60a5fa" />
      <!-- Lightning bolts -->
      <path d="M 780 85 L 785 90 L 783 90 L 788 95 L 786 95 L 791 100" stroke="#fbbf24" stroke-width="2" fill="none" />
      <path d="M 820 85 L 825 90 L 823 90 L 828 95 L 826 95 L 831 100" stroke="#fbbf24" stroke-width="2" fill="none" />
      <text x="810" y="200" text-anchor="middle" class="fill-black" font-size="14">Magic Cloud</text>
    </g>

    <g role="group" aria-label="Speedy Lane - quick tasks like promises">
      <!-- Fast lane background -->
      <rect x="40" y="340" width="280" height="120" rx="12" fill="#fef3c7" stroke="#d97706" stroke-width="3">
        <title>Speedy Lane: quick promise tasks</title>
      </rect>
      <!-- Road markings -->
      <rect x="50" y="380" width="260" height="4" fill="#d97706" />
      <rect x="50" y="390" width="260" height="4" fill="#d97706" />
      <rect x="50" y="400" width="260" height="4" fill="#d97706" />
      <!-- Speed signs -->
      <polygon points="80,365 90,355 100,365 90,375" fill="#ef4444" stroke="#dc2626" stroke-width="2" />
      <text x="90" y="372" text-anchor="middle" fill="white" font-size="12" font-weight="bold">!</text>
      <polygon points="200,365 210,355 220,365 210,375" fill="#ef4444" stroke="#dc2626" stroke-width="2" />
      <text x="210" y="372" text-anchor="middle" fill="white" font-size="12" font-weight="bold">!</text>
      <!-- Race car -->
      <rect x="120" y="385" width="40" height="15" rx="5" fill="#ef4444" />
      <circle cx="130" cy="400" r="5" fill="#1f2937" />
      <circle cx="150" cy="400" r="5" fill="#1f2937" />
      <text x="180" y="445" text-anchor="middle" class="fill-black" font-size="14">Speedy Lane</text>
    </g>

    <g role="group" aria-label="Waiting Line - regular tasks like timers">
      <!-- Queue background -->
      <rect x="360" y="340" width="280" height="120" rx="12" fill="#fee2e2" stroke="#ef4444" stroke-width="3">
        <title>Waiting Line: regular tasks wait here</title>
      </rect>
      <!-- People in line -->
      <circle cx="400" cy="385" r="8" fill="#fbbf24" stroke="#d97706" />
      <rect x="395" y="393" width="10" height="15" fill="#fbbf24" stroke="#d97706" />
      <circle cx="430" cy="385" r="8" fill="#fbbf24" stroke="#d97706" />
      <rect x="425" y="393" width="10" height="15" fill="#fbbf24" stroke="#d97706" />
      <circle cx="460" cy="385" r="8" fill="#fbbf24" stroke="#d97706" />
      <rect x="455" y="393" width="10" height="15" fill="#fbbf24" stroke="#d97706" />
      <circle cx="490" cy="385" r="8" fill="#fbbf24" stroke="#d97706" />
      <rect x="485" y="393" width="10" height="15" fill="#fbbf24" stroke="#d97706" />
      <circle cx="520" cy="385" r="8" fill="#fbbf24" stroke="#d97706" />
      <rect x="515" y="393" width="10" height="15" fill="#fbbf24" stroke="#d97706" />
      <!-- Queue arrows -->
      <path d="M 550 380 L 570 380 L 565 375 M 570 380 L 565 385" stroke="#ef4444" stroke-width="2" fill="none" />
      <text x="500" y="445" text-anchor="middle" class="fill-black" font-size="14">Waiting Line</text>
    </g>

    <g role="group" aria-label="Magic Conveyor - moves tasks around">
      <!-- Conveyor background -->
      <rect x="680" y="340" width="240" height="120" rx="12" fill="#ede9fe" stroke="#7c3aed" stroke-width="3">
        <title>Magic Conveyor: moves tasks to run</title>
      </rect>
      <!-- Conveyor belt -->
      <rect x="690" y="390" width="220" height="8" fill="#9ca3af" />
      <!-- Moving segments -->
      <rect x="690" y="390" width="15" height="8" fill="#6b7280" />
      <rect x="715" y="390" width="15" height="8" fill="#6b7280" />
      <rect x="740" y="390" width="15" height="8" fill="#6b7280" />
      <rect x="765" y="390" width="15" height="8" fill="#6b7280" />
      <rect x="790" y="390" width="15" height="8" fill="#6b7280" />
      <rect x="815" y="390" width="15" height="8" fill="#6b7280" />
      <rect x="840" y="390" width="15" height="8" fill="#6b7280" />
      <rect x="865" y="390" width="15" height="8" fill="#6b7280" />
      <!-- Control panel -->
      <rect x="720" y="360" width="60" height="20" rx="3" fill="#6b7280" />
      <circle cx="735" cy="370" r="3" fill="#10b981" />
      <circle cx="750" cy="370" r="3" fill="#10b981" />
      <circle cx="765" cy="370" r="3" fill="#10b981" />
      <text x="800" y="445" text-anchor="middle" class="fill-black" font-size="14">Magic Conveyor</text>
    </g>
  {:else}
    <!-- Pro Mode: Simple blocks -->
    <g role="group" aria-label="Call Stack block">
      <rect x="40" y="60" width="220" height="140" rx="12" fill="#e0f2fe" stroke="#0284c7">
        <title>Call Stack: where synchronous JS runs</title>
      </rect>
      <text x="150" y="135" text-anchor="middle" class="fill-black" font-size="18">Call Stack</text>
    </g>

    <g role="group" aria-label="Web APIs block">
      <rect x="700" y="60" width="220" height="140" rx="12" fill="#ecfccb" stroke="#65a30d">
        <title>Web APIs: timers, fetch, and more</title>
      </rect>
      <text x="810" y="135" text-anchor="middle" class="fill-black" font-size="18">Web APIs</text>
    </g>

    <g role="group" aria-label="Microtask Queue block">
      <rect x="40" y="340" width="280" height="120" rx="12" fill="#fef3c7" stroke="#d97706">
        <title>Microtask Queue: promises first</title>
      </rect>
      <text x="180" y="405" text-anchor="middle" class="fill-black" font-size="18"
        >Microtask Queue</text
      >
    </g>

    <g role="group" aria-label="Macrotask Queue block">
      <rect x="360" y="340" width="280" height="120" rx="12" fill="#fee2e2" stroke="#ef4444">
        <title>Macrotask Queue: timers and more</title>
      </rect>
      <text x="500" y="405" text-anchor="middle" class="fill-black" font-size="18"
        >Macrotask Queue</text
      >
    </g>

    <g role="group" aria-label="Event Loop block">
      <rect x="680" y="340" width="240" height="120" rx="12" fill="#ede9fe" stroke="#7c3aed">
        <title>Event Loop: picks what runs next</title>
      </rect>
      <text x="800" y="405" text-anchor="middle" class="fill-black" font-size="18">Event Loop</text>
    </g>
  {/if}

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
