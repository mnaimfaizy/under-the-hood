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
  <div class="scenario-section">
    <div class="scenario-header">
      <label for="scenario-select" class="scenario-label">Scenario</label>
      <select
        id="scenario-select"
        class="scenario-select"
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
  <div class="playback-controls">
    <div class="button-group primary-actions">
      <button
        class="btn-primary play-btn"
        on:click={onPlay}
        aria-pressed={running}
        aria-label="Play"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clip-rule="evenodd"
          />
        </svg>
        Play
      </button>
      <button class="btn-neutral" on:click={onPause} aria-label="Pause">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        Pause
      </button>
      <button class="btn-neutral" on:click={onRestart} aria-label="Restart">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clip-rule="evenodd"
          />
        </svg>
        Restart
      </button>
    </div>

    <div class="button-group step-actions">
      <button
        class="btn-icon"
        on:click={onStepBackward}
        aria-label="Step backward"
        title="Previous step"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
          />
        </svg>
      </button>
      <button class="btn-icon" on:click={onStepForward} aria-label="Step forward" title="Next step">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z"
          />
        </svg>
      </button>
    </div>

    <label class="sound-toggle">
      <input
        type="checkbox"
        bind:checked={soundOn}
        on:change={() => onSoundToggle && onSoundToggle(soundOn)}
      />
      <span class="toggle-switch"></span>
      <span class="toggle-label">Sound</span>
    </label>

    <div class="speed-control">
      <label for="speed-slider" class="speed-label">Speed</label>
      <div class="speed-slider-wrapper">
        <input
          id="speed-slider"
          type="range"
          min="0.25"
          max="3"
          step="0.25"
          bind:value={speed}
          on:input={(e) => onSpeedChange && onSpeedChange(parseFloat(e.target.value))}
          aria-label="Playback speed"
        />
        <span class="speed-value">{speed}×</span>
      </div>
    </div>
  </div>
</div>

