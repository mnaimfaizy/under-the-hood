<script>
  import { onMount, afterUpdate } from "svelte";
  import gsap from "gsap";
  export let x = 0;
  export let y = 0;
  export let kind = "sync"; // 'sync' | 'micro' | 'macro' | 'webapi'
  export let label = "";
  export let color = "#fff";

  let tokenEl;

  // Icon mapping
  const icons = {
    sync: "", // No icon for sync
    micro: "🔗", // Promise
    macro: "⏱", // Timer
    webapi: "🌐", // Fetch/API
  };

  // Reduced motion preference
  let prefersReducedMotion = false;
  onMount(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion = mq.matches;
    const handler = (e) => (prefersReducedMotion = e.matches);
    mq.addEventListener?.("change", handler);
  });

  // Animate position changes (respect reduced motion)
  afterUpdate(() => {
    if (!tokenEl) return;
    if (prefersReducedMotion) {
      // No animation; jump to position
      gsap.set(tokenEl, { x, y });
    } else {
      gsap.to(tokenEl, { x, y, duration: 0.5, ease: "power2.out" });
    }
  });
</script>

<g bind:this={tokenEl} style="cursor: pointer;" role="img" aria-label={`${label} token`}>
  {#if kind === "sync"}
    <rect
      x="-40"
      y="-22"
      width="80"
      height="44"
      rx="14"
      fill={color}
      stroke="#111827"
      stroke-width="2"
      filter="url(#tokenShadow)"
    />
  {:else if kind === "micro"}
    <rect
      x="-40"
      y="-22"
      width="80"
      height="44"
      rx="8"
      fill={color}
      stroke="#1e3a8a"
      stroke-width="2"
      filter="url(#tokenShadow)"
    />
  {:else if kind === "macro"}
    <rect
      x="-40"
      y="-22"
      width="80"
      height="44"
      rx="22"
      fill={color}
      stroke="#7f1d1d"
      stroke-width="2"
      filter="url(#tokenShadow)"
    />
  {:else if kind === "webapi"}
    <rect
      x="-40"
      y="-22"
      width="80"
      height="44"
      rx="10"
      fill={color}
      stroke="#065f46"
      stroke-width="2"
      filter="url(#tokenShadow)"
    />
  {/if}
  <text x="-28" y="6" font-size="22">{icons[kind]}</text>
  <text
    x="0"
    y="6"
    font-size="16"
    text-anchor="middle"
    style="font-weight:600; letter-spacing:0.5px;">{label}</text
  >
</g>

<style>
  /* Add focus/contrast styles for accessibility */
  /* If we later make tokens focusable, add focus ring styles here */
  g:hover text {
    opacity: 0.95;
  }
</style>
