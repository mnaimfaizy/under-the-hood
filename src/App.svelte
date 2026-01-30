<script>
  import Stage from "./lib/Stage.svelte";
  import Controls from "./lib/Controls.svelte";
  import Legend from "./lib/Legend.svelte";
  import { createRunner } from "./lib/sim/engine";
  import {
    scenarioTimerVsPromise,
    scenarioTwoLogs,
    scenarioFetchRobot,
    scenarioMicrotaskChain,
    scenarioNestedTimeouts,
    scenarioAsyncAwait,
    scenarioDomClick,
  } from "./lib/sim/scenarios";
  import NewJSEngine3D from "./lib/NewJSEngine3D.svelte";
  import KidModeMapping from "./lib/KidModeMapping.svelte";

  // UI state
  let speed = 1; // 1x
  let running = false;
  let narration = "Ready to explore the JavaScript playground.";
  // Mode: 'kid' | 'pro' | 'newengine'
  let mode = "kid";
  // Simple logs for Pro Mode
  let logs = [];
  let scenario = "timer-vs-promise";

  // Stage API to call instance methods
  let stageApi;

  // Runner instance
  const runner = createRunner({
    onEvent: (e) => {
      stageApi && stageApi.handleSimEvent(e);
      updateNarration(e);
      if (soundOn) tick();
      if (mode === "pro") addLog(e);
      if (e.type === "scenario-end") {
        running = false;
      }
    },
    speed: 800,
  });

  function loadSelectedScenario() {
    if (scenario === "timer-vs-promise") runner.load(scenarioTimerVsPromise());
    else if (scenario === "two-logs") runner.load(scenarioTwoLogs());
    else if (scenario === "fetch-robot") runner.load(scenarioFetchRobot());
    else if (scenario === "microtask-chain") runner.load(scenarioMicrotaskChain());
    else if (scenario === "nested-timeouts") runner.load(scenarioNestedTimeouts());
    else if (scenario === "async-await") runner.load(scenarioAsyncAwait());
    else if (scenario === "dom-click") runner.load(scenarioDomClick());
  }

  loadSelectedScenario();

  function updateNarration(event) {
    const kidFriendly = mode === "kid";

    switch (event.type) {
      case "sync":
        if (kidFriendly) {
          narration = event.description || "The Task Robot is working on something!";
        } else {
          narration = event.description || "JS is doing a step on the Call Stack.";
        }
        break;
      case "token-move":
        narration = friendlyMove(event);
        break;
      case "token-remove":
        narration = event.description || "Task completed and removed! ✅";
        break;
      case "scenario-end":
        narration = "All done! Want to play again? 🎉";
        break;
      default:
        narration = event.description || "Something is happening...";
    }
  }

  function addLog(event) {
    const msg = (() => {
      if (event.type === "token-move") return `${event.token.label} -> ${event.to}`;
      if (event.type === "microtask-drain") return "Drain microtasks";
      if (event.type === "macrotask-run") return "Run one macrotask";
      if (event.type === "sync") return event.description || "Sync step";
      if (event.type === "scenario-end") return "Scenario completed";
      return event.type;
    })();
    logs = [...logs, { t: Date.now(), msg }].slice(-100);
  }

  function friendlyMove(e) {
    const kidMap = {
      "call-stack": "Task Robot",
      call_stack: "Task Robot",
      callstack: "Task Robot",
      "web-api": "Magic Cloud",
      webapi: "Magic Cloud",
      web_api: "Magic Cloud",
      "microtask-queue": "Speedy Lane",
      microtask_queue: "Speedy Lane",
      micro: "Speedy Lane",
      "macrotask-queue": "Waiting Line",
      macrotask_queue: "Waiting Line",
      macro: "Waiting Line",
    };
    const proMap = {
      "call-stack": "Call Stack",
      call_stack: "Call Stack",
      callstack: "Call Stack",
      "web-api": "Web APIs",
      webapi: "Web APIs",
      web_api: "Web APIs",
      "microtask-queue": "Microtask Queue",
      microtask_queue: "Microtask Queue",
      micro: "Microtask Queue",
      "macrotask-queue": "Macrotask Queue",
      macrotask_queue: "Macrotask Queue",
      macro: "Macrotask Queue",
    };
    const map = mode === "kid" ? kidMap : proMap;
    const location = map[e.to] || e.to;
    return `${e.token.label} moves to ${location}!`;
  }

  function onPlay() {
    running = true;
    stageApi && stageApi.playTimeline();
    runner.play();
  }
  function onPause() {
    running = false;
    stageApi && stageApi.pauseTimeline();
    runner.pause();
  }
  function onRestart() {
    running = false;
    stageApi && stageApi.pauseTimeline();
    stageApi && stageApi.resetTimeline();
    stageApi && stageApi.resetTokens();
    runner.reset();
    loadSelectedScenario();
    narration = "Scenario reset. Press Play to start!";
  }

  function onStepForward() {
    running = false;
    runner.pause();
    runner.step();
  }

  function onStepBackward() {
    running = false;
    runner.pause();

    // To go back, we need to replay from start to previous position
    const currentStep = runner.getCurrentStep();
    if (currentStep > 0) {
      const targetStep = currentStep - 1;
      runner.reset();
      stageApi?.resetTokens?.();

      // Step through to target position
      for (let i = 0; i < targetStep; i++) {
        runner.step();
      }

      narration = `Stepped back to position ${targetStep + 1}/${runner.getTotalSteps()}`;
    } else {
      narration = "Already at the beginning!";
    }
  }

  // Bind speed slider (0.25x–3x) to ms per step
  $: if (runner) {
    const base = 800; // ms per step
    runner.setSpeed(base / speed);
  }

  // Keyboard accessibility
  function onKeydown(e) {
    if (e.key === " " || e.key === "Enter") {
      running ? onPause() : onPlay();
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      runner.step();
      stageApi && stageApi.stepTimeline();
    }
  }

  // Dark mode persistence
  const THEME_KEY = "uth-theme";
  function loadTheme() {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else if (stored === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
      // If no stored preference, let CSS @media query handle it
    } catch {
      // localStorage not accessible; ignore preference load
    }
  }
  if (typeof window !== "undefined") loadTheme();
  function toggleTheme() {
    if (typeof window === "undefined") return;
    const wasDark = document.documentElement.classList.contains("dark");
    const wasLight = document.documentElement.classList.contains("light");

    // Determine current effective theme
    let currentlyDark = wasDark;
    if (!wasDark && !wasLight) {
      // No explicit class, check OS preference
      currentlyDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Toggle to opposite
    if (currentlyDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      try {
        window.localStorage.setItem(THEME_KEY, "light");
      } catch {
        // Ignore localStorage errors (e.g., privacy mode)
      }
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      try {
        window.localStorage.setItem(THEME_KEY, "dark");
      } catch {
        // Ignore localStorage errors (e.g., privacy mode)
      }
    }
  }

  // Optional sound cue (muted by default)
  let soundOn = false;
  let audioCtx = null;
  function tick() {
    // reuse a single audio context
    audioCtx = audioCtx || new window.AudioContext();
    const ctx = audioCtx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(660, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.09);
  }
</script>

<svelte:window on:keydown={onKeydown} />

<main class="min-h-screen flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
  <header class="flex flex-wrap gap-4 items-center justify-between">
    <div>
      <h1
        class="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400"
      >
        Under the Hood: JavaScript
      </h1>
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 max-w-prose">
        Visualize how the event loop schedules work using kid-friendly metaphors—and peek deeper in
        Pro Mode.
      </p>
    </div>
    <div class="flex items-center gap-3 ml-auto flex-wrap">
      <!-- Audience Mode: Kid vs Pro -->
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
        <button
          class="text-xs font-medium px-2 py-1 rounded transition-colors {mode !== 'pro' &&
          mode !== 'hifi'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
          on:click={() => {
            mode = "kid";
            logs = [];
            loadSelectedScenario();
          }}
          aria-pressed={mode === "kid"}
        >
          🎮 Kid
        </button>
        <button
          class="text-xs font-medium px-2 py-1 rounded transition-colors {mode === 'pro'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
          on:click={() => {
            mode = "pro";
            logs = [];
            loadSelectedScenario();
          }}
          aria-pressed={mode === "pro"}
        >
          🔧 Pro
        </button>
      </div>

      <!-- View Mode Selector -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500 dark:text-gray-400">View:</span>
        <select
          class="text-xs px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={mode === "kid" || mode === "pro" ? "basic" : mode}
          on:change={(e) => {
            const val = e.currentTarget.value;
            if (val === "basic") {
              mode = mode === "pro" ? "pro" : "kid";
            } else {
              mode = val;
            }
            logs = [];
            stageApi?.pauseTimeline?.();
            stageApi?.resetTimeline?.();
            stageApi?.resetTokens?.();
            loadSelectedScenario();
          }}
          aria-label="Select visualization mode"
          data-testid="view-mode-select"
        >
          <option value="basic">Basic (2D)</option>
          <option value="newengine">🚀 3D Visualization</option>
        </select>
      </div>

      <!-- Theme Toggle -->
      <button
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle dark mode"
        on:click={toggleTheme}
        title="Toggle theme"
      >
        <svg
          class="w-5 h-5 text-gray-600 dark:text-gray-400 dark:hidden"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        <svg
          class="w-5 h-5 text-yellow-400 hidden dark:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>
    </div>
  </header>

  <section
    class="surface shadow-sm p-3 md:p-5 relative overflow-hidden"
    aria-label="Simulation stage and controls"
  >
    <div
      class="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.15),transparent_60%)]"
    ></div>

    <div class={mode === "kid" ? "kid-mode-layout" : ""}>
      {#if mode === "kid"}
        <div class="stage-container">
          <Stage bind:api={stageApi} {mode} />
        </div>
        <div class="sidebar-container">
          <KidModeMapping />
        </div>
      {:else if mode === "newengine"}
        <NewJSEngine3D bind:api={stageApi} />
      {:else}
        <Stage bind:api={stageApi} {mode} />
      {/if}
    </div>
  </section>

  <section class="flex flex-col gap-4">
    <Controls
      {running}
      {speed}
      {scenario}
      {soundOn}
      {onPlay}
      {onPause}
      {onRestart}
      {onStepForward}
      {onStepBackward}
      onScenarioChange={(v) => {
        scenario = v;
        onRestart();
      }}
      onSpeedChange={(v) => (speed = v)}
      onSoundToggle={(v) => (soundOn = v)}
    />

    {#if mode !== "newengine"}
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        <section class="flex-1 flex flex-col gap-3" aria-label="Narration">
          <div
            aria-live="polite"
            class="text-base md:text-lg text-gray-700 dark:text-gray-200 font-medium"
            aria-atomic="true"
            data-testid="narration"
          >
            {narration}
          </div>
        </section>
        <div class="md:w-1/3" aria-label="Legend container">
          <Legend {mode} />
        </div>
      </div>
    {/if}
  </section>

  {#if mode === "pro"}
    <aside class="grid gap-5 md:grid-cols-2" aria-label="Pro Mode Panels">
      <div class="surface-alt p-4 shadow-sm">
        <h2 class="panel-title mb-2">Logs</h2>
        <div
          class="h-48 overflow-auto text-xs md:text-sm space-y-1 font-mono pr-1"
          data-testid="logs"
        >
          {#each logs as item}
            <div class="text-gray-700 dark:text-gray-300">
              {new Date(item.t).toLocaleTimeString()} — {item.msg}
            </div>
          {/each}
          {#if logs.length === 0}
            <div class="text-gray-500">No logs yet. Press Play.</div>
          {/if}
        </div>
      </div>
      <div class="surface-alt p-4 shadow-sm">
        <h2 class="panel-title mb-2">Tips</h2>
        <ul
          class="list-disc list-inside text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-1"
        >
          <li>Parser → Ignition compiles quickly; TurboFan optimizes hot code paths.</li>
          <li>Promises (microtasks) always run before timers (macrotasks) in a turn.</li>
          <li>GC is like a tiny robot tidying memory spaces between tasks.</li>
        </ul>
      </div>
    </aside>
  {/if}
</main>

<style>
  .kid-mode-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
    align-items: start;
  }

  .stage-container {
    min-width: 0; /* Allow flex shrink */
  }

  .sidebar-container {
    position: sticky;
    top: 1rem;
  }

  @media (max-width: 1024px) {
    .kid-mode-layout {
      grid-template-columns: 1fr;
    }

    .sidebar-container {
      position: static;
    }
  }
</style>
