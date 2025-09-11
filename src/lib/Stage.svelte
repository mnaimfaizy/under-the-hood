<script>
  export let width = 960;
  export let height = 540;
  // Expose methods to parent via bind:api
  export let api = {};

  // Anchor points for each block (center positions)
  const anchorMap = {
    'callStack': { x: 150, y: 130 },
    'webAPIs': { x: 810, y: 130 },
    'microtaskQueue': { x: 180, y: 400 },
    'macrotaskQueue': { x: 500, y: 400 },
    'eventLoop': { x: 800, y: 400 }
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
  import Token from './Token.svelte';
  import gsap from 'gsap';
  import { onMount } from 'svelte';

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
    if (event.type === 'token-move' && event.token) {
      let targetBlock = null;
      switch (event.to) {
        case 'call-stack':
        case 'call_stack':
        case 'callstack':
          targetBlock = 'callStack';
          break;
        case 'web-api':
        case 'webapi':
        case 'web_api':
          targetBlock = 'webAPIs';
          break;
        case 'microtask-queue':
        case 'microtask_queue':
        case 'micro':
          targetBlock = 'microtaskQueue';
          break;
        case 'macrotask-queue':
        case 'macrotask_queue':
        case 'macro':
          targetBlock = 'macrotaskQueue';
          break;
        default:
          targetBlock = null;
      }
      if (targetBlock) {
        const anchor = getAnchor(targetBlock);
        const toKind = (type) => {
          switch (type) {
            case 'timer':
            case 'macrotask':
              return 'macro';
            case 'promise':
            case 'microtask':
              return 'micro';
            case 'fetch':
              return 'webapi';
            default:
              return 'sync';
          }
        };
        let idx = tokens.findIndex(t => t.id === event.token.id);
        if (idx === -1) {
          tokens = [
            ...tokens,
            { id: event.token.id, kind: toKind(event.token.type), label: event.token.label, color: event.token.color, x: anchor.x, y: anchor.y }
          ];
        } else {
          tokens = tokens.map((t, i) => i === idx ? { ...t, x: anchor.x, y: anchor.y } : t);
        }
      }
    }
  }

  // Expose timeline controls
  function playTimeline() { timeline.play(); }
  function pauseTimeline() { timeline.pause(); }
  function stepTimeline() { timeline.seek(timeline.time() + 0.5); }
  function resetTimeline() { timeline.seek(0).pause(); }
  function resetTokens() { tokens = []; }

  // Bind API for parent
  api = { handleSimEvent, playTimeline, pauseTimeline, stepTimeline, resetTimeline, resetTokens };
</script>

<svg {width} {height} viewBox={`0 0 ${width} ${height}`} class="w-full h-auto">
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
    <text x="150" y="135" text-anchor="middle" class="fill-black" font-size="18">Call Stack</text>
  </g>

  <g>
    <rect x="700" y="60" width="220" height="140" rx="12" fill="#ecfccb" stroke="#65a30d" />
    <text x="810" y="135" text-anchor="middle" class="fill-black" font-size="18">Web APIs</text>
  </g>

  <g>
    <rect x="40" y="340" width="280" height="120" rx="12" fill="#fef3c7" stroke="#d97706" />
    <text x="180" y="405" text-anchor="middle" class="fill-black" font-size="18">Microtask Queue</text>
  </g>

  <g>
    <rect x="360" y="340" width="280" height="120" rx="12" fill="#fee2e2" stroke="#ef4444" />
    <text x="500" y="405" text-anchor="middle" class="fill-black" font-size="18">Macrotask Queue</text>
  </g>

  <g>
    <rect x="680" y="340" width="240" height="120" rx="12" fill="#ede9fe" stroke="#7c3aed" />
    <text x="800" y="405" text-anchor="middle" class="fill-black" font-size="18">Event Loop</text>
  </g>
  <!-- Render tokens -->
  {#each tokens as token (token.id)}
    <Token {...token} />
  {/each}
  <!-- End of SVG content -->
</svg>

<style>
  .fill-black { fill: #111827; }
  :global(html.dark) .fill-black { fill: #f3f4f6; }
</style>
