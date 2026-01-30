<script>
  export let running = false;
  export let speed = 1;
  export let scenario = "timer-vs-promise";
  export let soundOn = false;
  export let onPlay = () => {};
  export let onPause = () => {};
  export let onRestart = () => {};
  export let onStepForward = () => {};
  export let onStepBackward = () => {};
  export let onScenarioChange = () => {};
  export let onSpeedChange = () => {};
  export let onSoundToggle = () => {};

  // Scenario descriptions
  const scenarioDescriptions = {
    "two-logs": "Watch how JavaScript runs two simple tasks in order on the Task Robot.",
    "timer-vs-promise": "See which runs first: a Quick Task (promise) or a Wait Task (timer)?",
    "fetch-robot": "Watch how a Fetch Task gets data from the Magic Cloud!",
    "microtask-chain":
      "See multiple Quick Tasks zoom through the Speedy Lane before Wait Tasks get their turn.",
    "nested-timeouts": "Watch Wait Tasks line up and run one by one in the Waiting Line.",
    "async-await": "See how async functions pause and resume in the Speedy Lane.",
    "dom-click": "Watch what happens when you click a button on a webpage!",
  };

  $: currentDescription =
    scenarioDescriptions[scenario] || "Select a scenario to learn about JavaScript!";
</script>

<div class="controls-wrapper" aria-label="Simulation controls">
  <!-- Scenario Info -->
  <div class="scenario-info">
    <div class="flex items-center gap-2">
      <label for="scenario-select" class="text-xs font-semibold tracking-wide uppercase opacity-70"
        >Scenario</label
      >
      <select
        id="scenario-select"
        class="scenario-select px-3 py-2 rounded-md border min-h-11"
        bind:value={scenario}
        on:change={(e) => onScenarioChange && onScenarioChange(e.target.value)}
        aria-label="Choose scenario"
      >
        <option value="two-logs">Two Logs</option>
        <option value="timer-vs-promise">Timer vs Promise</option>
        <option value="fetch-robot">Fetch Robot</option>
        <option value="microtask-chain">Microtask Chain</option>
        <option value="nested-timeouts">Nested Timeouts</option>
        <option value="async-await">Async/Await</option>
        <option value="dom-click">DOM Click</option>
      </select>
    </div>
    <p class="scenario-description">{currentDescription}</p>
  </div>

  <!-- Playback Controls -->
  <div class="flex flex-wrap items-center gap-3 w-full">
    <div class="flex items-center gap-2">
      <button
        class="btn-primary min-w-[72px] min-h-11"
        on:click={onPlay}
        aria-pressed={running}
        aria-label="Play">Play</button
      >
      <button class="btn-neutral min-w-[72px] min-h-11" on:click={onPause} aria-label="Pause"
        >Pause</button
      >
      <button class="btn-neutral min-w-[84px] min-h-11" on:click={onRestart} aria-label="Restart"
        >Restart</button
      >
    </div>

    <div class="flex items-center gap-2">
      <button
        class="btn-neutral min-w-[42px] min-h-11 text-lg"
        on:click={onStepBackward}
        aria-label="Step backward"
        title="Previous step">◀</button
      >
      <button
        class="btn-neutral min-w-[42px] min-h-11 text-lg"
        on:click={onStepForward}
        aria-label="Step forward"
        title="Next step">▶</button
      >
    </div>

    <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 min-h-11">
      <input
        type="checkbox"
        bind:checked={soundOn}
        class="accent-blue-600"
        on:change={() => onSoundToggle && onSoundToggle(soundOn)}
      /> Sound
    </label>

    <div class="flex items-center gap-2 ml-auto">
      <label for="speed-slider" class="text-xs font-semibold tracking-wide uppercase opacity-70"
        >Speed</label
      >
      <input
        id="speed-slider"
        type="range"
        min="0.25"
        max="3"
        step="0.25"
        bind:value={speed}
        on:input={(e) => onSpeedChange && onSpeedChange(parseFloat(e.target.value))}
        class="accent-blue-600"
        aria-label="Playback speed"
      />
      <span class="text-sm tabular-nums font-mono" aria-live="polite">{speed}×</span>
    </div>
  </div>
</div>

<style>
  .controls-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .scenario-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .scenario-description {
    font-size: 0.875rem;
    color: rgb(var(--muted));
    font-style: italic;
    line-height: 1.4;
  }

  .scenario-select {
    background: rgb(var(--surface));
    color: rgb(var(--fg));
    border-color: rgb(var(--border));
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .scenario-select option {
    background: rgb(var(--surface));
    color: rgb(var(--fg));
  }

  .scenario-select:hover {
    border-color: rgb(var(--accent));
  }

  @media (max-width: 900px) {
    div[aria-label="Simulation controls"] {
      flex-direction: column;
      align-items: stretch;
    }
    div[aria-label="Simulation controls"] > * {
      width: 100%;
    }
    div[aria-label="Simulation controls"] select {
      flex: 1;
    }
  }
</style>
