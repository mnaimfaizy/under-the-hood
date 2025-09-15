<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  // import Stats from 'stats.js';
  import { SceneManager } from "../three/core/SceneManager";
  import { TokenManager3D } from "../three/tokens/TokenManager";
  import { CallStack3D } from "../three/components/CallStack3D";
  import { WebAPI3D } from "../three/components/WebAPI3D";
  import { MicrotaskQueue3D } from "../three/components/MicrotaskQueue3D";
  import { MacrotaskQueue3D } from "../three/components/MacrotaskQueue3D";
  import { EventLoop3D } from "../three/components/EventLoop3D";

  export let mode: "kid" | "pro" = "kid";

  let canvas: HTMLCanvasElement;
  let sceneManager: SceneManager;
  let tokenManager: TokenManager3D;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;
  let stats: any;
  let animationId: number;

  // Runtime components
  let callStack: CallStack3D;
  let webAPI: WebAPI3D;
  let microtaskQueue: MicrotaskQueue3D;
  let macrotaskQueue: MacrotaskQueue3D;
  let eventLoop: EventLoop3D;

  // Demo state
  let isRunning = false;
  let currentScenario = "simple";
  let demoTokens: string[] = [];

  // Physics state
  let physicsEnabled = false;
  let showParticles = true;
  let magneticStrength = 10;
  let gravityEnabled = true;
  let collisionEnabled = true;

  const scenarios = {
    simple: "Simple Sync Function",
    promise: "Promise Chain",
    timer: "setTimeout Example",
    fetch: "Fetch API Call",
    mixed: "Mixed Async Operations",
    physics: "Physics Playground",
    collision: "Collision Demo",
    magnetic: "Magnetic Fields",
  };

  onMount(() => {
    console.log("TokenDemo mounted!");

    // Wait for canvas to be ready
    setTimeout(() => {
      if (!canvas) {
        console.error("Canvas not ready!");
        return;
      }

      initializeScene();
      createRuntimeComponents();
      setupTokenManager();
      startAnimation();
    }, 100);
  });

  onDestroy(() => {
    cleanup();
  });

  function initializeScene() {
    console.log("Initializing 3D scene...");
    console.log("Canvas element:", canvas);
    console.log("Canvas dimensions:", canvas.clientWidth, "x", canvas.clientHeight);

    // Initialize Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    console.log("Camera positioned at:", camera.position);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x1a1a2e);
    console.log("Renderer initialized");

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Stats disabled for now to avoid build issues
    // TODO: Add stats panel back when needed

    // Scene manager - not needed for this demo
    // sceneManager = new SceneManager();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add test cube to verify scene is working
    const testGeometry = new THREE.BoxGeometry(2, 2, 2);
    const testMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(5, 5, 0);
    scene.add(testCube);
    console.log("Test cube added to scene");

    console.log("Scene initialization complete. Total scene children:", scene.children.length);
  }

  function createRuntimeComponents() {
    console.log("Creating runtime components...");

    // Create all runtime components
    callStack = new CallStack3D();
    scene.add(callStack);
    console.log("CallStack3D created and added to scene");

    webAPI = new WebAPI3D();
    scene.add(webAPI);
    console.log("WebAPI3D created and added to scene");

    microtaskQueue = new MicrotaskQueue3D();
    scene.add(microtaskQueue);
    console.log("MicrotaskQueue3D created and added to scene");

    macrotaskQueue = new MacrotaskQueue3D(scene);
    console.log("MacrotaskQueue3D created (adds itself to scene)");

    eventLoop = new EventLoop3D(scene);
    console.log("EventLoop3D created (adds itself to scene)");

    console.log("All runtime components created. Scene children:", scene.children.length);
  }

  function setupTokenManager() {
    tokenManager = new TokenManager3D(scene);

    // Connect runtime components
    tokenManager.setComponents({
      callStack,
      webAPI,
      microtaskQueue,
      macrotaskQueue,
      eventLoop,
    });
  }

  function startAnimation() {
    function animate() {
      animationId = requestAnimationFrame(animate);

      const deltaTime = 0.016; // ~60fps

      // Update controls
      controls.update();

      // Update runtime components
      callStack.update(deltaTime);
      webAPI.update(deltaTime);
      microtaskQueue.update(deltaTime);
      macrotaskQueue.update(deltaTime);
      eventLoop.update(deltaTime);

      // Update token manager
      tokenManager.update(deltaTime);

      // Scene manager update not needed

      // Render
      renderer.render(scene, camera);
      if (stats?.update) {
        stats.update();
      }
    }

    animate();
  }

  async function runScenario() {
    if (isRunning) return;

    isRunning = true;

    try {
      switch (currentScenario) {
        case "simple":
          await runSimpleScenario();
          break;
        case "promise":
          await runPromiseScenario();
          break;
        case "timer":
          await runTimerScenario();
          break;
        case "fetch":
          await runFetchScenario();
          break;
        case "mixed":
          await runMixedScenario();
          break;
        case "physics":
          await runPhysicsPlayground();
          break;
        case "collision":
          await runCollisionDemo();
          break;
        case "magnetic":
          await runMagneticDemo();
          break;
      }
    } finally {
      isRunning = false;
    }
  }

  async function runSimpleScenario() {
    console.log("Running simple sync scenario...");

    if (!tokenManager) {
      console.error("TokenManager not initialized!");
      return;
    }

    if (!scene) {
      console.error("Scene not initialized!");
      return;
    }

    console.log("Scene children count:", scene.children.length);
    console.log("Token manager:", tokenManager);

    try {
      await tokenManager.executeTokenFlow({
        type: "sync",
        content: 'console.log("Hello")',
        priority: 1,
      });
      console.log("Simple scenario completed");
    } catch (error) {
      console.error("Error in simple scenario:", error);
    }
  }

  async function runPromiseScenario() {
    console.log("Running promise scenario...");

    const token1 = tokenManager.executeTokenFlow({
      type: "promise",
      content: "Promise.resolve()",
      priority: 1,
    });

    // Add a second promise after a delay
    setTimeout(async () => {
      const token2 = tokenManager.executeTokenFlow({
        type: "promise",
        content: 'fetch("/api")',
        priority: 2,
      });
    }, 2000);

    await token1;
  }

  async function runTimerScenario() {
    console.log("Running timer scenario...");

    await tokenManager.executeTokenFlow({
      type: "timer",
      content: "setTimeout(...)",
      priority: 1,
      delay: 3000,
    });
  }

  async function runFetchScenario() {
    console.log("Running fetch scenario...");

    await tokenManager.executeTokenFlow({
      type: "fetch",
      content: 'fetch("/api/data")',
      priority: 1,
    });
  }

  async function runMixedScenario() {
    console.log("Running mixed scenario...");

    // Sync operation
    const sync = tokenManager.executeTokenFlow({
      type: "sync",
      content: "let x = 5",
      priority: 1,
    });

    // Timer
    const timer = tokenManager.executeTokenFlow({
      type: "timer",
      content: "setTimeout(...)",
      priority: 2,
      delay: 2000,
    });

    // Promise
    const promise = tokenManager.executeTokenFlow({
      type: "promise",
      content: "Promise.resolve()",
      priority: 1,
    });

    // DOM event (simulated)
    setTimeout(() => {
      tokenManager.executeTokenFlow({
        type: "dom",
        content: "click event",
        priority: 3,
      });
    }, 1000);

    await Promise.all([sync, timer, promise]);
  }

  async function runPhysicsPlayground() {
    console.log("Running physics playground...");

    // Enable physics
    tokenManager.setPhysicsEnabled(true);

    // Create multiple tokens with different physics properties
    const tokens = [];

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 5;
      const spawnPos = new THREE.Vector3(
        Math.cos(angle) * radius,
        8 + Math.random() * 4,
        Math.sin(angle) * radius
      );

      const tokenType = ["sync", "promise", "timer", "fetch", "dom", "io"][i % 6];

      const token = tokenManager.createToken(
        {
          type: tokenType as any,
          content: `Token ${i + 1}`,
          priority: Math.floor(Math.random() * 5) + 1,
        },
        spawnPos
      );

      tokens.push(token);

      // Add some initial velocity for interesting physics
      token.velocity.set((Math.random() - 0.5) * 5, Math.random() * 2, (Math.random() - 0.5) * 5);
    }

    // Create some spring constraints between random tokens
    for (let i = 0; i < 3; i++) {
      const tokenA = tokens[Math.floor(Math.random() * tokens.length)];
      const tokenB = tokens[Math.floor(Math.random() * tokens.length)];

      if (tokenA !== tokenB) {
        tokenManager.createTokenConstraints(tokenA.data.id, tokenB.data.id, "spring");
      }
    }
  }

  async function runCollisionDemo() {
    console.log("Running collision demo...");

    // Enable physics with collision detection
    tokenManager.setPhysicsEnabled(true);

    // Create two groups of tokens that will collide
    const group1Tokens = [];
    const group2Tokens = [];

    // Group 1: Heavy tokens from left
    for (let i = 0; i < 4; i++) {
      const token = tokenManager.createToken(
        {
          type: "io",
          content: `Heavy ${i + 1}`,
          priority: 1,
        },
        new THREE.Vector3(-8, 2 + i, 0)
      );

      // Set heavy physics properties
      token.setPhysicsProperties({
        mass: 2.0,
        elasticity: 0.8,
        collisionRadius: 0.8,
      });

      // Give them velocity towards the center
      token.velocity.set(3, 0, 0);
      group1Tokens.push(token);
    }

    // Group 2: Light tokens from right
    for (let i = 0; i < 6; i++) {
      const token = tokenManager.createToken(
        {
          type: "timer",
          content: `Light ${i + 1}`,
          priority: 1,
        },
        new THREE.Vector3(8, 1 + i * 0.5, Math.random() * 2 - 1)
      );

      // Set light physics properties
      token.setPhysicsProperties({
        mass: 0.3,
        elasticity: 0.9,
        collisionRadius: 0.3,
      });

      // Give them velocity towards the center
      token.velocity.set(-2, 0, Math.random() - 0.5);
      group2Tokens.push(token);
    }
  }

  async function runMagneticDemo() {
    console.log("Running magnetic field demo...");

    // Enable physics
    tokenManager.setPhysicsEnabled(true);

    // Create magnetic field sources at runtime components
    const components = [
      { name: "callstack", pos: callStack.position, strength: magneticStrength },
      { name: "webapi", pos: webAPI.position, strength: magneticStrength * 0.8 },
      { name: "microtask", pos: microtaskQueue.position, strength: magneticStrength * 1.2 },
      { name: "macrotask", pos: new THREE.Vector3(-5, -3, 0), strength: magneticStrength },
    ];

    components.forEach((comp) => {
      tokenManager.updateMagneticField(comp.name, comp.pos, comp.strength);
    });

    // Create tokens at random positions
    const tokens = [];
    for (let i = 0; i < 10; i++) {
      const spawnPos = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 20
      );

      const tokenType = ["sync", "promise", "timer", "fetch", "dom"][i % 5];

      const token = tokenManager.createToken(
        {
          type: tokenType as any,
          content: `Magnetic ${i + 1}`,
          priority: Math.floor(Math.random() * 3) + 1,
        },
        spawnPos
      );

      // Different magnetic properties
      token.setPhysicsProperties({
        magnetism: 0.5 + Math.random() * 1.5,
      });

      tokens.push(token);
    }

    // Animate magnetic field strengths over time
    let time = 0;
    const magneticAnimation = setInterval(() => {
      time += 0.1;

      components.forEach((comp, index) => {
        const dynamicStrength = comp.strength * (1 + Math.sin(time + index) * 0.3);
        tokenManager.updateMagneticField(comp.name, comp.pos, dynamicStrength);
      });
    }, 100);

    // Stop animation after 10 seconds
    setTimeout(() => {
      clearInterval(magneticAnimation);
    }, 10000);
  }

  // Physics control functions
  function togglePhysics() {
    physicsEnabled = !physicsEnabled;
    tokenManager.setPhysicsEnabled(physicsEnabled);
  }

  function updateMagneticStrength() {
    const components = ["callstack", "webapi", "microtask", "macrotask"];
    components.forEach((comp) => {
      const pos = getComponentPosition(comp);
      if (pos) {
        tokenManager.updateMagneticField(comp, pos, magneticStrength);
      }
    });
  }

  function getComponentPosition(component: string): THREE.Vector3 | null {
    switch (component) {
      case "callstack":
        return callStack?.position || null;
      case "webapi":
        return webAPI?.position || null;
      case "microtask":
        return microtaskQueue?.position || null;
      case "macrotask":
        return new THREE.Vector3(-5, -3, 0);
      default:
        return null;
    }
  }

  function clearTokens() {
    demoTokens.forEach((tokenId) => {
      tokenManager.destroyToken(tokenId);
    });
    demoTokens = [];

    // Clear runtime component states
    callStack.clearStack();
    macrotaskQueue.clear();
  }

  function handleResize() {
    if (!camera || !renderer || !canvas) return;

    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    if (tokenManager) {
      tokenManager.dispose();
    }

    if (callStack) callStack.dispose();
    if (webAPI) webAPI.dispose();
    if (microtaskQueue) microtaskQueue.dispose();
    if (macrotaskQueue) macrotaskQueue.dispose();
    if (eventLoop) eventLoop.dispose();

    if (controls) {
      controls.dispose();
    }

    if (renderer) {
      renderer.dispose();
    }

    if (stats?.dom?.parentElement) {
      stats.dom.parentElement.removeChild(stats.dom);
    }
  }
