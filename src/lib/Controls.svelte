<script>
  export let running = false;
  export let speed = 1;
  export let scenario = "timer-vs-promise";
  export let soundOn = false;
  export let onPlay = () => {};
  export let onPause = () => {};
  export let onRestart = () => {};
  export let onScenarioChange = () => {};
  export let onSpeedChange = () => {};
  export let onSoundToggle = () => {};
</script>

<div class="flex flex-wrap items-center gap-3 w-full" aria-label="Simulation controls">
  <div class="flex items-center gap-2">
    <label class="text-xs font-semibold tracking-wide uppercase opacity-70">Scenario</label>
    <select
      class="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm min-h-11"
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

  <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 min-h-11">
    <input
      type="checkbox"
      bind:checked={soundOn}
      class="accent-blue-600"
      on:change={() => onSoundToggle && onSoundToggle(soundOn)}
    /> Sound
  </label>

  <div class="flex items-center gap-2 ml-auto">
    <label class="text-xs font-semibold tracking-wide uppercase opacity-70">Speed</label>
    <input
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

<style>
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
