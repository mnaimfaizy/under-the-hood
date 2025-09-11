<script>
  import Stage from './lib/Stage.svelte'
  let speed = 1
  let running = false

  function onPlay() { running = true }
  function onPause() { running = false }
  function onRestart() { /* placeholder */ }
</script>

<main class="min-h-screen flex flex-col gap-4 p-4 md:p-8 max-w-6xl mx-auto">
  <header class="flex items-center justify-between">
    <h1 class="text-2xl md:text-3xl font-bold">Under the Hood: JavaScript</h1>
    <nav class="text-sm text-gray-500">Kid Mode</nav>
  </header>

  <section class="rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 p-3 md:p-4">
    <Stage />
  </section>

  <section class="flex flex-wrap items-center gap-3">
    <button class="px-4 py-2 rounded-md bg-blue-600 text-white" on:click={onPlay}>Play</button>
    <button class="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800" on:click={onPause}>Pause</button>
    <button class="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800" on:click={onRestart}>Restart</button>

    <label class="ml-auto flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      Speed
      <input type="range" min="0.25" max="3" step="0.25" bind:value={speed} class="accent-blue-600" />
      <span class="w-10 text-right">{speed}×</span>
    </label>
  </section>

  <section aria-live="polite" class="text-base md:text-lg text-gray-700 dark:text-gray-200">
    The gatekeeper checks the slide. Promises go first!
  </section>
</main>
