<script>
  import { onMount, afterUpdate } from 'svelte';
  import gsap from 'gsap';
  export let x = 0;
  export let y = 0;
  export let kind = 'sync'; // 'sync' | 'micro' | 'macro' | 'webapi'
  export let label = '';
  export let color = '#fff';

  let tokenEl;

  // Icon mapping
  const icons = {
    sync: '', // No icon for sync
    micro: '🔗', // Promise
    macro: '⏱', // Timer
    webapi: '🌐' // Fetch/API
  };

  // Animate position changes
  afterUpdate(() => {
    if (tokenEl) {
      gsap.to(tokenEl, { x, y, duration: 0.5, ease: 'power2.out' });
    }
  });
</script>

<g bind:this={tokenEl} style="cursor: pointer;">
  <rect x="-40" y="-24" width="80" height="48" rx="16" fill={color} stroke="#333" stroke-width="2" />
  <text x="-28" y="6" font-size="24">{icons[kind]}</text>
  <text x="0" y="6" font-size="18" text-anchor="middle">{label}</text>
</g>

<style>
  /* Add focus/contrast styles for accessibility */
</style>
