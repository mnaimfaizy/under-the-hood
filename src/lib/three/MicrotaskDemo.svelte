<script>
  import { onMount, onDestroy } from "svelte";
  import { MicrotaskQueue3D } from "./components/MicrotaskQueue3D";

  let canvasElement;
  let scene, camera, renderer;
  let microtaskQueue;
  let animationId;

  // Demo state
  let queueLength = 0;
  let processingRate = 1.0;
  let isProcessing = false;
  let totalProcessed = 0;
  let recentTasks = [];

  // Task type counters
  let taskCounts = {
    promise: 0,
    mutation: 0,
    queueMicrotask: 0,
    async: 0,
  };

  onMount(async () => {
    // Dynamically import Three.js
    const THREE = await import("three");

    // Set up the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a); // Darker background for glow effect

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 3, 0);

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    renderer.setSize(800, 600);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create the microtask queue
    microtaskQueue = new MicrotaskQueue3D({
      tubeRadius: 0.4,
      tubeLength: 20,
      particleCount: 50,
      flowSpeed: 2.0,
      glowIntensity: 1.5,
      vipColor: 0x00ffff,
    });
    scene.add(microtaskQueue);

    // Add lighting optimized for glow effects
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(20, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add VIP accent lighting
    const vipLight1 = new THREE.PointLight(0x00ffff, 0.8, 25);
    vipLight1.position.set(-10, 6, 0);
    scene.add(vipLight1);

    const vipLight2 = new THREE.PointLight(0x00ffff, 0.8, 25);
    vipLight2.position.set(10, 6, 0);
    scene.add(vipLight2);

    // Add a subtle ground plane
    const planeGeometry = new THREE.PlaneGeometry(40, 40);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.3,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;
    scene.add(plane);

    // Add orbit controls
    const { OrbitControls } = await import("three-orbitcontrols-ts");
    const controls = new OrbitControls(camera, canvasElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 3, 0);

    // Start animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);

      controls.update();

      if (microtaskQueue) {
        microtaskQueue.update(0.016); // Assume 60fps

        // Update reactive state
        queueLength = microtaskQueue.getQueueLength();
        processingRate = microtaskQueue.getProcessingRate();
      }

      renderer.render(scene, camera);
    }
    animate();
  });

  // Demo functions for different microtask types
  function addPromise() {
    if (microtaskQueue) {
      const id = microtaskQueue.addMicrotask("promise");
      taskCounts.promise++;
      addToRecentTasks("Promise", "promise");
      taskCounts = { ...taskCounts }; // Trigger reactivity
    }
  }

  function addMutationObserver() {
    if (microtaskQueue) {
      const id = microtaskQueue.addMicrotask("mutation");
      taskCounts.mutation++;
      addToRecentTasks("MutationObserver", "mutation");
      taskCounts = { ...taskCounts }; // Trigger reactivity
    }
  }

  function addQueueMicrotask() {
    if (microtaskQueue) {
      const id = microtaskQueue.addMicrotask("queueMicrotask");
      taskCounts.queueMicrotask++;
      addToRecentTasks("queueMicrotask()", "queueMicrotask");
      taskCounts = { ...taskCounts }; // Trigger reactivity
    }
  }

  function addAsyncFunction() {
    if (microtaskQueue) {
      const id = microtaskQueue.addMicrotask("async");
      taskCounts.async++;
      addToRecentTasks("Async Function", "async");
      taskCounts = { ...taskCounts }; // Trigger reactivity
    }
  }

  function addToRecentTasks(name, type) {
    const timestamp = new Date().toLocaleTimeString();
    recentTasks = [{ name, type, timestamp }, ...recentTasks].slice(0, 5);
  }

  function toggleProcessing() {
    isProcessing = !isProcessing;
    if (microtaskQueue) {
      microtaskQueue.setProcessing(isProcessing);
    }
  }

  function clearQueue() {
    if (microtaskQueue) {
      microtaskQueue.clearAllMicrotasks();
      queueLength = 0;
    }
  }

  function resetStats() {
    taskCounts = {
      promise: 0,
      mutation: 0,
      queueMicrotask: 0,
      async: 0,
    };
    totalProcessed = 0;
    recentTasks = [];
    clearQueue();
  }

  function autoDemo() {
    // Clear first
    resetStats();

    // Start processing
    if (!isProcessing) {
      toggleProcessing();
    }

    // Add a series of microtasks with realistic timing
    setTimeout(() => addPromise(), 200);
    setTimeout(() => addAsyncFunction(), 400);
    setTimeout(() => addMutationObserver(), 600);
    setTimeout(() => addPromise(), 800);
    setTimeout(() => addQueueMicrotask(), 1000);
    setTimeout(() => addPromise(), 1200);
    setTimeout(() => addAsyncFunction(), 1400);
    setTimeout(() => addMutationObserver(), 1600);

    // Add a burst of promises
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => addPromise(), i * 100);
      }
    }, 2000);
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (microtaskQueue) {
      microtaskQueue.dispose();
    }
    if (renderer) {
      renderer.dispose();
    }
  }

  // Cleanup on component destroy
  onDestroy(cleanup);
