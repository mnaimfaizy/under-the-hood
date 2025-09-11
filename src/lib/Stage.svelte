<script>
  export let width = 960;
  export let height = 540;
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
</svg>

<style>
  .fill-black { fill: #111827; }
  :global(html.dark) .fill-black { fill: #f3f4f6; }
</style>
