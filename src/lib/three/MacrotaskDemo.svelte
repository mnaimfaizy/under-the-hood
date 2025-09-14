<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { MacrotaskQueue3D, type MacrotaskItem } from "./components/MacrotaskQueue3D";

  let canvasElement: HTMLCanvasElement;
  let scene: any, camera: any, renderer: any, controls: any;
  let macrotaskQueue: MacrotaskQueue3D;
  let animationId: number;

  // Demo state
  let isAutoMode = false;
  let autoInterval: number;
  let queueLength = 0;
  let taskIdCounter = 1;
  let processedTasks: MacrotaskItem[] = [];

  // Stats
  let fps = 0;
  let frameCount = 0;
  let lastTime = performance.now();

  // Task types for demo
  const taskTypes: Array<{ type: MacrotaskItem["type"]; content: string }> = [
    { type: "timeout", content: "setTimeout" },
    { type: "interval", content: "setInterval" },
    { type: "immediate", content: "setImmediate" },
    { type: "io", content: "File Read" },
    { type: "ui", content: "Click Event" },
  ];

  onMount(async () => {
    // Dynamically import Three.js
    const THREE = await import("three");

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);

    // Create camera
    camera = new THREE.PerspectiveCamera(
      75,
      canvasElement.clientWidth / canvasElement.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 8, 15);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
    });
    renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add orbit controls
    const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;

    // Create macrotask queue system
    macrotaskQueue = new MacrotaskQueue3D(scene);

    // Start render loop
    animate();

    console.log("Macrotask Queue 3D Demo initialized");
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (autoInterval) {
      clearInterval(autoInterval);
    }
    if (macrotaskQueue) {
      macrotaskQueue.dispose();
    }
    if (renderer) {
      renderer.dispose();
    }
  });

  function animate() {
    animationId = requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update stats
    frameCount++;
    if (frameCount % 60 === 0) {
      fps = Math.round(1 / deltaTime);
    }

    // Update controls
    if (controls) {
      controls.update();
    }

    // Update macrotask queue
    if (macrotaskQueue) {
      macrotaskQueue.update(deltaTime);
      queueLength = macrotaskQueue.getQueueLength();
    }

    // Render scene
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function addRandomMacrotask() {
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    const task: MacrotaskItem = {
      id: `task-${taskIdCounter++}`,
      type: taskType.type,
      content: taskType.content,
      priority: Math.floor(Math.random() * 5) + 1,
      addedAt: Date.now(),
    };

    macrotaskQueue.addMacrotask(task);
  }

  function processMacrotask() {
    const processedTask = macrotaskQueue.processMacrotask();
    if (processedTask) {
      processedTasks = [processedTask, ...processedTasks].slice(0, 10); // Keep last 10
    }
  }

  function toggleAutoMode() {
    isAutoMode = !isAutoMode;

    if (isAutoMode) {
      // Add tasks every 2 seconds, process every 3 seconds
      autoInterval = setInterval(() => {
        if (Math.random() < 0.7) {
          // 70% chance to add task
          addRandomMacrotask();
        }
        if (Math.random() < 0.5 && queueLength > 0) {
          // 50% chance to process task
          processMacrotask();
        }
      }, 1500);
    } else {
      clearInterval(autoInterval);
    }
  }

  function clearQueue() {
    macrotaskQueue.clear();
    processedTasks = [];
    queueLength = 0;
  }

  function resetCamera() {
    if (camera) {
      camera.position.set(15, 8, 15);
      camera.lookAt(0, 0, 0);
    }
  }
</script>

<div class="w-full h-screen bg-gray-900 relative overflow-hidden">
  <!-- Canvas -->
  <canvas bind:this={canvasElement} class="w-full h-full" style="display: block;"></canvas>

  <!-- Controls Panel -->
  <div
    class="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm"
  >
    <h2 class="text-lg font-bold mb-3 text-yellow-300">Macrotask Queue (FIFO)</h2>

    <!-- Queue Controls -->
    <div class="space-y-2 mb-4">
      <button
        on:click={addRandomMacrotask}
        class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
      >
        Add Macrotask
      </button>

      <button
        on:click={processMacrotask}
        class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
        disabled={queueLength === 0}
        class:opacity-50={queueLength === 0}
      >
        Process Next ({queueLength})
      </button>

      <button
        on:click={toggleAutoMode}
        class="w-full px-3 py-2 rounded text-sm transition-colors"
        class:bg-purple-600={!isAutoMode}
        class:hover:bg-purple-700={!isAutoMode}
        class:bg-red-600={isAutoMode}
        class:hover:bg-red-700={isAutoMode}
      >
        {isAutoMode ? "Stop Auto" : "Auto Demo"}
      </button>
    </div>

    <!-- Task Type Legend -->
    <div class="mb-4">
      <h3 class="text-sm font-semibold mb-2 text-gray-300">Task Types:</h3>
      <div class="grid grid-cols-2 gap-1 text-xs">
        <div class="flex items-center">
          <span class="w-3 h-3 bg-orange-500 rounded mr-1"></span>Timeout
        </div>
        <div class="flex items-center">
          <span class="w-3 h-3 bg-teal-400 rounded mr-1"></span>Interval
        </div>
        <div class="flex items-center">
          <span class="w-3 h-3 bg-red-500 rounded mr-1"></span>Immediate
        </div>
        <div class="flex items-center">
          <span class="w-3 h-3 bg-green-300 rounded mr-1"></span>I/O
        </div>
        <div class="flex items-center">
          <span class="w-3 h-3 bg-pink-400 rounded mr-1"></span>UI Event
        </div>
      </div>
    </div>

    <!-- Utility Controls -->
    <div class="space-y-2">
      <button
        on:click={clearQueue}
        class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
      >
        Clear All
      </button>

      <button
        on:click={resetCamera}
        class="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
      >
        Reset View
      </button>
    </div>
  </div>

  <!-- Stats Panel -->
  <div
    class="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm"
  >
    <h3 class="text-sm font-bold mb-2 text-green-300">Stats</h3>
    <div class="text-xs space-y-1">
      <div>FPS: {fps}</div>
      <div>Queue Length: {queueLength}</div>
      <div>Processed: {processedTasks.length}</div>
    </div>
  </div>

  <!-- Processed Tasks Log -->
  {#if processedTasks.length > 0}
    <div
      class="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm max-w-sm"
    >
      <h3 class="text-sm font-bold mb-2 text-green-300">Recently Processed</h3>
      <div class="text-xs space-y-1 max-h-32 overflow-y-auto">
        {#each processedTasks as task (task.id)}
          <div class="flex items-center justify-between">
            <span class="text-gray-300">{task.type}</span>
            <span class="text-blue-300">{task.content}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Instructions -->
  <div
    class="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm max-w-xs"
  >
    <h3 class="text-sm font-bold mb-2 text-yellow-300">How It Works</h3>
    <div class="text-xs text-gray-300 space-y-1">
      <p>• Macrotasks queue in FIFO order</p>
      <p>• Conveyor belt moves tasks to processor</p>
      <p>• Different colors = different task types</p>
      <p>• Drag to orbit, scroll to zoom</p>
    </div>
  </div>
</div>
