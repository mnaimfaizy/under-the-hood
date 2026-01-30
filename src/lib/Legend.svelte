<script>
  export let mode = "kid";
  const items = [
    {
      kind: "sync",
      label: "Sync Task",
      shape: "rounded",
      desc: "Runs on the Call Stack now",
      icon: "⚡",
    },
    {
      kind: "micro",
      label: "Microtask (Promise)",
      shape: "square",
      desc: "VIP lane before timers",
      icon: "🚀",
    },
    {
      kind: "macro",
      label: "Macrotask (Timer)",
      shape: "pill",
      desc: "Runs after microtasks",
      icon: "⏱️",
    },
    {
      kind: "webapi",
      label: "Web API (Fetch)",
      shape: "mid",
      desc: "Handled by browser helper",
      icon: "🌐",
    },
  ];
</script>

<div class="legend" aria-label="Token legend" role="group">
  {#each items as item}
    <div class="legend-row" aria-describedby={`legend-${item.kind}-desc`} tabindex="0">
      <div class="legend-icon-wrapper {item.kind}">
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
      </div>
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
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    border: 1.5px solid rgb(var(--border));
    border-radius: var(--radius-xl);
    background: linear-gradient(145deg, rgb(var(--surface)) 0%, rgb(var(--surface-alt)) 100%);
    box-shadow:
      var(--shadow-sm),
      inset 0 1px 0 rgb(255 255 255 / 0.5);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
  }

  .legend-row::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgb(var(--accent) / 0) 0%, rgb(var(--accent) / 0.08) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .legend-row:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow:
      var(--shadow-lg),
      0 0 0 2px rgb(var(--accent) / 0.15);
    border-color: rgb(var(--accent) / 0.4);
  }

  .legend-row:hover::before {
    opacity: 1;
  }

  .legend-row:hover svg {
    transform: scale(1.2) rotate(-3deg);
  }

  .legend-row:focus-visible {
    outline: 2px solid rgb(var(--accent));
    outline-offset: 3px;
  }

  .legend-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.1875rem;
  }

  .label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(var(--fg));
    transition: color 0.25s ease;
  }

  .legend-row:hover .label {
    color: rgb(var(--accent));
  }

  .desc {
    display: block;
    font-size: 0.625rem;
    color: rgb(var(--muted));
    font-weight: 500;
    line-height: 1.4;
  }

  svg {
    width: 44px;
    height: 28px;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
  }

  .shape {
    stroke-width: 2.5;
    transition: all 0.3s ease;
  }

  .legend-row:hover .shape {
    stroke-width: 3;
  }

  .shape.sync {
    fill: #f8fafc;
    stroke: #475569;
  }

  .legend-row:hover .shape.sync {
    fill: #f1f5f9;
    stroke: #334155;
  }

  .shape.micro {
    fill: #dbeafe;
    stroke: #3b82f6;
  }

  .legend-row:hover .shape.micro {
    fill: #bfdbfe;
    stroke: #2563eb;
  }

  .shape.macro {
    fill: #fce7f3;
    stroke: #ec4899;
  }

  .legend-row:hover .shape.macro {
    fill: #fbcfe8;
    stroke: #db2777;
  }

  .shape.webapi {
    fill: #dcfce7;
    stroke: #22c55e;
  }

  .legend-row:hover .shape.webapi {
    fill: #bbf7d0;
    stroke: #16a34a;
  }

  :global(html.dark) .legend-row {
    background: linear-gradient(135deg, rgb(var(--surface-alt)) 0%, rgb(var(--surface)) 100%);
  }

  :global(html.dark) .legend-row:hover {
    background: rgb(var(--surface));
  }

  :global(html.dark) .shape.sync {
    fill: #374151;
    stroke: #9ca3af;
  }

  :global(html.dark) .shape.micro {
    fill: #1e3a5f;
    stroke: #60a5fa;
  }

  :global(html.dark) .shape.macro {
    fill: #4c1d2e;
    stroke: #f472b6;
  }

  :global(html.dark) .shape.webapi {
    fill: #064e3b;
    stroke: #34d399;
  }
</style>