</script>

<div class="microtask-demo">
  <div class="demo-header">
    <h3>3D Microtask Queue - VIP Lane</h3>
    <div class="controls">
      <button on:click={addPromise} class="promise-btn"> Promise </button>
      <button on:click={addMutationObserver} class="mutation-btn"> MutationObserver </button>
      <button on:click={addQueueMicrotask} class="queuemicrotask-btn"> queueMicrotask() </button>
      <button on:click={addAsyncFunction} class="async-btn"> Async Function </button>
      <button on:click={toggleProcessing} class="toggle-btn {isProcessing ? 'active' : ''}">
        {isProcessing ? "Pause" : "Start"} Processing
      </button>
      <button on:click={clearQueue} class="clear-btn"> Clear Queue </button>
      <button on:click={autoDemo} class="demo-btn"> Auto Demo </button>
    </div>
  </div>

  <div class="canvas-container">
    <canvas bind:this={canvasElement} width="800" height="600"></canvas>

    <div class="queue-status">
      <h4>🚀 VIP Queue Status</h4>
      <div class="status-grid">
        <div class="status-item">
          <span class="label">Queue Length:</span>
          <span class="value">{queueLength}</span>
        </div>
        <div class="status-item">
          <span class="label">Processing:</span>
          <span class="value {isProcessing ? 'active' : 'inactive'}">
            {isProcessing ? "ACTIVE" : "PAUSED"}
          </span>
        </div>
        <div class="status-item">
          <span class="label">Speed:</span>
          <span class="value">{processingRate.toFixed(1)}x</span>
        </div>
      </div>

      <div class="task-counts">
        <h5>Task Counts:</h5>
        <div class="count-grid">
          <div class="count-item promise">
            <span class="count-label">Promises:</span>
            <span class="count-value">{taskCounts.promise}</span>
          </div>
          <div class="count-item mutation">
            <span class="count-label">MutationObserver:</span>
            <span class="count-value">{taskCounts.mutation}</span>
          </div>
          <div class="count-item queuemicrotask">
            <span class="count-label">queueMicrotask:</span>
            <span class="count-value">{taskCounts.queueMicrotask}</span>
          </div>
          <div class="count-item async">
            <span class="count-label">Async Functions:</span>
            <span class="count-value">{taskCounts.async}</span>
          </div>
        </div>
      </div>

      {#if recentTasks.length > 0}
        <div class="recent-tasks">
          <h5>Recent Tasks:</h5>
          <div class="task-list">
            {#each recentTasks as task}
              <div class="task-item {task.type}">
                <span class="task-name">{task.name}</span>
                <span class="task-time">{task.timestamp}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="instructions">
    <h4>🌟 High-Priority Microtask Queue (VIP Lane):</h4>
    <ul>
      <li>
        <strong>Glowing Tube:</strong> Represents the microtask queue with VIP treatment (cyan glow)
      </li>
      <li>
        <strong>Particle Flow:</strong> Colored particles show different microtask types moving at high
        speed
      </li>
      <li>
        <strong>Priority System:</strong> MutationObserver (magenta) has highest priority, followed by
        async functions (blue)
      </li>
      <li>
        <strong>VIP Treatment:</strong> Curved path shows the "fast lane" nature - microtasks skip ahead
        of regular tasks
      </li>
      <li>
        <strong>Entrance/Exit:</strong> Green sphere (entrance) and orange sphere (exit to Event Loop)
      </li>
      <li>
        <strong>Processing State:</strong> Tube glow intensifies when actively processing microtasks
      </li>
      <li>
        <strong>Speed Indicators:</strong> Rotating lines show the high-speed processing
      </li>
      <li>
        <strong>Real-time Stats:</strong> Monitor shows queue length, processing state, and task type
        counts
      </li>
    </ul>
  </div>
</div>

<style>
  .microtask-demo {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 1100px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: var(--surface, #ffffff);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .demo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-color, #e5e7eb);
  }

  .demo-header h3 {
    margin: 0;
    color: var(--text-color, #1f2937);
    font-weight: 700;
    font-size: 1.5rem;
    background: linear-gradient(135deg, #00ffff, #0088ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .controls {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .controls button {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    color: white;
  }

  .promise-btn {
    background: #00ffff;
    color: #000;
    box-shadow: 0 2px 4px rgba(0, 255, 255, 0.3);
  }

  .promise-btn:hover {
    background: #00e6e6;
    transform: translateY(-1px);
  }

  .mutation-btn {
    background: #ff00ff;
    box-shadow: 0 2px 4px rgba(255, 0, 255, 0.3);
  }

  .mutation-btn:hover {
    background: #e600e6;
    transform: translateY(-1px);
  }

  .queuemicrotask-btn {
    background: #00ff88;
    color: #000;
    box-shadow: 0 2px 4px rgba(0, 255, 136, 0.3);
  }

  .queuemicrotask-btn:hover {
    background: #00e077;
    transform: translateY(-1px);
  }

  .async-btn {
    background: #4488ff;
    box-shadow: 0 2px 4px rgba(68, 136, 255, 0.3);
  }

  .async-btn:hover {
    background: #3377ee;
    transform: translateY(-1px);
  }

  .toggle-btn {
    background: #6b7280;
    box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3);
  }

  .toggle-btn.active {
    background: #10b981;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
  }

  .toggle-btn:hover {
    transform: translateY(-1px);
  }

  .clear-btn {
    background: #ef4444;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  }

  .clear-btn:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }

  .demo-btn {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    box-shadow: 0 2px 4px rgba(255, 107, 107, 0.3);
  }

  .demo-btn:hover {
    background: linear-gradient(135deg, #ff5252, #e55100);
    transform: translateY(-1px);
  }

  .canvas-container {
    position: relative;
    display: flex;
    justify-content: center;
    background: linear-gradient(135deg, #0a0a0a, #1a1a2e);
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #333;
  }

  canvas {
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 255, 255, 0.1);
  }

  .queue-status {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-family: "Monaco", "Menlo", monospace;
    font-size: 0.875rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(0, 255, 255, 0.3);
    min-width: 220px;
    max-height: 500px;
    overflow-y: auto;
  }

  .queue-status h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    color: #00ffff;
    text-shadow: 0 0 8px #00ffff;
  }

  .queue-status h5 {
    margin: 0.75rem 0 0.5rem 0;
    font-size: 0.9rem;
    color: #88ccff;
  }

  .status-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
  }

  .status-item .label {
    color: #ccc;
    font-size: 0.8rem;
  }

  .status-item .value {
    color: #fff;
    font-weight: bold;
  }

  .status-item .value.active {
    color: #00ff88;
    text-shadow: 0 0 4px #00ff88;
  }

  .status-item .value.inactive {
    color: #ff6b6b;
  }

  .count-grid {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .count-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem;
    border-radius: 4px;
    border-left: 3px solid;
  }

  .count-item.promise {
    border-left-color: #00ffff;
    background: rgba(0, 255, 255, 0.1);
  }

  .count-item.mutation {
    border-left-color: #ff00ff;
    background: rgba(255, 0, 255, 0.1);
  }

  .count-item.queuemicrotask {
    border-left-color: #00ff88;
    background: rgba(0, 255, 136, 0.1);
  }

  .count-item.async {
    border-left-color: #4488ff;
    background: rgba(68, 136, 255, 0.1);
  }

  .count-label {
    font-size: 0.75rem;
    color: #bbb;
  }

  .count-value {
    font-weight: bold;
    color: #fff;
  }

  .recent-tasks {
    margin-top: 1rem;
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-height: 120px;
    overflow-y: auto;
  }

  .task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    border-left: 2px solid;
  }

  .task-item.promise {
    border-left-color: #00ffff;
    background: rgba(0, 255, 255, 0.05);
  }

  .task-item.mutation {
    border-left-color: #ff00ff;
    background: rgba(255, 0, 255, 0.05);
  }

  .task-item.queuemicrotask {
    border-left-color: #00ff88;
    background: rgba(0, 255, 136, 0.05);
  }

  .task-item.async {
    border-left-color: #4488ff;
    background: rgba(68, 136, 255, 0.05);
  }

  .task-name {
    color: #fff;
    font-weight: 500;
  }

  .task-time {
    color: #999;
    font-size: 0.65rem;
  }

  .instructions {
    background: #f0f9ff;
    padding: 1.25rem;
    border-radius: 8px;
    border-left: 4px solid #00ffff;
  }

  .instructions h4 {
    margin: 0 0 0.75rem 0;
    color: #1f2937;
    font-weight: 600;
  }

  .instructions ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  .instructions li {
    margin-bottom: 0.5rem;
    color: #4b5563;
    line-height: 1.4;
  }

  .instructions strong {
    color: #1f2937;
  }

  /* Dark mode support */
  :global(.dark) .microtask-demo {
    background: var(--surface-dark, #1f2937);
  }

  :global(.dark) .demo-header {
    border-color: #374151;
  }

  :global(.dark) .instructions {
    background: #1e293b;
    color: #e5e7eb;
    border-left-color: #00ffff;
  }

  :global(.dark) .instructions h4 {
    color: #f9fafb;
  }

  :global(.dark) .instructions li {
    color: #d1d5db;
  }

  :global(.dark) .instructions strong {
    color: #f3f4f6;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .demo-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .controls {
      justify-content: center;
      flex-wrap: wrap;
    }

    .controls button {
      flex: 1;
      min-width: 120px;
    }

    canvas {
      width: 100%;
      height: auto;
    }

    .queue-status {
      position: relative;
      top: 1rem;
      right: 0;
      margin-top: 1rem;
      width: 100%;
    }
  }
</style>
