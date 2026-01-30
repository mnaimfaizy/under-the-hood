<script>
  export let mode = "kid";
  const items = [
    { kind: "sync", label: "Sync Task", shape: "rounded", desc: "Runs on the Call Stack now" },
    {
      kind: "micro",
      label: "Microtask (Promise)",
      shape: "square",
      desc: "VIP lane before timers",
    },
    { kind: "macro", label: "Macrotask (Timer)", shape: "pill", desc: "Runs after microtasks" },
    { kind: "webapi", label: "Web API (Fetch)", shape: "mid", desc: "Handled by browser helper" },
  ];
</script>

<div class="legend" aria-label="Token legend" role="group">
  {#each items as item}
    <div class="legend-row" tabindex="0" aria-describedby={`legend-${item.kind}-desc`}>
      <svg width="42" height="28" viewBox="0 0 84 44" aria-hidden="true">
        {#if item.kind === "sync"}
          <rect x="2" y="2" width="80" height="40" rx="14" class="shape sync" />
        {:else if item.kind === "micro"}
          <rect x="2" y="2" width="80" height="40" rx="8" class="shape micro" />
        {:else if item.kind === "macro"}
          <rect x="2" y="2" width="80" height="40" rx="22" class="shape macro" />
        {:else if item.kind === "webapi"}
          <rect x="2" y="2" width="80" height="40" rx="10" class="shape webapi" />
        {/if}
      </svg>
      <div class="info">
        <span class="label">{item.label}</span>
        {#if mode === "pro"}<span id={`legend-${item.kind}-desc`} class="desc">{item.desc}</span
          >{/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .legend {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .legend-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid rgb(var(--border));
    border-radius: var(--radius-md);
    background: rgb(var(--surface));
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .legend-row:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: rgb(var(--accent));
  }
  .legend-row:hover svg {
    transform: scale(1.1);
  }
  .legend-row:focus-visible {
    outline: 2px solid rgb(var(--accent));
    outline-offset: 2px;
  }
  .label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: color 0.2s ease;
  }
  .legend-row:hover .label {
    color: rgb(var(--accent));
  }
  .desc {
    display: block;
    font-size: 0.6rem;
    opacity: 0.6;
  }
  svg {
    width: 36px;
    height: 24px;
    transition: transform 0.2s ease;
  }
  .shape {
    stroke-width: 2;
    transition: all 0.2s ease;
  }
  .legend-row:hover .shape {
    stroke-width: 3;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  .shape.sync {
    fill: #ffffff;
    stroke: #111827;
  }
  .legend-row:hover .shape.sync {
    fill: #f3f4f6;
  }
  .shape.micro {
    fill: #e0f2fe;
    stroke: #1e3a8a;
  }
  .legend-row:hover .shape.micro {
    fill: #bae6fd;
    stroke: #1d4ed8;
  }
  .shape.macro {
    fill: #fee2e2;
    stroke: #7f1d1d;
  }
  .legend-row:hover .shape.macro {
    fill: #fecaca;
    stroke: #b91c1c;
  }
  .shape.webapi {
    fill: #ecfccb;
    stroke: #065f46;
  }
  .legend-row:hover .shape.webapi {
    fill: #d9f99d;
    stroke: #047857;
  }
  :global(html.dark) .legend-row {
    background: rgb(var(--surface-alt));
  }
  :global(html.dark) .legend-row:hover {
    background: rgb(var(--surface));
  }
</style>