</script>

<svelte:window on:resize={handleResize} />

<div class="token-demo-container">
  <div class="demo-header">
    <h2>🎭 Token Animation System Demo</h2>
    <p class="demo-description">
      Watch JavaScript tasks flow through the runtime as 3D animated tokens!
    </p>
  </div>

  <div class="controls-panel">
    <div class="scenario-selector">
      <label for="scenario">Choose Scenario:</label>
      <select id="scenario" bind:value={currentScenario}>
        {#each Object.entries(scenarios) as [key, label]}
          <option value={key}>{label}</option>
        {/each}
      </select>
    </div>

    <div class="control-buttons">
      <button class="run-button" on:click={runScenario} disabled={isRunning}>
        {isRunning ? "🏃 Running..." : "▶️ Run Scenario"}
      </button>

      <button class="clear-button" on:click={clearTokens} disabled={isRunning}>
        🧹 Clear Tokens
      </button>
    </div>

    <!-- Physics Controls -->
    {#if mode === "pro"}
      <div class="physics-controls">
        <h4>⚡ Physics Controls</h4>

        <div class="physics-toggles">
          <label class="toggle-label">
            <input type="checkbox" bind:checked={physicsEnabled} on:change={togglePhysics} />
            <span class="toggle-text">Physics Simulation</span>
          </label>

          <label class="toggle-label">
            <input type="checkbox" bind:checked={showParticles} />
            <span class="toggle-text">Particle Effects</span>
          </label>

          <label class="toggle-label">
            <input type="checkbox" bind:checked={gravityEnabled} />
            <span class="toggle-text">Gravity</span>
          </label>

          <label class="toggle-label">
            <input type="checkbox" bind:checked={collisionEnabled} />
            <span class="toggle-text">Collision Detection</span>
          </label>
        </div>

        <div class="physics-sliders">
          <label class="slider-label">
            <span>Magnetic Strength: {magneticStrength}</span>
            <input
              type="range"
              min="0"
              max="50"
              bind:value={magneticStrength}
              on:input={updateMagneticStrength}
              class="physics-slider"
            />
          </label>
        </div>
      </div>
    {/if}

    <div class="mode-info">
      <span class="mode-badge {mode}">{mode.toUpperCase()} MODE</span>
    </div>
  </div>

  <div class="canvas-container">
    <canvas bind:this={canvas} class="demo-canvas"></canvas>

    <div class="canvas-overlay">
      <div class="legend">
        <h4>Token Types:</h4>
        <div class="token-legend">
          <div class="token-type sync">
            <span class="token-shape">■</span>
            <span>Sync (Blue Cube)</span>
          </div>
          <div class="token-type promise">
            <span class="token-shape">♦</span>
            <span>Promise (Purple Diamond)</span>
          </div>
          <div class="token-type timer">
            <span class="token-shape">●</span>
            <span>Timer (Orange Cylinder)</span>
          </div>
          <div class="token-type fetch">
            <span class="token-shape">●</span>
            <span>Fetch (Teal Sphere)</span>
          </div>
          <div class="token-type dom">
            <span class="token-shape">▲</span>
            <span>DOM (Red Triangle)</span>
          </div>
          <div class="token-type io">
            <span class="token-shape">○</span>
            <span>I/O (Gray Torus)</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="info-panel">
    <h3>How it works:</h3>
    <ol>
      <li><strong>Tokens spawn</strong> at the top of the scene</li>
      <li><strong>Sync tokens</strong> go directly to the call stack</li>
      <li><strong>Async tokens</strong> move to Web APIs for processing</li>
      <li><strong>Completed async tasks</strong> enter the appropriate queue</li>
      <li><strong>Event loop</strong> processes queued tasks in order</li>
      <li><strong>Tokens fade away</strong> when processing is complete</li>
    </ol>

    {#if mode === "pro"}
      <div class="pro-details">
        <h4>Pro Mode Features:</h4>
        <ul>
          <li>Performance monitoring with stats panel</li>
          <li>Detailed token state tracking</li>
          <li>Custom scenario configuration</li>
          <li>Advanced animation controls</li>
        </ul>
      </div>
    {/if}
  </div>
</div>

<style>
  .token-demo-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 1rem;
  }

  .demo-header h2 {
    color: #e2e8f0;
    margin-bottom: 0.5rem;
  }

  .demo-description {
    color: #94a3b8;
    font-size: 0.95rem;
  }

  .controls-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    background: rgba(30, 41, 59, 0.8);
    border-radius: 0.5rem;
    border: 1px solid #334155;
  }

  .scenario-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .scenario-selector label {
    color: #e2e8f0;
    font-weight: 500;
    min-width: max-content;
  }

  .scenario-selector select {
    padding: 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #475569;
    background: #1e293b;
    color: #e2e8f0;
    min-width: 200px;
  }

  .control-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .run-button,
  .clear-button {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .run-button {
    background: #10b981;
    color: white;
  }

  .run-button:hover:not(:disabled) {
    background: #059669;
  }

  .run-button:disabled {
    background: #374151;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .clear-button {
    background: #ef4444;
    color: white;
  }

  .clear-button:hover:not(:disabled) {
    background: #dc2626;
  }

  .clear-button:disabled {
    background: #374151;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .mode-info {
    margin-left: auto;
  }

  .mode-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .mode-badge.kid {
    background: #fbbf24;
    color: #92400e;
  }

  .mode-badge.pro {
    background: #8b5cf6;
    color: #ddd6fe;
  }

  /* Physics Controls */
  .physics-controls {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(20, 31, 49, 0.9);
    border-radius: 0.5rem;
    border: 1px solid #374151;
  }

  .physics-controls h4 {
    color: #60a5fa;
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .physics-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #e2e8f0;
    font-size: 0.85rem;
    user-select: none;
  }

  .toggle-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #60a5fa;
    cursor: pointer;
  }

  .toggle-text {
    white-space: nowrap;
  }

  .physics-sliders {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .slider-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: #e2e8f0;
    font-size: 0.85rem;
  }

  .physics-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #374151;
    outline: none;
    cursor: pointer;
    accent-color: #60a5fa;
  }

  .physics-slider::-webkit-slider-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #60a5fa;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .physics-slider::-webkit-slider-thumb:hover {
    background: #3b82f6;
  }

  .canvas-container {
    position: relative;
    height: 500px;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 2px solid #334155;
  }

  .demo-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .canvas-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(15, 23, 42, 0.9);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #334155;
    backdrop-filter: blur(8px);
  }

  .legend h4 {
    color: #e2e8f0;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .token-legend {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .token-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #cbd5e1;
  }

  .token-shape {
    font-size: 1rem;
    width: 1.2rem;
    text-align: center;
  }

  .token-type.sync .token-shape {
    color: #3498db;
  }
  .token-type.promise .token-shape {
    color: #9b59b6;
  }
  .token-type.timer .token-shape {
    color: #f39c12;
  }
  .token-type.fetch .token-shape {
    color: #1abc9c;
  }
  .token-type.dom .token-shape {
    color: #e74c3c;
  }
  .token-type.io .token-shape {
    color: #34495e;
  }

  .info-panel {
    background: rgba(30, 41, 59, 0.8);
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #334155;
  }

  .info-panel h3 {
    color: #e2e8f0;
    margin-bottom: 1rem;
  }

  .info-panel ol {
    color: #cbd5e1;
    line-height: 1.6;
  }

  .info-panel li {
    margin-bottom: 0.5rem;
  }

  .info-panel strong {
    color: #f1f5f9;
  }

  .pro-details {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #475569;
  }

  .pro-details h4 {
    color: #8b5cf6;
    margin-bottom: 0.5rem;
  }

  .pro-details ul {
    color: #cbd5e1;
    line-height: 1.5;
  }

  .pro-details li {
    margin-bottom: 0.25rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .controls-panel {
      flex-direction: column;
      align-items: stretch;
    }

    .scenario-selector {
      flex-direction: column;
      align-items: stretch;
    }

    .canvas-overlay {
      position: static;
      margin-top: 1rem;
    }
  }
</style>
