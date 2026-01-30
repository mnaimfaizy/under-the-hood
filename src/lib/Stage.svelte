<script>
  export let width = 960;
  export let height = 540;
  export let mode = "kid"; // 'kid' | 'pro'
  // Expose methods to parent via bind:api
  export let api = {};

  // Anchor points for each block (center positions)
  const anchorMap = {
    callStack: { x: 160, y: 130 },
    webAPIs: { x: 780, y: 130 },
    microtaskQueue: { x: 180, y: 375 },
    macrotaskQueue: { x: 520, y: 375 },
    eventLoop: { x: 840, y: 375 },
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
    // Handle token removal
    if (event.type === "token-remove" && event.tokenId) {
      tokenMap.delete(event.tokenId);
      tokens = Array.from(tokenMap.values());
      return;
    }

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
      <defs>
        <linearGradient id="robotBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fde68a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="20"
        y="40"
        width="280"
        height="180"
        rx="16"
        fill="url(#robotBg)"
        stroke="#f59e0b"
        stroke-width="3"
      >
        <title>Task Robot: runs tasks in order</title>
      </rect>
      <!-- Decorative gears -->
      <circle
        cx="260"
        cy="70"
        r="8"
        fill="none"
        stroke="#d97706"
        stroke-width="1.5"
        opacity="0.3"
      />
      <circle
        cx="275"
        cy="85"
        r="6"
        fill="none"
        stroke="#d97706"
        stroke-width="1.5"
        opacity="0.3"
      />
      <!-- Robot: head with shine -->
      <circle cx="160" cy="115" r="24" fill="#fbbf24" stroke="#d97706" stroke-width="2.5" />
      <ellipse cx="155" cy="110" rx="8" ry="10" fill="#fde68a" opacity="0.6" />
      <!-- Robot body -->
      <rect
        x="133"
        y="130"
        width="34"
        height="44"
        rx="8"
        fill="#f59e0b"
        stroke="#d97706"
        stroke-width="2.5"
      />
      <!-- Robot arms -->
      <rect
        x="121"
        y="140"
        width="12"
        height="28"
        rx="4"
        fill="#fbbf24"
        stroke="#d97706"
        stroke-width="2"
      />
      <rect
        x="167"
        y="140"
        width="12"
        height="28"
        rx="4"
        fill="#fbbf24"
        stroke="#d97706"
        stroke-width="2"
      />
      <!-- Eyes -->
      <circle cx="143" cy="102" r="4" fill="#1f2937" />
      <circle cx="157" cy="102" r="4" fill="#1f2937" />
      <circle cx="144" cy="101" r="1.5" fill="#60a5fa" />
      <circle cx="158" cy="101" r="1.5" fill="#60a5fa" />
      <!-- Antenna -->
      <line x1="150" y1="81" x2="150" y2="72" stroke="#d97706" stroke-width="2" />
      <circle cx="150" cy="70" r="3" fill="#ef4444" />
      <!-- Mouth -->
      <path
        d="M 145 112 Q 150 115 155 112"
        stroke="#1f2937"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
      />
      <!-- Conveyor belt with depth -->
      <rect x="50" y="178" width="180" height="10" fill="#6b7280" rx="2" />
      <rect x="50" y="175" width="180" height="8" fill="#9ca3af" rx="2" />
      <rect x="50" y="175" width="20" height="8" fill="#4b5563" rx="1" />
      <rect x="80" y="175" width="20" height="8" fill="#4b5563" rx="1" />
      <rect x="110" y="175" width="20" height="8" fill="#4b5563" rx="1" />
      <rect x="140" y="175" width="20" height="8" fill="#4b5563" rx="1" />
      <rect x="170" y="175" width="20" height="8" fill="#4b5563" rx="1" />
      <text x="150" y="200" text-anchor="middle" class="fill-black" font-size="15" font-weight="600"
        >Task Robot</text
      >
    </g>

    <g role="group" aria-label="Magic Cloud - handles special tasks like timers">
      <!-- Cloud background with gradient -->
      <defs>
        <linearGradient id="cloudBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#dbeafe;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bfdbfe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="640"
        y="40"
        width="280"
        height="180"
        rx="16"
        fill="url(#cloudBg)"
        stroke="#3b82f6"
        stroke-width="3"
      >
        <title>Magic Cloud: handles timers and web tasks</title>
      </rect>
      <!-- Decorative clouds -->
      <ellipse cx="670" cy="70" rx="18" ry="12" fill="#93c5fd" opacity="0.4" />
      <ellipse cx="685" cy="68" rx="15" ry="10" fill="#93c5fd" opacity="0.4" />
      <ellipse cx="880" cy="75" rx="15" ry="10" fill="#93c5fd" opacity="0.4" />
      <!-- Main cloud shape with better design -->
      <ellipse cx="780" cy="130" rx="45" ry="30" fill="#ffffff" opacity="0.6" />
      <ellipse cx="760" cy="125" rx="30" ry="22" fill="#ffffff" opacity="0.5" />
      <ellipse cx="800" cy="125" rx="30" ry="22" fill="#ffffff" opacity="0.5" />
      <!-- Server/Computer icon -->
      <rect
        x="763"
        y="115"
        width="34"
        height="24"
        rx="3"
        fill="#1e40af"
        stroke="#1e3a8a"
        stroke-width="1.5"
      />
      <rect x="766" y="119" width="28" height="4" rx="1" fill="#60a5fa" />
      <rect x="766" y="125" width="28" height="4" rx="1" fill="#93c5fd" />
      <rect x="766" y="131" width="28" height="4" rx="1" fill="#60a5fa" />
      <!-- LED lights -->
      <circle cx="770" cy="120" r="1.5" fill="#10b981" />
      <circle cx="775" cy="120" r="1.5" fill="#10b981" />
      <!-- Lightning bolts with glow -->
      <path
        d="M 710 100 L 714 106 L 711 106 L 715 112"
        stroke="#fbbf24"
        stroke-width="2.5"
        fill="none"
        stroke-linecap="round"
        opacity="0.8"
      />
      <path
        d="M 850 100 L 854 106 L 851 106 L 855 112"
        stroke="#fbbf24"
        stroke-width="2.5"
        fill="none"
        stroke-linecap="round"
        opacity="0.8"
      />
      <text x="780" y="215" text-anchor="middle" class="fill-black" font-size="15" font-weight="600"
        >Magic Cloud</text
      >
    </g>

    <g role="group" aria-label="Speedy Lane - quick tasks like promises">
      <!-- Fast lane background with gradient -->
      <defs>
        <linearGradient id="speedyBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fde047;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="40"
        y="340"
        width="280"
        height="120"
        rx="16"
        fill="url(#speedyBg)"
        stroke="#f59e0b"
        stroke-width="3"
      >
        <title>Speedy Lane: quick promise tasks</title>
      </rect>
      <!-- Road with depth -->
      <rect x="50" y="383" width="260" height="30" fill="#9ca3af" rx="4" />
      <rect x="50" y="380" width="260" height="28" fill="#d1d5db" rx="4" />
      <!-- Dashed center line -->
      <rect x="50" y="392" width="40" height="4" fill="#fbbf24" rx="1" />
      <rect x="100" y="392" width="40" height="4" fill="#fbbf24" rx="1" />
      <rect x="150" y="392" width="40" height="4" fill="#fbbf24" rx="1" />
      <rect x="200" y="392" width="40" height="4" fill="#fbbf24" rx="1" />
      <rect x="250" y="392" width="40" height="4" fill="#fbbf24" rx="1" />
      <!-- Speed signs with checkered pattern -->
      <rect
        x="60"
        y="330"
        width="30"
        height="20"
        rx="3"
        fill="#1f2937"
        stroke="#ef4444"
        stroke-width="2"
      />
      <rect x="62" y="332" width="5" height="5" fill="#ffffff" />
      <rect x="67" y="337" width="5" height="5" fill="#ffffff" />
      <rect x="72" y="332" width="5" height="5" fill="#ffffff" />
      <rect x="77" y="337" width="5" height="5" fill="#ffffff" />
      <rect x="82" y="332" width="5" height="5" fill="#ffffff" />
      <rect
        x="280"
        y="330"
        width="30"
        height="20"
        rx="3"
        fill="#1f2937"
        stroke="#ef4444"
        stroke-width="2"
      />
      <rect x="282" y="332" width="5" height="5" fill="#ffffff" />
      <rect x="287" y="337" width="5" height="5" fill="#ffffff" />
      <rect x="292" y="332" width="5" height="5" fill="#ffffff" />
      <rect x="297" y="337" width="5" height="5" fill="#ffffff" />
      <rect x="302" y="332" width="5" height="5" fill="#ffffff" />
      <!-- Race car with details -->
      <ellipse cx="180" cy="379" rx="28" ry="18" fill="#dc2626" />
      <rect x="155" y="370" width="50" height="18" rx="8" fill="#ef4444" />
      <!-- Windshield -->
      <rect x="175" y="372" width="20" height="8" rx="3" fill="#60a5fa" opacity="0.7" />
      <!-- Wheels -->
      <circle cx="165" cy="388" r="6" fill="#1f2937" stroke="#6b7280" stroke-width="1.5" />
      <circle cx="195" cy="388" r="6" fill="#1f2937" stroke="#6b7280" stroke-width="1.5" />
      <circle cx="165" cy="388" r="3" fill="#4b5563" />
      <circle cx="195" cy="388" r="3" fill="#4b5563" />
      <!-- Speed lines -->
      <line x1="140" y1="373" x2="150" y2="373" stroke="#9ca3af" stroke-width="2" opacity="0.6" />
      <line x1="135" y1="379" x2="148" y2="379" stroke="#9ca3af" stroke-width="2" opacity="0.6" />
      <line x1="140" y1="385" x2="150" y2="385" stroke="#9ca3af" stroke-width="2" opacity="0.6" />
      <text x="180" y="440" text-anchor="middle" class="fill-black" font-size="15" font-weight="600"
        >Speedy Lane</text
      >
    </g>

    <g role="group" aria-label="Waiting Line - regular tasks like timers">
      <!-- Queue background with gradient -->
      <defs>
        <linearGradient id="queueBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fee2e2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fecaca;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="360"
        y="300"
        width="320"
        height="150"
        rx="16"
        fill="url(#queueBg)"
        stroke="#ef4444"
        stroke-width="3"
      >
        <title>Waiting Line: regular tasks wait here</title>
      </rect>
      <!-- Queue rope barriers -->
      <rect x="375" y="365" width="3" height="50" fill="#7c2d12" />
      <rect x="615" y="365" width="3" height="50" fill="#7c2d12" />
      <ellipse cx="375" cy="365" rx="5" ry="3" fill="#991b1b" />
      <ellipse cx="615" cy="365" rx="5" ry="3" fill="#991b1b" />
      <path d="M 378 368 Q 410 375 442 368" stroke="#7c2d12" stroke-width="2" fill="none" />
      <path d="M 442 368 Q 474 375 506 368" stroke="#7c2d12" stroke-width="2" fill="none" />
      <path d="M 506 368 Q 538 375 570 368" stroke="#7c2d12" stroke-width="2" fill="none" />
      <path d="M 570 368 Q 592 375 612 368" stroke="#7c2d12" stroke-width="2" fill="none" />
      <!-- People in line with variety -->
      <!-- Person 1 -->
      <circle cx="400" cy="387" r="9" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
      <circle cx="398" cy="385" r="2" fill="#1f2937" />
      <circle cx="402" cy="385" r="2" fill="#1f2937" />
      <rect
        x="394"
        y="396"
        width="12"
        height="16"
        rx="2"
        fill="#f59e0b"
        stroke="#d97706"
        stroke-width="1.5"
      />
      <!-- Person 2 -->
      <circle cx="432" cy="387" r="9" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
      <circle cx="430" cy="385" r="2" fill="#1f2937" />
      <circle cx="434" cy="385" r="2" fill="#1f2937" />
      <rect
        x="426"
        y="396"
        width="12"
        height="16"
        rx="2"
        fill="#fbbf24"
        stroke="#d97706"
        stroke-width="1.5"
      />
      <!-- Person 3 -->
      <circle cx="464" cy="387" r="9" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
      <circle cx="462" cy="385" r="2" fill="#1f2937" />
      <circle cx="466" cy="385" r="2" fill="#1f2937" />
      <rect
        x="458"
        y="396"
        width="12"
        height="16"
        rx="2"
        fill="#f59e0b"
        stroke="#d97706"
        stroke-width="1.5"
      />
      <!-- Person 4 -->
      <circle cx="496" cy="387" r="9" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
      <circle cx="494" cy="385" r="2" fill="#1f2937" />
      <circle cx="498" cy="385" r="2" fill="#1f2937" />
      <rect
        x="490"
        y="396"
        width="12"
        height="16"
        rx="2"
        fill="#fbbf24"
        stroke="#d97706"
        stroke-width="1.5"
      />
      <!-- Person 5 -->
      <circle cx="528" cy="387" r="9" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
      <circle cx="526" cy="385" r="2" fill="#1f2937" />
      <circle cx="530" cy="385" r="2" fill="#1f2937" />
      <rect
        x="522"
        y="396"
        width="12"
        height="16"
        rx="2"
        fill="#f59e0b"
        stroke="#d97706"
        stroke-width="1.5"
      />
      <!-- Direction arrow -->
      <path
        d="M 560 390 L 590 390 M 590 390 L 583 383 M 590 390 L 583 397"
        stroke="#dc2626"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
      <text x="520" y="440" text-anchor="middle" class="fill-black" font-size="15" font-weight="600"
        >Waiting Line</text
      >
    </g>

    <g role="group" aria-label="Magic Conveyor - moves tasks around">
      <!-- Conveyor background with gradient -->
      <defs>
        <linearGradient id="conveyorBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ede9fe;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ddd6fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="700"
        y="300"
        width="280"
        height="150"
        rx="16"
        fill="url(#conveyorBg)"
        stroke="#7c3aed"
        stroke-width="3"
      >
        <title>Magic Conveyor: moves tasks to run</title>
      </rect>
      <!-- Support pillars -->
      <rect x="705" y="398" width="8" height="25" fill="#6b7280" rx="2" />
      <rect x="785" y="398" width="8" height="25" fill="#6b7280" rx="2" />
      <rect x="865" y="398" width="8" height="25" fill="#6b7280" rx="2" />
      <!-- Conveyor belt with 3D effect -->
      <rect x="690" y="393" width="220" height="10" fill="#4b5563" rx="3" />
      <rect x="690" y="390" width="220" height="8" fill="#6b7280" rx="3" />
      <!-- Moving segments with alternating pattern -->
      <rect x="690" y="390" width="18" height="8" fill="#374151" rx="1" />
      <rect x="718" y="390" width="18" height="8" fill="#4b5563" rx="1" />
      <rect x="746" y="390" width="18" height="8" fill="#374151" rx="1" />
      <rect x="774" y="390" width="18" height="8" fill="#4b5563" rx="1" />
      <rect x="802" y="390" width="18" height="8" fill="#374151" rx="1" />
      <rect x="830" y="390" width="18" height="8" fill="#4b5563" rx="1" />
      <rect x="858" y="390" width="18" height="8" fill="#374151" rx="1" />
      <rect x="886" y="390" width="18" height="8" fill="#4b5563" rx="1" />
      <!-- Side guards -->
      <rect x="688" y="387" width="224" height="2" fill="#fbbf24" rx="1" />
      <rect x="688" y="401" width="224" height="2" fill="#fbbf24" rx="1" />
      <!-- Control panel with more details -->
      <rect
        x="780"
        y="330"
        width="80"
        height="24"
        rx="4"
        fill="#374151"
        stroke="#1f2937"
        stroke-width="1"
      />
      <!-- Status lights -->
      <circle cx="795" cy="342" r="4" fill="#10b981" />
      <circle cx="810" cy="342" r="4" fill="#10b981" />
      <circle cx="825" cy="342" r="4" fill="#fbbf24" />
      <circle cx="840" cy="342" r="4" fill="#10b981" />
      <!-- Light glow effect -->
      <circle cx="795" cy="342" r="3" fill="#34d399" opacity="0.6" />
      <circle cx="810" cy="342" r="3" fill="#34d399" opacity="0.6" />
      <circle cx="825" cy="342" r="3" fill="#fcd34d" opacity="0.6" />
      <circle cx="840" cy="342" r="3" fill="#34d399" opacity="0.6" />
      <!-- Circular motion indicator -->
      <circle
        cx="930"
        cy="335"
        r="10"
        fill="none"
        stroke="#a78bfa"
        stroke-width="2"
        opacity="0.5"
      />
      <path
        d="M 935 335 L 940 330 L 938 335 L 943 333"
        stroke="#a78bfa"
        stroke-width="2"
        fill="none"
      />
      <text x="840" y="440" text-anchor="middle" class="fill-black" font-size="15" font-weight="600"
        >Magic Conveyor</text
      >
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
