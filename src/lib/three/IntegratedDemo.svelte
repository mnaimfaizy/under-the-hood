<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Scene3D from "./Scene3D.svelte";
  import { SimulationBridge } from "./SimulationBridge";
  import { createRunner } from "../sim/engine";
  import {
    scenarioTimerVsPromise,
    scenarioTwoLogs,
    scenarioFetchRobot,
    scenarioHiFiBasic,
    scenarioMicrotaskChain,
    scenarioNestedTimeouts,
    scenarioAsyncAwait,
    scenarioDomClick,
  } from "../sim/scenarios";

  // Component state
  let _sceneApi: any = {};
  export let api: any = undefined; // expose control surface to parent
  let simulationBridge: SimulationBridge;
  let runner: any;
  let isPlaying = false;
  let narration = "Ready to start the integrated simulation.";
  let eventCount = 0;
  let sceneManager: any = null;
  let sceneError: string = "";
  let sceneReady = false;

  // helper: map scenario key to array of events
  function getScenarioByKey(key: string) {
    switch (key) {
      case "timer-vs-promise":
        return scenarioTimerVsPromise();
      case "two-logs":
        return scenarioTwoLogs();
      case "fetch-robot":
        return scenarioFetchRobot();
      case "microtask-chain":
        return scenarioMicrotaskChain();
      case "nested-timeouts":
        return scenarioNestedTimeouts();
      case "async-await":
        return scenarioAsyncAwait();
      case "dom-click":
        return scenarioDomClick();
      case "hifi-basic":
        return scenarioHiFiBasic();
      default:
        return scenarioTimerVsPromise();
    }
  }

  // Create simulation bridge
  onMount(() => {
    console.log("🚀 IntegratedDemo mounting...");

    simulationBridge = new SimulationBridge({
      onNarrationUpdate: (text) => {
        narration = text;
        console.log("📢 Narration update:", text);
      },
    });

    console.log("🎬 SimulationBridge created");

    initRunnerAndScenario();

    // Build API for parent to control Integrated demo
    api = {
      play: () => startSimulation(),
      pause: () => pauseSimulation(),
      reset: () => resetSimulation(),
      step: () => stepSimulation(),
      setSpeed: (msPerStep: number) => runner?.setSpeed?.(msPerStep),
      loadScenario: (key: string) => runner?.load?.(getScenarioByKey(key)),
    };
  });

  function initRunnerAndScenario(key: string = "timer-vs-promise") {
    // Create simulation runner with bridge integration
    runner = createRunner({
      onEvent: (event) => {
        // reflect activity regardless of 3D processing
        eventCount++;
        simulationBridge.handleSimEvent(event);
        if (event.type === "scenario-end") {
          isPlaying = false;
        }
      },
      speed: 800,
    });

    // Load initial or selected scenario
    runner.load(getScenarioByKey(key));
  }

  onDestroy(() => {
    if (simulationBridge) {
      simulationBridge.dispose();
    }
    if (runner) {
      runner.pause();
    }
  });

  function startSimulation() {
    if (!runner) {
      initRunnerAndScenario();
    }
    if (runner && !isPlaying) {
      isPlaying = true;
      // Start from a clean slate to ensure visible activity
      runner.reset();
      runner.load(scenarioTimerVsPromise());
      // Emit the first event immediately for instant feedback
      runner.step();
      // Then continue playing on interval
      runner.play();
    }
  }

  function pauseSimulation() {
    if (runner && isPlaying) {
      isPlaying = false;
      runner.pause();
    }
  }

  function resetSimulation() {
    if (runner) {
      isPlaying = false;
      runner.reset();
      simulationBridge.reset();
      eventCount = 0;
      narration = "Ready to start the integrated simulation.";
      runner.load(scenarioTimerVsPromise());
    }
  }

  function stepSimulation() {
    if (runner) {
      runner.step();
    }
  }

  function _addTestCube() {
    if (!sceneManager) return;

    try {
      // Import THREE dynamically to create a simple test cube
      import("three").then((THREE) => {
        // Create a simple rotating cube to test the scene (for quick visual verification)
        const geometry = new THREE.BoxGeometry(3, 3, 3);
        const material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          wireframe: true,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0, 0);

        console.log("🎲 Creating test cube - geometry:", geometry);
        console.log("🎲 Creating test cube - material:", material);
        console.log("🎲 Creating test cube - mesh:", cube);

        // Add to scene
        const scene = sceneManager.getScene();
        console.log("🧪 Scene before adding cube, children count:", scene.children.length);

        // Add a few objects at different positions to test visibility
        cube.position.set(0, 0, 0);
        scene.add(cube);

        // Add a second cube to the right
        const cube2 = cube.clone();
        cube2.position.set(5, 0, 0);
        cube2.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        scene.add(cube2);

        // Add a third cube above
        const cube3 = cube.clone();
        cube3.position.set(0, 3, 0);
        cube3.material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
        scene.add(cube3);

        console.log("🧪 Scene after adding cubes, children count:", scene.children.length);
        console.log("🧪 Green cube at (0,0,0):", cube.position);
        console.log("🧪 Red cube at (5,0,0):", cube2.position);
        console.log("🧪 Blue cube at (0,3,0):", cube3.position);

        // Get camera info
        const camera = sceneManager.getCamera();
        console.log("📷 Camera position:", camera.position);
        console.log("📷 Camera rotation:", camera.rotation);
        if (camera.target) {
          console.log("📷 Camera target:", camera.target);
        }

        // Add simple rotation animation
        function animate() {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          requestAnimationFrame(animate);
        }
        animate();

        console.log("✅ Test cube added to scene with rotation animation");
      });
    } catch (error) {
      console.error("❌ Failed to add test cube:", error);
    }
  }
