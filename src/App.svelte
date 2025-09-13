<script>
  import Stage from "./lib/Stage.svelte";
  import HighFidelityStage from "./lib/HighFidelityStage.svelte";
  import Controls from "./lib/Controls.svelte";
  import Legend from "./lib/Legend.svelte";
  import { createRunner } from "./lib/sim/engine";
  import {
    scenarioTimerVsPromise,
    scenarioTwoLogs,
    scenarioFetchRobot,
    scenarioHiFiBasic,
    scenarioMicrotaskChain,
    scenarioNestedTimeouts,
    scenarioAsyncAwait,
    scenarioDomClick,
  } from "./lib/sim/scenarios";

  // UI state
  let speed = 1; // 1x
  let running = false;
  let narration = "Ready to explore the JavaScript playground.";
  let narrationHistory = [];
  let aggregateNarration = true; // show rolling history in Hi-Fi
  // Hi-Fi animation separate from logical simulation speed
  let animationSpeed = 1; // 0.25x - 3x
  let smoothAnim = true; // smooth GSAP timeScale transitions
  // Mode: 'kid' | 'pro' | 'hifi'
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
    if (mode === "hifi") {
      runner.load(scenarioHiFiBasic());
      return;
    }
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
    switch (event.type) {
      case "sync":
        narration = event.description || "JS is doing a step on the Call Stack.";
        break;
      case "token-move":
        narration = friendlyMove(event);
        break;
      case "microtask-drain":
        narration = event.description || "Promises zoom ahead in the VIP lane (microtasks)!";
        break;
      case "macrotask-run":
        narration = event.description || "Timers wait their turn in the big line (macrotasks).";
        break;
      case "scenario-end":
        narration = "All done! Want to play again?";
        break;
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
    const map = {
      "call-stack": "the Call Stack",
      "web-api": "the Web APIs area",
      "microtask-queue": "the microtask VIP lane",
      "macrotask-queue": "the macrotask line",
    };
    return `${e.token.label} moves to ${map[e.to] || e.to}.`;
  }

  function onPlay() {
    running = true;
    stageApi && stageApi.playTimeline();
    if (mode === "hifi" && stageApi?.setTimeScale) {
      stageApi.setTimeScale(speed);
    }
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
  }

  // Bind speed slider (0.25x–3x) to ms per step (base 800ms)
  $: runner && runner.setSpeed(800 / speed);
  // Hi-Fi: adjust animation time scale separately
  $: if (mode === "hifi" && stageApi?.setTimeScale) {
    stageApi.setTimeScale(animationSpeed);
  }
  // Hi-Fi: toggle smooth speed easing
  $: if (mode === "hifi" && stageApi?.setSmoothSpeed) {
    stageApi.setSmoothSpeed(smoothAnim);
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
      if (stored) {
        document.documentElement.classList.toggle("dark", stored === "dark");
      } else {
        const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", prefers);
      }
    } catch {
      // localStorage not accessible; ignore preference load
    }
  }
  if (typeof window !== "undefined") loadTheme();
  function toggleTheme() {
    if (typeof window === "undefined") return;
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {
      // ignore persistence errors
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
    <div class="flex items-center gap-6 ml-auto">
      <div class="flex items-center gap-4">
        <label class="inline-flex items-center gap-2 text-sm font-medium select-none">
          <input
            type="checkbox"
            role="switch"
            aria-checked={mode === "pro"}
            aria-label="Toggle Pro Mode"
            class="h-4 w-4 accent-blue-600"
            on:change={(e) => {
              mode = e.currentTarget.checked ? "pro" : "kid";
              logs = [];
              loadSelectedScenario();
            }}
          />
          {mode === "pro" ? "Pro Mode" : "Kid Mode"}
        </label>
        <button
          class="btn-neutral text-xs px-3 py-2"
          on:click={() => {
            mode = mode === "hifi" ? "kid" : "hifi";
            logs = [];
            loadSelectedScenario();
          }}
          aria-label="Toggle High Fidelity View"
        >
          {mode === "hifi" ? "Basic View" : "Hi-Fi View"}
        </button>
        <button
          class="btn-neutral text-xs px-3 py-2"
          aria-label="Toggle dark mode"
          on:click={toggleTheme}
        >
          Theme
        </button>
      </div>
    </div>
  </header>

  <section
    class="surface shadow-sm p-3 md:p-5 relative overflow-hidden"
    aria-label="Simulation stage and controls"
  >
    <div
      class="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.15),transparent_60%)]"
    ></div>
    {#if mode === "hifi"}
      <HighFidelityStage
        bind:api={stageApi}
        onNarrate={(l) => {
          narration = l;
          if (aggregateNarration) {
            narrationHistory = [...narrationHistory, { t: Date.now(), line: l }].slice(-20);
          }
        }}
      />
    {:else}
      <Stage bind:api={stageApi} {mode} />
    {/if}
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
      onScenarioChange={(v) => {
        scenario = v;
        onRestart();
      }}
      onSpeedChange={(v) => (speed = v)}
      onSoundToggle={(v) => (soundOn = v)}
    />
    {#if mode === "hifi"}
      <div
        class="flex flex-wrap items-center gap-4 mt-1"
        aria-label="High fidelity animation controls"
      >
        <label class="flex items-center gap-2 text-xs font-medium">
          Anim
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.25"
            bind:value={animationSpeed}
            class="accent-violet-600"
            aria-label="Animation speed"
          />
          <span class="tabular-nums font-mono"
            >{animationSpeed.toFixed(2).replace(/\.00$/, "")}×</span
          >
        </label>
        <label class="flex items-center gap-2 text-xs font-medium">
          <input
            type="checkbox"
            bind:checked={smoothAnim}
            class="accent-violet-600"
            aria-label="Smooth animation speed transitions"
          />
          Smooth
        </label>
        <button
          class="btn-neutral text-xs px-3 py-2"
          on:click={() => stageApi?.clearHistory?.()}
          aria-label="Clear token history">Clear History</button
        >
        <button
          class="btn-neutral text-xs px-3 py-2"
          on:click={() => stageApi?.exportHistory?.()}
          aria-label="Export token history">Export</button
        >
      </div>
    {/if}

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
        {#if mode === "hifi"}
          <div class="flex items-center gap-2 text-xs">
            <label class="inline-flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                bind:checked={aggregateNarration}
                class="accent-blue-600"
                aria-label="Toggle narration history"
              />
              History
            </label>
          </div>
          {#if aggregateNarration}
            <ol
              class="narration-history"
              aria-label="Narration history"
              data-empty={narrationHistory.length === 0}
            >
              {#each [...narrationHistory].slice().reverse() as h (h.t)}
                <li>{h.line}</li>
              {/each}
            </ol>
          {/if}
        {/if}
      </section>
      <div class="md:w-1/3" aria-label="Legend container">
        <Legend {mode} />
      </div>
    </div>
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
  .narration-history {
    margin: 0;
    padding-left: 1rem;
    list-style: disc;
    max-height: 160px;
    overflow: auto;
    font-size: 0.75rem;
    line-height: 1.1rem;
    color: var(--tw-prose-body, #4b5563);
  }
  .narration-history[data-empty="true"]::after {
    content: "(no history yet)";
    opacity: 0.5;
    font-style: italic;
    display: block;
    padding-left: 0.25rem;
  }
  .narration-history li {
    margin: 0 0 0.25rem;
  }
  :global(.dark) .narration-history {
    color: #d1d5db;
  }
</style>
