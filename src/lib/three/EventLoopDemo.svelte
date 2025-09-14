<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EventLoop3D, type EventLoopPhase } from "./components/EventLoop3D";

  let canvasElement: HTMLCanvasElement;
  let scene: any, camera: any, renderer: any, controls: any;
  let eventLoop: EventLoop3D;
  let animationId: number;

  // Demo state
  let phases: EventLoopPhase[] = [];
  let currentPhaseIndex = -1;
  let isAutoMode = false;
  let autoInterval: number;
  let cycleCount = 0;
  let isPlaying = false;

  // Stats
  let fps = 0;
  let frameCount = 0;
  let lastTime = performance.now();

  onMount(async () => {
    // Dynamically import Three.js
    const THREE = await import("three");

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    // Create camera
    camera = new THREE.PerspectiveCamera(
      75,
      canvasElement.clientWidth / canvasElement.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 15, 20);
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

    // Create event loop system
    eventLoop = new EventLoop3D(scene);
    phases = eventLoop.getPhases();

    // Start render loop
    animate();

    console.log("Event Loop 3D Demo initialized");
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (autoInterval) {
      clearInterval(autoInterval);
    }
    if (eventLoop) {
      eventLoop.dispose();
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

    // Update event loop
    if (eventLoop) {
      eventLoop.update(deltaTime);
    }

    // Render scene
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function setPhase(phaseId: string) {
    if (eventLoop) {
      eventLoop.setActivePhase(phaseId);
      currentPhaseIndex = phases.findIndex((p) => p.id === phaseId);
    }
  }

  function clearPhase() {
    if (eventLoop) {
      eventLoop.setActivePhase(null);
      currentPhaseIndex = -1;
    }
  }

  function nextPhase() {
    if (currentPhaseIndex < phases.length - 1) {
      currentPhaseIndex++;
    } else {
      currentPhaseIndex = 0;
      cycleCount++;
    }
    setPhase(phases[currentPhaseIndex].id);
  }

  function prevPhase() {
    if (currentPhaseIndex > 0) {
      currentPhaseIndex--;
    } else {
      currentPhaseIndex = phases.length - 1;
    }
    setPhase(phases[currentPhaseIndex].id);
  }

  function toggleAutoMode() {
    isAutoMode = !isAutoMode;
    isPlaying = isAutoMode;

    if (isAutoMode) {
      // Automatically cycle through phases
      autoInterval = setInterval(() => {
        nextPhase();
      }, 2000); // Change phase every 2 seconds
    } else {
      clearInterval(autoInterval);
      isPlaying = false;
    }
  }

  function resetDemo() {
    clearPhase();
    cycleCount = 0;
    currentPhaseIndex = -1;
    if (autoInterval) {
      clearInterval(autoInterval);
      isAutoMode = false;
      isPlaying = false;
    }
  }

  function resetCamera() {
    if (camera) {
      camera.position.set(20, 15, 20);
      camera.lookAt(0, 0, 0);
    }
  }

  // Get phase color for UI
  function getPhaseColor(phase: EventLoopPhase): string {
    return `#${phase.color.toString(16).padStart(6, "0")}`;
  }
</script>

<div class="w-full h-screen bg-gray-900 relative overflow-hidden">
  <!-- Canvas -->
  <canvas bind:this={canvasElement} class="w-full h-full" style="display: block;"></canvas>

  <!-- Controls Panel -->
  <div
    class="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg backdrop-blur-sm max-w-sm"
  >
    <h2 class="text-lg font-bold mb-3 text-blue-300">JavaScript Event Loop</h2>

    <!-- Phase Controls -->
    <div class="space-y-2 mb-4">
      <button
        on:click={toggleAutoMode}
        class="w-full px-3 py-2 rounded text-sm font-semibold transition-colors"
        class:bg-green-600={!isAutoMode}
        class:hover:bg-green-700={!isAutoMode}
        class:bg-red-600={isAutoMode}
        class:hover:bg-red-700={isAutoMode}
      >
        {isAutoMode ? "⏸️ Stop Auto" : "▶️ Auto Demo"}
      </button>

      <div class="flex space-x-2">
        <button
          on:click={prevPhase}
          class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          disabled={phases.length === 0}
        >
          ⏮️ Prev
        </button>

        <button
          on:click={nextPhase}
          class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          disabled={phases.length === 0}
        >
          ⏭️ Next
        </button>
      </div>

      <button
        on:click={clearPhase}
        class="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
      >
        ⏹️ Clear
      </button>
    </div>

    <!-- Phase Selection -->
    <div class="mb-4">
      <h3 class="text-sm font-semibold mb-2 text-gray-300">Event Loop Phases:</h3>
      <div class="space-y-2">
        {#each phases as phase, index}
          <button
            on:click={() => setPhase(phase.id)}
            class="w-full px-3 py-2 rounded text-sm text-left transition-all transform hover:scale-105"
            class:ring-2={currentPhaseIndex === index}
            class:ring-white={currentPhaseIndex === index}
            class:opacity-60={currentPhaseIndex !== index}
            style="background-color: {getPhaseColor(phase)}; color: white;"
          >
            <div class="font-semibold">{phase.name}</div>
            <div class="text-xs opacity-80">{phase.description}</div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Utility Controls -->
    <div class="space-y-2">
      <button
        on:click={resetDemo}
        class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
      >
        🔄 Reset Demo
      </button>

      <button
        on:click={resetCamera}
        class="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
      >
        📷 Reset Camera
      </button>
    </div>
  </div>

  <!-- Stats Panel -->
  <div
    class="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg backdrop-blur-sm"
  >
    <h3 class="text-sm font-bold mb-2 text-green-300">Statistics</h3>
    <div class="text-xs space-y-1">
      <div>FPS: <span class="text-yellow-300">{fps}</span></div>
      <div>Cycles: <span class="text-blue-300">{cycleCount}</span></div>
      <div>Status: <span class="text-purple-300">{isPlaying ? "Running" : "Stopped"}</span></div>
      {#if currentPhaseIndex >= 0}
        <div>
          Phase: <span style="color: {getPhaseColor(phases[currentPhaseIndex])}"
            >{phases[currentPhaseIndex].name}</span
          >
        </div>
      {/if}
    </div>
  </div>

  <!-- Current Phase Info -->
  {#if currentPhaseIndex >= 0}
    <div
      class="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg backdrop-blur-sm max-w-sm"
    >
      <div class="flex items-center mb-2">
        <div
          class="w-4 h-4 rounded-full mr-2"
          style="background-color: {getPhaseColor(phases[currentPhaseIndex])}"
        ></div>
        <h3 class="text-lg font-bold">{phases[currentPhaseIndex].name}</h3>
      </div>
      <p class="text-sm text-gray-300 mb-2">{phases[currentPhaseIndex].description}</p>
      <div class="text-xs text-gray-400">
        Duration: {phases[currentPhaseIndex].duration}s | Phase {currentPhaseIndex + 1} of {phases.length}
      </div>
    </div>
  {/if}

  <!-- Instructions -->
  <div
    class="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg backdrop-blur-sm max-w-xs"
  >
    <h3 class="text-sm font-bold mb-2 text-yellow-300">Event Loop Cycle</h3>
    <div class="text-xs text-gray-300 space-y-1">
      <p>1. Execute Call Stack (sync code)</p>
      <p>2. Process Microtasks (promises)</p>
      <p>3. Handle Rendering updates</p>
      <p>4. Execute Macrotasks (timers)</p>
      <p class="mt-2 text-yellow-200">🎮 Use controls or auto mode!</p>
    </div>
  </div>
</div>
