<script>
  import Stage from "./lib/Stage.svelte";
  import { createRunner } from "./lib/sim/engine";
  import { scenarioTimerVsPromise, scenarioTwoLogs, scenarioFetchRobot } from "./lib/sim/scenarios";

  // UI state
  let speed = 1; // 1x
  let running = false;
  let narration = "Ready to explore the JavaScript playground.";
  // Mode: 'kid' | 'pro' (Kid Mode by default)
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
  }

  loadSelectedScenario();

  function updateNarration(event) {
    switch (event.type) {
      case "sync":
        narration = "JS is doing a step on the Call Stack.";
        break;
      case "token-move":
        narration = friendlyMove(event);
        break;
      case "microtask-drain":
        narration = "Promises zoom ahead in the VIP lane (microtasks)!";
        break;
      case "macrotask-run":
        narration = "Timers wait their turn in the big line (macrotasks).";
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

<main class="min-h-screen flex flex-col gap-4 p-4 md:p-8 max-w-6xl mx-auto">
  <header class="flex items-center justify-between">
    <h1 class="text-2xl md:text-3xl font-bold">Under the Hood: JavaScript</h1>
    <nav
      class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
      aria-label="Mode switcher"
    >
      <label class="inline-flex items-center gap-2">
        <input
          type="checkbox"
          role="switch"
          aria-checked={mode === "pro"}
          aria-label="Toggle Pro Mode"
          on:change={(e) => {
            mode = e.currentTarget.checked ? "pro" : "kid";
            logs = [];
          }}
        />
        {mode === "pro" ? "Pro Mode" : "Kid Mode"}
      </label>
    </nav>
  </header>

  <section
    class="rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 p-3 md:p-4"
    aria-label="Simulation stage and controls"
  >
    <Stage bind:api={stageApi} {mode} />
  </section>

  <section class="flex flex-wrap items-center gap-3">
    <select
      class="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800"
      bind:value={scenario}
      on:change={onRestart}
      aria-label="Choose scenario"
    >
      <option value="two-logs">Two Logs</option>
      <option value="timer-vs-promise">Timer vs Promise</option>
      <option value="fetch-robot">Fetch Robot</option>
    </select>

    <button
      class="px-4 py-2 rounded-md bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      on:click={onPlay}
      aria-pressed={running}
      aria-label="Play">Play</button
    >
    <button
      class="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      on:click={onPause}
      aria-label="Pause">Pause</button
    >
    <button
      class="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      on:click={onRestart}
      aria-label="Restart">Restart</button
    >

    <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <input type="checkbox" bind:checked={soundOn} /> Sound
    </label>

    <label class="ml-auto flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      Speed
      <input
        type="range"
        min="0.25"
        max="3"
        step="0.25"
        bind:value={speed}
        class="accent-blue-600"
      />
      <span class="w-10 text-right">{speed}×</span>
    </label>
  </section>

  <section
    aria-live="polite"
    class="text-base md:text-lg text-gray-700 dark:text-gray-200"
    aria-atomic="true"
    data-testid="narration"
  >
    {narration}
  </section>

  {#if mode === "pro"}
    <aside class="grid gap-2 md:grid-cols-2" aria-label="Pro Mode Panels">
      <div
        class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900"
      >
        <h2 class="font-semibold mb-2">Logs</h2>
        <div class="h-40 overflow-auto text-sm space-y-1" data-testid="logs">
          {#each logs as item}
            <div class="font-mono text-gray-700 dark:text-gray-300">
              {new Date(item.t).toLocaleTimeString()} — {item.msg}
            </div>
          {/each}
          {#if logs.length === 0}
            <div class="text-gray-500">No logs yet. Press Play.</div>
          {/if}
        </div>
      </div>
      <div
        class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900"
      >
        <h2 class="font-semibold mb-2">Tips</h2>
        <ul class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
          <li>Parser → Ignition compiles quickly; TurboFan optimizes hot code.</li>
          <li>Promises run before timers in the same tick.</li>
          <li>GC pauses are rare; think of a tiny cleaning robot.</li>
        </ul>
      </div>
    </aside>
  {/if}
</main>
