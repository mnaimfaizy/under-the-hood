<script>
  export let width = 960;
  export let height = 540;

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

  // Token state: { id, kind, label, color, x, y }
  let tokens = [];

  // Master GSAP timeline
  let timeline = gsap.timeline({ paused: true });

  // Receive simulation events and map to token motions
  /**
   * Handles a simulation event and animates tokens accordingly.
   * @param {object} event - Simulation event
   */
  export function handleSimEvent(event) {
    // Example event: { type: 'push_stack', token }
    // Map event type to token movement
    let targetBlock = null;
    switch (event.type) {
      case 'push_stack':
        targetBlock = 'callStack';
        break;
      case 'offload_to_webapi':
        targetBlock = 'webAPIs';
        break;
      case 'enqueue_micro':
        targetBlock = 'microtaskQueue';
        break;
      case 'enqueue_macro':
        targetBlock = 'macrotaskQueue';
        break;
      case 'loop_cycle_start':
        targetBlock = 'eventLoop';
        break;
      default:
        targetBlock = null;
    }
    if (targetBlock && event.token) {
      // Find or add token
      let idx = tokens.findIndex(t => t.id === event.token.id);
      if (idx === -1) {
        tokens.push({ ...event.token, ...getAnchor(targetBlock) });
        idx = tokens.length - 1;
      } else {
        // Animate token to new position
        timeline.to(tokens[idx], {
          x: getAnchor(targetBlock).x,
          y: getAnchor(targetBlock).y,
          duration: 0.5,
          ease: 'power2.inOut',
        }, '+=0');
      }
    }
  }

  // Expose timeline controls
  export function playTimeline() { timeline.play(); }
  export function pauseTimeline() { timeline.pause(); }
  export function stepTimeline() { timeline.seek(timeline.time() + 0.5); }
  export function resetTimeline() { timeline.seek(0).pause(); }
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
