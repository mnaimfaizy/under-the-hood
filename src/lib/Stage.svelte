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
  class="w-full h-auto stage-svg"
  role="img"
  aria-label={mode === "pro"
    ? "JavaScript runtime and engine stage"
    : "JavaScript runtime playground stage"}
>
  <!-- Enhanced grid background with gradient -->
  <defs>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(100,116,139,0.06)" stroke-width="1" />
    </pattern>
    <pattern id="gridLarge" width="96" height="96" patternUnits="userSpaceOnUse">
      <path d="M 96 0 L 0 0 0 96" fill="none" stroke="rgba(100,116,139,0.1)" stroke-width="1" />
    </pattern>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#f1f5f9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="bgGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
    <filter id="tokenShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.12" />
    </filter>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.1" />
    </filter>
    <filter id="glowPurple" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feFlood flood-color="#8b5cf6" flood-opacity="0.3" />
      <feComposite in2="blur" operator="in" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background layers -->
  <rect width="100%" height="100%" class="stage-bg" rx="20" />
  <rect width="100%" height="100%" fill="url(#grid)" class="stage-grid" rx="20" />
  <rect width="100%" height="100%" fill="url(#gridLarge)" class="stage-grid-lg" rx="20" />

  <!-- Placeholder blocks -->
  {#if mode === "kid"}
    <!-- Kid Mode: Fun characters and shapes that fill the areas -->
    <g role="group" aria-label="Task Robot - where tasks run one by one" filter="url(#cardShadow)">
      <!-- Robot factory background -->
      <defs>
        <linearGradient id="robotBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fef9c3;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fde047;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="robotBgStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#facc15;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#eab308;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="20"
        y="40"
        width="280"
        height="180"
        rx="20"
        fill="url(#robotBg)"
        stroke="url(#robotBgStroke)"
        stroke-width="3"
      >
        <title>Task Robot: runs tasks in order</title>
      </rect>
      <!-- Subtle inner highlight -->
      <rect
        x="24"
        y="44"
        width="272"
        height="172"
        rx="18"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      />
      <!-- Decorative gears -->
      <circle
        cx="265"
        cy="65"
        r="10"
        fill="none"
        stroke="#ca8a04"
        stroke-width="2"
        opacity="0.25"
      />
      <circle cx="282" cy="82" r="7" fill="none" stroke="#ca8a04" stroke-width="2" opacity="0.25" />
      <!-- Robot: head with shine -->
      <circle cx="160" cy="115" r="28" fill="#fbbf24" stroke="#ca8a04" stroke-width="3" />
      <ellipse cx="152" cy="108" rx="10" ry="12" fill="#fef3c7" opacity="0.7" />
      <!-- Robot body -->
      <rect
        x="130"
        y="134"
        width="40"
        height="50"
        rx="10"
        fill="#f59e0b"
        stroke="#ca8a04"
        stroke-width="3"
      />
      <!-- Body shine -->
      <rect x="134" y="138" width="12" height="20" rx="4" fill="rgba(255,255,255,0.3)" />
      <!-- Robot arms -->
      <rect
        x="116"
        y="144"
        width="14"
        height="32"
        rx="5"
        fill="#fbbf24"
        stroke="#ca8a04"
        stroke-width="2"
      />
      <rect
        x="170"
        y="144"
        width="14"
        height="32"
        rx="5"
        fill="#fbbf24"
        stroke="#ca8a04"
        stroke-width="2"
      />
      <!-- Eyes with glow -->
      <circle cx="148" cy="108" r="6" fill="#1f2937" />
      <circle cx="172" cy="108" r="6" fill="#1f2937" />
      <circle cx="150" cy="106" r="2" fill="#60a5fa" />
      <circle cx="174" cy="106" r="2" fill="#60a5fa" />
      <!-- Antenna with pulse -->
      <line
        x1="160"
        y1="82"
        x2="160"
        y2="70"
        stroke="#ca8a04"
        stroke-width="3"
        stroke-linecap="round"
      />
      <circle cx="160" cy="66" r="5" fill="#ef4444" />
      <circle cx="160" cy="66" r="3" fill="#fca5a5" />
      <!-- Happy mouth -->
      <path
        d="M 148 120 Q 160 128 172 120"
        stroke="#1f2937"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
      <!-- Conveyor belt with 3D effect -->
      <rect x="45" y="182" width="190" height="12" fill="#4b5563" rx="3" />
      <rect x="45" y="178" width="190" height="10" fill="#6b7280" rx="3" />
      <!-- Belt segments -->
      {#each [0, 30, 60, 90, 120, 150] as offset}
        <rect x={50 + offset} y="178" width="22" height="10" fill="#374151" rx="2" />
      {/each}
      <text x="160" y="208" text-anchor="middle" class="fill-black" font-size="14" font-weight="700"
        >Task Robot</text
      >
    </g>

    <g
      role="group"
      aria-label="Magic Cloud - handles special tasks like timers"
      filter="url(#cardShadow)"
    >
      <!-- Cloud background with gradient -->
      <defs>
        <linearGradient id="cloudBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#eff6ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bfdbfe;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="cloudBgStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="640"
        y="40"
        width="280"
        height="180"
        rx="20"
        fill="url(#cloudBg)"
        stroke="url(#cloudBgStroke)"
        stroke-width="3"
      >
        <title>Magic Cloud: handles timers and web tasks</title>
      </rect>
      <!-- Inner highlight -->
      <rect
        x="644"
        y="44"
        width="272"
        height="172"
        rx="18"
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        stroke-width="1"
      />
      <!-- Decorative floating clouds -->
      <ellipse cx="670" cy="70" rx="20" ry="14" fill="#93c5fd" opacity="0.5" />
      <ellipse cx="688" cy="66" rx="16" ry="11" fill="#93c5fd" opacity="0.4" />
      <ellipse cx="890" cy="72" rx="18" ry="12" fill="#93c5fd" opacity="0.4" />
      <!-- Main cloud cluster -->
      <ellipse cx="780" cy="125" rx="50" ry="34" fill="#ffffff" opacity="0.7" />
      <ellipse cx="755" cy="118" rx="35" ry="26" fill="#ffffff" opacity="0.6" />
      <ellipse cx="810" cy="120" rx="35" ry="26" fill="#ffffff" opacity="0.6" />
      <ellipse cx="780" cy="105" rx="28" ry="20" fill="#ffffff" opacity="0.5" />
      <!-- Server/Database icon -->
      <rect
        x="762"
        y="108"
        width="38"
        height="30"
        rx="4"
        fill="#1e40af"
        stroke="#1e3a8a"
        stroke-width="2"
      />
      <!-- Server stripes -->
      <rect x="766" y="113" width="30" height="5" rx="1.5" fill="#60a5fa" />
      <rect x="766" y="121" width="30" height="5" rx="1.5" fill="#93c5fd" />
      <rect x="766" y="129" width="30" height="5" rx="1.5" fill="#60a5fa" />
      <!-- LED lights -->
      <circle cx="770" cy="115" r="2" fill="#22c55e" />
      <circle cx="776" cy="115" r="2" fill="#22c55e" />
      <circle cx="782" cy="115" r="2" fill="#fbbf24" />
      <!-- Lightning bolts -->
      <g opacity="0.9">
        <path
          d="M 700 95 L 706 104 L 702 104 L 708 115"
          stroke="#facc15"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 860 95 L 866 104 L 862 104 L 868 115"
          stroke="#facc15"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <text x="780" y="215" text-anchor="middle" class="fill-black" font-size="14" font-weight="700"
        >Magic Cloud</text
      >
    </g>

    <g role="group" aria-label="Speedy Lane - quick tasks like promises" filter="url(#cardShadow)">
      <!-- Fast lane background with gradient -->
      <defs>
        <linearGradient id="speedyBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fef9c3;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fde047;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="speedyStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#facc15;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#eab308;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="40"
        y="280"
        width="280"
        height="160"
        rx="20"
        fill="url(#speedyBg)"
        stroke="url(#speedyStroke)"
        stroke-width="3"
      >
        <title>Speedy Lane: quick promise tasks</title>
      </rect>
      <!-- Inner highlight -->
      <rect
        x="44"
        y="284"
        width="272"
        height="152"
        rx="18"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      />
      <!-- Road with 3D depth effect -->
      <rect x="50" y="348" width="260" height="36" fill="#6b7280" rx="6" />
      <rect x="50" y="345" width="260" height="32" fill="#9ca3af" rx="6" />
      <rect x="50" y="345" width="260" height="28" fill="#d1d5db" rx="5" />
      <!-- Dashed center line -->
      {#each [0, 52, 104, 156, 208] as offset}
        <rect x={55 + offset} y="357" width="42" height="5" fill="#facc15" rx="2" />
      {/each}
      <!-- Start/Finish flags -->
      <g transform="translate(58, 298)">
        <rect width="32" height="22" rx="3" fill="#1f2937" stroke="#374151" stroke-width="1.5" />
        <!-- Checkered pattern -->
        <rect x="2" y="2" width="6" height="6" fill="#ffffff" />
        <rect x="8" y="8" width="6" height="6" fill="#ffffff" />
        <rect x="14" y="2" width="6" height="6" fill="#ffffff" />
        <rect x="20" y="8" width="6" height="6" fill="#ffffff" />
        <rect x="26" y="2" width="4" height="6" fill="#ffffff" />
        <rect x="2" y="14" width="6" height="6" fill="#ffffff" />
        <rect x="14" y="14" width="6" height="6" fill="#ffffff" />
        <rect x="26" y="14" width="4" height="6" fill="#ffffff" />
      </g>
      <g transform="translate(270, 298)">
        <rect width="32" height="22" rx="3" fill="#1f2937" stroke="#374151" stroke-width="1.5" />
        <rect x="2" y="2" width="6" height="6" fill="#ffffff" />
        <rect x="8" y="8" width="6" height="6" fill="#ffffff" />
        <rect x="14" y="2" width="6" height="6" fill="#ffffff" />
        <rect x="20" y="8" width="6" height="6" fill="#ffffff" />
        <rect x="26" y="2" width="4" height="6" fill="#ffffff" />
        <rect x="2" y="14" width="6" height="6" fill="#ffffff" />
        <rect x="14" y="14" width="6" height="6" fill="#ffffff" />
        <rect x="26" y="14" width="4" height="6" fill="#ffffff" />
      </g>
      <!-- Race car with details -->
      <g transform="translate(180, 340)">
        <ellipse cx="0" cy="8" rx="32" ry="20" fill="#dc2626" />
        <rect x="-28" y="0" width="56" height="20" rx="10" fill="#ef4444" />
        <!-- Car top/windshield -->
        <rect x="-8" y="2" width="24" height="10" rx="4" fill="#60a5fa" opacity="0.8" />
        <!-- Wheels -->
        <circle cx="-18" cy="18" r="8" fill="#1f2937" stroke="#4b5563" stroke-width="2" />
        <circle cx="18" cy="18" r="8" fill="#1f2937" stroke="#4b5563" stroke-width="2" />
        <circle cx="-18" cy="18" r="4" fill="#6b7280" />
        <circle cx="18" cy="18" r="4" fill="#6b7280" />
        <!-- Speed lines -->
        <line
          x1="-42"
          y1="2"
          x2="-34"
          y2="2"
          stroke="#9ca3af"
          stroke-width="3"
          opacity="0.7"
          stroke-linecap="round"
        />
        <line
          x1="-48"
          y1="10"
          x2="-36"
          y2="10"
          stroke="#9ca3af"
          stroke-width="3"
          opacity="0.7"
          stroke-linecap="round"
        />
        <line
          x1="-42"
          y1="18"
          x2="-34"
          y2="18"
          stroke="#9ca3af"
          stroke-width="3"
          opacity="0.7"
          stroke-linecap="round"
        />
      </g>
      <text x="180" y="420" text-anchor="middle" class="fill-black" font-size="14" font-weight="700"
        >Speedy Lane</text
      >
    </g>

    <g role="group" aria-label="Waiting Line - regular tasks like timers" filter="url(#cardShadow)">
      <!-- Queue background with gradient -->
      <defs>
        <linearGradient id="queueBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fce7f3;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fbcfe8;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="queueStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f472b6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="360"
        y="280"
        width="280"
        height="160"
        rx="20"
        fill="url(#queueBg)"
        stroke="url(#queueStroke)"
        stroke-width="3"
      >
        <title>Waiting Line: regular tasks wait here</title>
      </rect>
      <!-- Inner highlight -->
      <rect
        x="364"
        y="284"
        width="272"
        height="152"
        rx="18"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      />
      <!-- Queue rope barriers - posts -->
      <rect x="378" y="345" width="6" height="60" rx="2" fill="#881337" />
      <rect x="616" y="345" width="6" height="60" rx="2" fill="#881337" />
      <!-- Post caps -->
      <ellipse cx="381" cy="345" rx="8" ry="4" fill="#be185d" />
      <ellipse cx="619" cy="345" rx="8" ry="4" fill="#be185d" />
      <!-- Velvet ropes (curved) -->
      <path
        d="M 385 352 Q 430 365 475 352"
        stroke="#881337"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 475 352 Q 520 365 565 352"
        stroke="#881337"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 565 352 Q 592 360 615 352"
        stroke="#881337"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
      <!-- People in line - more expressive -->
      {#each [{ x: 408, color: "#fbbf24", bodyColor: "#f59e0b" }, { x: 450, color: "#fbbf24", bodyColor: "#fbbf24" }, { x: 492, color: "#fbbf24", bodyColor: "#f59e0b" }, { x: 534, color: "#fbbf24", bodyColor: "#fbbf24" }] as person, i}
        <g transform="translate({person.x}, 370)">
          <!-- Head with expression -->
          <circle cy="5" r="12" fill={person.color} stroke="#ca8a04" stroke-width="2" />
          <circle cx="-4" cy="2" r="2.5" fill="#1f2937" />
          <circle cx="4" cy="2" r="2.5" fill="#1f2937" />
          <path
            d="M -4 10 Q 0 {i % 2 === 0 ? '14' : '8'} 4 10"
            stroke="#1f2937"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
          />
          <!-- Body -->
          <rect
            x="-8"
            y="17"
            width="16"
            height="22"
            rx="4"
            fill={person.bodyColor}
            stroke="#ca8a04"
            stroke-width="1.5"
          />
        </g>
      {/each}
      <!-- Direction arrow -->
      <g transform="translate(580, 382)">
        <path
          d="M 0 0 L 25 0 M 25 0 L 18 -7 M 25 0 L 18 7"
          stroke="#be185d"
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <text x="500" y="420" text-anchor="middle" class="fill-black" font-size="14" font-weight="700"
        >Waiting Line</text
      >
    </g>

    <g role="group" aria-label="Magic Conveyor - moves tasks around" filter="url(#cardShadow)">
      <!-- Conveyor background with gradient -->
      <defs>
        <linearGradient id="conveyorBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#f3e8ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e9d5ff;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="conveyorStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="680"
        y="280"
        width="260"
        height="160"
        rx="20"
        fill="url(#conveyorBg)"
        stroke="url(#conveyorStroke)"
        stroke-width="3"
      >
        <title>Magic Conveyor: moves tasks to run</title>
      </rect>
      <!-- Inner highlight -->
      <rect
        x="684"
        y="284"
        width="252"
        height="152"
        rx="18"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      />
      <!-- Support pillars with 3D effect -->
      <rect x="700" y="380" width="12" height="35" fill="#4b5563" rx="3" />
      <rect x="700" y="380" width="6" height="35" fill="#6b7280" rx="3" />
      <rect x="800" y="380" width="12" height="35" fill="#4b5563" rx="3" />
      <rect x="800" y="380" width="6" height="35" fill="#6b7280" rx="3" />
      <rect x="900" y="380" width="12" height="35" fill="#4b5563" rx="3" />
      <rect x="900" y="380" width="6" height="35" fill="#6b7280" rx="3" />
      <!-- Conveyor belt with 3D effect -->
      <rect x="690" y="373" width="232" height="14" fill="#374151" rx="4" />
      <rect x="690" y="370" width="232" height="12" fill="#6b7280" rx="4" />
      <!-- Moving segments with alternating pattern -->
      {#each [0, 30, 60, 90, 120, 150, 180, 210] as offset}
        <rect
          x={692 + offset}
          y="370"
          width="22"
          height="12"
          fill={offset % 60 === 0 ? "#374151" : "#4b5563"}
          rx="2"
        />
      {/each}
      <!-- Side guards with glow -->
      <rect x="688" y="367" width="236" height="3" fill="#fbbf24" rx="1.5" />
      <rect x="688" y="385" width="236" height="3" fill="#fbbf24" rx="1.5" />
      <!-- Control panel with details -->
      <rect
        x="775"
        y="306"
        width="90"
        height="32"
        rx="6"
        fill="#1f2937"
        stroke="#374151"
        stroke-width="2"
      />
      <!-- Panel screen -->
      <rect x="780" y="311" width="50" height="22" rx="3" fill="#111827" />
      <!-- Status lights -->
      <circle cx="840" cy="315" r="4" fill="#10b981" opacity="0.9" />
      <circle cx="840" cy="315" r="2.5" fill="#34d399" opacity="0.7" />
      <circle cx="852" cy="315" r="4" fill="#10b981" opacity="0.9" />
      <circle cx="852" cy="315" r="2.5" fill="#34d399" opacity="0.7" />
      <circle cx="840" cy="327" r="4" fill="#fbbf24" opacity="0.9" />
      <circle cx="840" cy="327" r="2.5" fill="#fcd34d" opacity="0.7" />
      <circle cx="852" cy="327" r="4" fill="#10b981" opacity="0.9" />
      <circle cx="852" cy="327" r="2.5" fill="#34d399" opacity="0.7" />
      <!-- Rotating arrows indicator -->
      <g transform="translate(805, 322)">
        <circle r="16" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.4" />
        <path
          d="M -8 -8 A 12 12 0 0 1 8 -8"
          stroke="#a78bfa"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        <path
          d="M 8 8 A 12 12 0 0 1 -8 8"
          stroke="#a78bfa"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        <polygon points="10,-6 6,-12 4,-5" fill="#a78bfa" />
        <polygon points="-10,6 -6,12 -4,5" fill="#a78bfa" />
      </g>
      <text x="810" y="420" text-anchor="middle" class="fill-black" font-size="14" font-weight="700"
        >Magic Conveyor</text
      >
    </g>
  {:else}
    <!-- Pro Mode: Clean, professional blocks with subtle gradients -->
    <g role="group" aria-label="Call Stack block" filter="url(#cardShadow)">
      <defs>
        <linearGradient id="callStackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#e0f2fe;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bae6fd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="40"
        y="60"
        width="240"
        height="160"
        rx="16"
        fill="url(#callStackGrad)"
        stroke="#0284c7"
        stroke-width="2"
      >
        <title>Call Stack: where synchronous JS runs</title>
      </rect>
      <rect
        x="44"
        y="64"
        width="232"
        height="152"
        rx="14"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      />
      <text x="160" y="145" text-anchor="middle" class="fill-black" font-size="17" font-weight="700"
        >Call Stack</text
      >
    </g>

    <g role="group" aria-label="Web APIs block" filter="url(#cardShadow)">
      <defs>
        <linearGradient id="webApisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ecfccb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d9f99d;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="680"
        y="60"
        width="240"
        height="160"
        rx="16"
        fill="url(#webApisGrad)"
        stroke="#65a30d"
        stroke-width="2"
      >
        <title>Web APIs: timers, fetch, and more</title>
      </rect>
      <rect
        x="684"
        y="64"
        width="232"
        height="152"
        rx="14"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      />
      <text x="800" y="145" text-anchor="middle" class="fill-black" font-size="17" font-weight="700"
        >Web APIs</text
      >
    </g>

    <g role="group" aria-label="Microtask Queue block" filter="url(#cardShadow)">
      <defs>
        <linearGradient id="microGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fef9c3;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fde047;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="40"
        y="280"
        width="260"
        height="140"
        rx="16"
        fill="url(#microGrad)"
        stroke="#ca8a04"
        stroke-width="2"
      >
        <title>Microtask Queue: promises first</title>
      </rect>
      <rect
        x="44"
        y="284"
        width="252"
        height="132"
        rx="14"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      />
      <text x="170" y="355" text-anchor="middle" class="fill-black" font-size="16" font-weight="700"
        >Microtask Queue</text
      >
    </g>

    <g role="group" aria-label="Macrotask Queue block" filter="url(#cardShadow)">
      <defs>
        <linearGradient id="macroGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fce7f3;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fbcfe8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="340"
        y="280"
        width="260"
        height="140"
        rx="16"
        fill="url(#macroGrad)"
        stroke="#db2777"
        stroke-width="2"
      >
        <title>Macrotask Queue: timers and more</title>
      </rect>
      <rect
        x="344"
        y="284"
        width="252"
        height="132"
        rx="14"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      />
      <text x="470" y="355" text-anchor="middle" class="fill-black" font-size="16" font-weight="700"
        >Macrotask Queue</text
      >
    </g>

    <g role="group" aria-label="Event Loop block" filter="url(#cardShadow)">
      <defs>
        <linearGradient id="eventLoopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#f3e8ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e9d5ff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect
        x="640"
        y="280"
        width="240"
        height="140"
        rx="16"
        fill="url(#eventLoopGrad)"
        stroke="#9333ea"
        stroke-width="2"
      >
        <title>Event Loop: picks what runs next</title>
      </rect>
      <rect
        x="644"
        y="284"
        width="232"
        height="132"
        rx="14"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      />
      <text x="760" y="355" text-anchor="middle" class="fill-black" font-size="17" font-weight="700"
        >Event Loop</text
      >
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
    fill: #1e293b;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }
  :global(html.dark) .fill-black {
    fill: #e2e8f0;
  }
  .stage-svg {
    border-radius: var(--radius-xl, 1.5rem);
    overflow: hidden;
    box-shadow:
      inset 0 0 0 1px rgba(0, 0, 0, 0.05),
      0 0 0 1px rgba(255, 255, 255, 0.5);
  }
  .stage-bg {
    fill: url(#bgGradient);
    transition: fill 0.3s ease;
  }
  .stage-grid {
    opacity: 1;
    transition: opacity 0.3s ease;
  }
  .stage-grid-lg {
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }
  :global(html.dark) .stage-bg {
    fill: #0f172a;
  }
  :global(html.dark) .stage-grid {
    opacity: 0.3;
  }
  :global(html.dark) .stage-grid-lg {
    opacity: 0.2;
  }
  :global(html.dark) .stage-svg {
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
      0 0 40px rgba(99, 102, 241, 0.05);
  }
</style>