</script>

<div class="integrated-demo">
  <div class="demo-header">
    <h2>🔄 Phase 5: Integrated Simulation Bridge Demo</h2>
    <p>Testing integration between 2D simulation engine and 3D visualization system</p>
  </div>

  <div class="demo-content">
    <!-- 3D Scene -->
    <div class="scene-container">
      <Scene3D
        width={800}
        height={500}
        enableStats={true}
        on:ready={(event) => {
          console.log("🎬 Scene ready!", event.detail);
          sceneManager = event.detail.sceneManager;
          sceneReady = true;
          sceneError = "";

          // Connect the simulation bridge to the 3D scene
          if (simulationBridge && sceneManager) {
            simulationBridge.attachSceneManager(sceneManager);
            console.log("🔗 Connected SimulationBridge to SceneManager");
          }

          // Ensure camera frames the stage and add a simple grid helper for orientation
          try {
            const cameraController = sceneManager.getCameraController();
            cameraController.moveToPreset("overview");

            // Add grid helper to the scene to avoid perceived emptiness
            import("three").then((THREE) => {
              const grid = new THREE.GridHelper(40, 40, 0x666666, 0x333333);
              grid.position.set(0, 0, 0);
              sceneManager.getScene().add(grid);
            });
          } catch (e) {
            console.warn("Camera/grid setup failed:", e);
          }
        }}
        on:error={(event) => {
          console.error("❌ Scene error:", event.detail.error);
          sceneError = event.detail.error.message;
          sceneReady = false;

          // Check if WebGL is supported
          const canvas = document.createElement("canvas");
          const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          if (!gl) {
            sceneError = "WebGL not supported in this browser";
          }
        }}
      />
      {#if sceneError}
        <div class="scene-error">
          <p>❌ 3D Scene Error: {sceneError}</p>
        </div>
      {/if}
      {#if !sceneReady && !sceneError}
        <div class="scene-loading">
          <p>🔄 Loading 3D Scene...</p>
        </div>
      {/if}
    </div>

    <!-- Controls -->
    <div class="controls-panel">
      <div class="control-buttons">
        <button class="control-btn play" disabled={isPlaying} on:click={startSimulation}>
          ▶️ Play
        </button>

        <button class="control-btn pause" disabled={!isPlaying} on:click={pauseSimulation}>
          ⏸️ Pause
        </button>

        <button class="control-btn reset" on:click={resetSimulation}> 🔄 Reset </button>

        <button class="control-btn step" disabled={isPlaying} on:click={stepSimulation}>
          ⏩ Step
        </button>
      </div>

      <div class="status-info">
        <div class="status-item">
          <span class="label">Status:</span>
          <span class="value">{isPlaying ? "🟢 Playing" : "⏸️ Paused"}</span>
        </div>
        <div class="status-item">
          <span class="label">Events:</span>
          <span class="value">{eventCount}</span>
        </div>
      </div>
    </div>

    <!-- Narration Display -->
    <div class="narration-panel">
      <h3>📢 Current Narration</h3>
      <div class="narration-text" data-testid="bridge-narration">
        {narration}
      </div>
    </div>

    <!-- Debug Information -->
    <div class="debug-panel">
      <h3>🔧 Bridge Debug Info</h3>
      <div class="debug-content">
        {#if simulationBridge}
          <div class="debug-item">
            <span class="debug-label">Event History:</span>
            <span class="debug-value">{simulationBridge.getEventHistory().length} events</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">Token Registry:</span>
            <span class="debug-value">{simulationBridge.getTokenRegistry().size} tokens</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">Animation Speed:</span>
            <span class="debug-value">1x</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">Animation Delay:</span>
            <span class="debug-value">{simulationBridge.getAnimationDelay()}ms</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Integration Status -->
  <div class="integration-status">
    <h3>✅ Integration Status</h3>
    <div class="status-grid">
      <div class="status-card">
        <div class="status-icon">🎬</div>
        <div class="status-title">SimulationBridge</div>
        <div class="status-value">{simulationBridge ? "✅ Active" : "❌ Not Connected"}</div>
      </div>

      <div class="status-card">
        <div class="status-icon">🎮</div>
        <div class="status-title">Runner Engine</div>
        <div class="status-value">{runner ? "✅ Connected" : "❌ Not Connected"}</div>
      </div>

      <div class="status-card">
        <div class="status-icon">🎯</div>
        <div class="status-title">3D Scene</div>
        <div class="status-value">
          {sceneReady ? "✅ Ready" : sceneError ? "❌ Error" : "⏳ Loading"}
        </div>
      </div>

      <div class="status-card">
        <div class="status-icon">📢</div>
        <div class="status-title">Narration</div>
        <div class="status-value">
          {narration !== "Ready to start the integrated simulation." ? "✅ Active" : "⏳ Waiting"}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .integrated-demo {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
  }

  .demo-header h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .demo-header p {
    margin: 0;
    opacity: 0.9;
  }

  .demo-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    grid-template-rows: auto auto auto;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .scene-container {
    grid-column: 1;
    grid-row: 1 / span 3;
    background: #1a1a2e;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    min-height: 500px;
  }

  .scene-loading,
  .scene-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    text-align: center;
    font-size: 1.1rem;
    padding: 1rem;
    border-radius: 8px;
    backdrop-filter: blur(4px);
  }

  .scene-loading {
    background: rgba(0, 123, 255, 0.8);
  }

  .scene-error {
    background: rgba(220, 53, 69, 0.8);
  }

  .controls-panel {
    grid-column: 2;
    grid-row: 1;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .control-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .control-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-btn.play {
    background: #28a745;
    color: white;
  }

  .control-btn.play:hover:not(:disabled) {
    background: #218838;
  }

  .control-btn.pause {
    background: #ffc107;
    color: #212529;
  }

  .control-btn.pause:hover:not(:disabled) {
    background: #e0a800;
  }

  .control-btn.reset {
    background: #dc3545;
    color: white;
  }

  .control-btn.reset:hover {
    background: #c82333;
  }

  .control-btn.step {
    background: #17a2b8;
    color: white;
  }

  .control-btn.step:hover:not(:disabled) {
    background: #138496;
  }

  .status-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }

  .label {
    font-weight: bold;
    color: #495057;
  }

  .value {
    font-family: "Courier New", monospace;
    color: #007bff;
  }

  .narration-panel {
    grid-column: 2;
    grid-row: 2;
    background: #e3f2fd;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .narration-panel h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #1565c0;
  }

  .narration-text {
    font-size: 0.9rem;
    line-height: 1.4;
    color: #0d47a1;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    min-height: 3rem;
    display: flex;
    align-items: center;
  }

  .debug-panel {
    grid-column: 2;
    grid-row: 3;
    background: #f1f3f4;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .debug-panel h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #5f6368;
  }

  .debug-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .debug-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
  }

  .debug-label {
    color: #5f6368;
  }

  .debug-value {
    font-family: "Courier New", monospace;
    color: #1a73e8;
  }

  .integration-status {
    background: #ffffff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .integration-status h3 {
    margin: 0 0 1rem 0;
    text-align: center;
    color: #333;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .status-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    border: 2px solid #e9ecef;
    transition: all 0.2s ease;
  }

  .status-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .status-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .status-title {
    font-weight: bold;
    margin-bottom: 0.25rem;
    color: #495057;
  }

  .status-value {
    font-size: 0.9rem;
    font-family: "Courier New", monospace;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .demo-content {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }

    .scene-container {
      grid-column: 1;
      grid-row: 1;
    }

    .controls-panel {
      grid-column: 1;
      grid-row: 2;
    }

    .narration-panel {
      grid-column: 1;
      grid-row: 3;
    }

    .debug-panel {
      grid-column: 1;
      grid-row: 4;
    }

    .status-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