<style>
  .controls-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    padding: 1.5rem;
    background: linear-gradient(145deg, rgb(var(--surface)) 0%, rgb(var(--surface-alt)) 100%);
    border: 1px solid rgb(var(--border) / 0.8);
    border-radius: var(--radius-2xl);
    box-shadow:
      var(--shadow-lg),
      inset 0 1px 0 rgb(255 255 255 / 0.5);
    position: relative;
    overflow: hidden;
  }

  .controls-wrapper::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 60% 40% at 0% 0%,
      rgb(var(--accent) / 0.03) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  .scenario-section {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    position: relative;
  }

  .scenario-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .scenario-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgb(var(--accent));
    opacity: 0.8;
  }

  .scenario-description {
    font-size: 0.875rem;
    color: rgb(var(--muted));
    font-style: italic;
    line-height: 1.6;
    padding: 0.625rem 0;
    position: relative;
    padding-left: 1rem;
    border-left: 2px solid rgb(var(--accent) / 0.2);
  }

  .scenario-select {
    background: rgb(var(--bg));
    color: rgb(var(--fg));
    border: 1.5px solid rgb(var(--border));
    border-radius: var(--radius-lg);
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.75rem 1.125rem;
    padding-right: 2.75rem;
    cursor: pointer;
    box-shadow:
      var(--shadow-sm),
      inset 0 1px 0 rgb(255 255 255 / 0.5);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236366f1' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 0.625rem center;
    background-repeat: no-repeat;
    background-size: 1.25em 1.25em;
  }

  .scenario-select:hover {
    border-color: rgb(var(--accent));
    box-shadow:
      var(--shadow-md),
      0 0 0 3px rgb(var(--accent) / 0.1);
    transform: translateY(-1px);
  }

  .scenario-select:focus {
    outline: none;
    border-color: rgb(var(--accent));
    box-shadow:
      var(--shadow-md),
      0 0 0 4px rgb(var(--accent) / 0.15);
  }

  .scenario-select option {
    background: rgb(var(--surface));
    color: rgb(var(--fg));
    padding: 0.5rem;
  }

  .playback-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.25rem;
  }

  .button-group {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .primary-actions button {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .play-btn {
    min-width: 110px;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    background: linear-gradient(180deg, rgb(var(--surface)) 0%, rgb(var(--surface-alt)) 100%);
    border: 1.5px solid rgb(var(--border));
    border-radius: var(--radius-lg);
    color: rgb(var(--fg));
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:
      var(--shadow-sm),
      inset 0 1px 0 rgb(255 255 255 / 0.5);
  }

  .btn-icon:hover {
    background: linear-gradient(180deg, rgb(var(--surface)) 0%, rgb(var(--surface)) 100%);
    border-color: rgb(var(--accent));
    color: rgb(var(--accent));
    box-shadow:
      var(--shadow-md),
      0 0 0 3px rgb(var(--accent) / 0.1);
    transform: translateY(-2px) scale(1.05);
  }

  .btn-icon:active {
    transform: translateY(0) scale(0.98);
  }

  .sound-toggle {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    cursor: pointer;
    user-select: none;
    padding: 0.625rem 0.875rem;
    border-radius: var(--radius-lg);
    transition: all 0.25s ease;
    border: 1px solid transparent;
  }

  .sound-toggle:hover {
    background: rgb(var(--surface-alt));
    border-color: rgb(var(--border) / 0.5);
  }

  .sound-toggle input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .toggle-switch {
    position: relative;
    width: 48px;
    height: 26px;
    background: linear-gradient(180deg, rgb(var(--border)) 0%, rgb(var(--surface-alt)) 100%);
    border-radius: 13px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.08);
  }

  .toggle-switch::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: linear-gradient(180deg, #fff 0%, #f1f5f9 100%);
    border-radius: 50%;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.15),
      0 1px 2px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .sound-toggle input:checked + .toggle-switch {
    background: linear-gradient(145deg, rgb(var(--accent)) 0%, rgb(var(--accent-dark)) 100%);
    box-shadow:
      inset 0 2px 4px rgb(0 0 0 / 0.15),
      0 0 12px rgb(var(--accent) / 0.3);
  }

  .sound-toggle input:checked + .toggle-switch::after {
    transform: translateX(22px);
  }

  .toggle-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgb(var(--fg));
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;
    padding: 0.625rem 1.25rem;
    background: linear-gradient(180deg, rgb(var(--bg)) 0%, rgb(var(--surface-alt)) 100%);
    border: 1.5px solid rgb(var(--border));
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
  }

  .speed-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgb(var(--accent));
    opacity: 0.8;
  }

  .speed-slider-wrapper {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .speed-slider-wrapper input[type="range"] {
    width: 120px;
    height: 6px;
    background: linear-gradient(90deg, rgb(var(--border)) 0%, rgb(var(--accent) / 0.3) 100%);
    border-radius: 3px;
    appearance: none;
    cursor: pointer;
  }

  .speed-slider-wrapper input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(
      145deg,
      rgb(var(--accent-light)) 0%,
      rgb(var(--accent)) 50%,
      rgb(var(--accent-dark)) 100%
    );
    border-radius: 50%;
    box-shadow:
      0 2px 8px rgb(var(--accent) / 0.5),
      inset 0 1px 1px rgb(255 255 255 / 0.3);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .speed-slider-wrapper input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow:
      0 4px 12px rgb(var(--accent) / 0.6),
      inset 0 1px 1px rgb(255 255 255 / 0.3);
  }

  .speed-slider-wrapper input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: linear-gradient(
      145deg,
      rgb(var(--accent-light)) 0%,
      rgb(var(--accent)) 50%,
      rgb(var(--accent-dark)) 100%
    );
    border-radius: 50%;
    border: none;
    box-shadow:
      0 2px 8px rgb(var(--accent) / 0.5),
      inset 0 1px 1px rgb(255 255 255 / 0.3);
    cursor: pointer;
  }

  .speed-value {
    font-size: 0.95rem;
    font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    color: rgb(var(--accent));
    min-width: 2.75rem;
    text-align: right;
    padding: 0.25rem 0.5rem;
    background: rgb(var(--accent) / 0.08);
    border-radius: var(--radius-md);
  }

  @media (max-width: 768px) {
    .playback-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .button-group {
      justify-content: center;
    }

    .speed-control {
      margin-left: 0;
      justify-content: center;
    }
  }
</style>
