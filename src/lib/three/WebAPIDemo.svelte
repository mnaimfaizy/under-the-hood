<script>
  import { onMount, onDestroy } from "svelte";
  import { WebAPI3D } from "./components/WebAPI3D";

  let canvasElement;
  let scene, camera, renderer;
  let webAPISystem;
  let animationId;

  // Demo state
  let activeStations = new Set();
  let operations = {
    timer: [],
    network: [],
    dom: [],
    storage: [],
  };

  onMount(async () => {
    // Dynamically import Three.js
    const THREE = await import("three");

    // Set up the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 4, 0);

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    renderer.setSize(800, 600);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create the Web API system
    webAPISystem = new WebAPI3D({
      orbitRadius: 15,
      orbitSpeed: 0.005,
      glowIntensity: 0.8,
    });
    scene.add(webAPISystem);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add accent lighting for each station type
    const timerLight = new THREE.PointLight(0xffa500, 0.3, 20);
    timerLight.position.set(15, 8, 0);
    scene.add(timerLight);

    const networkLight = new THREE.PointLight(0x00ff88, 0.3, 20);
    networkLight.position.set(0, 8, 15);
    scene.add(networkLight);

    const domLight = new THREE.PointLight(0x4488ff, 0.3, 20);
    domLight.position.set(-15, 8, 0);
    scene.add(domLight);

    const storageLight = new THREE.PointLight(0xff4488, 0.3, 20);
    storageLight.position.set(0, 8, -15);
    scene.add(storageLight);

    // Add a central platform
    const platformGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 16);
    const platformMaterial = new THREE.MeshPhongMaterial({
      color: 0x444444,
      shininess: 30,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, 3, 0);
    platform.receiveShadow = true;
    scene.add(platform);

    // Add orbit controls
    const { OrbitControls } = await import("three-orbitcontrols-ts");
    const controls = new OrbitControls(camera, canvasElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 4, 0);

    // Start animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);

      controls.update();

      if (webAPISystem) {
        webAPISystem.update(0.016); // Assume 60fps
      }

      renderer.render(scene, camera);
    }
    animate();
  });

  // Demo functions for different API operations
  function startTimerOperation() {
    const operation = `Timer-${Date.now()}`;
    operations.timer.push(operation);
    webAPISystem?.activateStation("timer-station", operation);
    activeStations.add("timer");

    // Simulate timer completion
    setTimeout(
      () => {
        const index = operations.timer.indexOf(operation);
        if (index > -1) {
          operations.timer.splice(index, 1);
          webAPISystem?.deactivateStation("timer-station", operation);
          if (operations.timer.length === 0) {
            activeStations.delete("timer");
          }
          operations = { ...operations }; // Trigger reactivity
        }
      },
      2000 + Math.random() * 3000
    );

    operations = { ...operations }; // Trigger reactivity
  }

  function startNetworkOperation() {
    const operation = `Fetch-${Date.now()}`;
    operations.network.push(operation);
    webAPISystem?.activateStation("network-station", operation);
    activeStations.add("network");

    // Simulate network request completion
    setTimeout(
      () => {
        const index = operations.network.indexOf(operation);
        if (index > -1) {
          operations.network.splice(index, 1);
          webAPISystem?.deactivateStation("network-station", operation);
          if (operations.network.length === 0) {
            activeStations.delete("network");
          }
          operations = { ...operations }; // Trigger reactivity
        }
      },
      1000 + Math.random() * 4000
    );

    operations = { ...operations }; // Trigger reactivity
  }

  function startDOMOperation() {
    const operation = `DOM-${Date.now()}`;
    operations.dom.push(operation);
    webAPISystem?.activateStation("dom-station", operation);
    activeStations.add("dom");

    // Simulate DOM event completion
    setTimeout(
      () => {
        const index = operations.dom.indexOf(operation);
        if (index > -1) {
          operations.dom.splice(index, 1);
          webAPISystem?.deactivateStation("dom-station", operation);
          if (operations.dom.length === 0) {
            activeStations.delete("dom");
          }
          operations = { ...operations }; // Trigger reactivity
        }
      },
      500 + Math.random() * 2000
    );

    operations = { ...operations }; // Trigger reactivity
  }

  function startStorageOperation() {
    const operation = `Storage-${Date.now()}`;
    operations.storage.push(operation);
    webAPISystem?.activateStation("storage-station", operation);
    activeStations.add("storage");

    // Simulate storage operation completion
    setTimeout(
      () => {
        const index = operations.storage.indexOf(operation);
        if (index > -1) {
          operations.storage.splice(index, 1);
          webAPISystem?.deactivateStation("storage-station", operation);
          if (operations.storage.length === 0) {
            activeStations.delete("storage");
          }
          operations = { ...operations }; // Trigger reactivity
        }
      },
      800 + Math.random() * 2500
    );

    operations = { ...operations }; // Trigger reactivity
  }

  function clearAllOperations() {
    Object.keys(operations).forEach((type) => {
      operations[type] = [];
      webAPISystem?.deactivateStation(`${type}-station`);
    });
    activeStations.clear();
    operations = { ...operations }; // Trigger reactivity
  }

  function autoDemo() {
    // Clear all first
    clearAllOperations();

    // Start a sequence of operations
    setTimeout(() => startTimerOperation(), 500);
    setTimeout(() => startNetworkOperation(), 1000);
    setTimeout(() => startDOMOperation(), 1500);
    setTimeout(() => startStorageOperation(), 2000);
    setTimeout(() => startTimerOperation(), 2500);
    setTimeout(() => startNetworkOperation(), 3000);
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (webAPISystem) {
      webAPISystem.dispose();
    }
    if (renderer) {
      renderer.dispose();
    }
  }

  // Cleanup on component destroy
  onDestroy(cleanup);
</script>

<div class="webapi-demo">
  <div class="demo-header">
    <h3>3D Web APIs Floating Stations</h3>
    <div class="controls">
      <button on:click={startTimerOperation} class="timer-btn"> Timer API </button>
      <button on:click={startNetworkOperation} class="network-btn"> Network API </button>
      <button on:click={startDOMOperation} class="dom-btn"> DOM API </button>
      <button on:click={startStorageOperation} class="storage-btn"> Storage API </button>
      <button on:click={clearAllOperations} class="clear-btn"> Clear All </button>
      <button on:click={autoDemo} class="demo-btn"> Auto Demo </button>
    </div>
  </div>

  <div class="canvas-container">
    <canvas bind:this={canvasElement} width="800" height="600"></canvas>

    <div class="station-status">
      <h4>Station Status:</h4>
      <div class="station-grid">
        <div class="station-item timer {activeStations.has('timer') ? 'active' : ''}">
          <div class="station-icon timer"></div>
          <div class="station-info">
            <strong>Timer API</strong>
            <span>{operations.timer.length} active</span>
          </div>
        </div>
        <div class="station-item network {activeStations.has('network') ? 'active' : ''}">
          <div class="station-icon network"></div>
          <div class="station-info">
            <strong>Network API</strong>
            <span>{operations.network.length} active</span>
          </div>
        </div>
        <div class="station-item dom {activeStations.has('dom') ? 'active' : ''}">
          <div class="station-icon dom"></div>
          <div class="station-info">
            <strong>DOM API</strong>
            <span>{operations.dom.length} active</span>
          </div>
        </div>
        <div class="station-item storage {activeStations.has('storage') ? 'active' : ''}">
          <div class="station-icon storage"></div>
          <div class="station-info">
            <strong>Storage API</strong>
            <span>{operations.storage.length} active</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="instructions">
    <h4>Interactive 3D Web API Stations:</h4>
    <ul>
      <li>
        <strong>Orbital Movement:</strong> Four stations orbit around the central platform representing
        different Web APIs
      </li>
      <li>
        <strong>Timer Station (Orange):</strong> Handles setTimeout and setInterval operations
      </li>
      <li>
        <strong>Network Station (Green):</strong> Manages fetch requests and XMLHttpRequest calls
      </li>
      <li>
        <strong>DOM Station (Blue):</strong> Processes DOM events and element manipulation
      </li>
      <li>
        <strong>Storage Station (Pink):</strong> Handles localStorage and IndexedDB operations
      </li>
      <li>
        <strong>Connection Beams:</strong> Cyan beams appear when stations are processing operations
      </li>
      <li>
        <strong>Station Status:</strong> Monitor shows real-time activity for each API type
      </li>
      <li>
        <strong>Controls:</strong> Mouse to rotate camera, wheel to zoom, right-click to pan
      </li>
    </ul>
  </div>
</div>

<style>
  .webapi-demo {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 1000px;
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
    background: linear-gradient(135deg, #4a90e2, #7b68ee);
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
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    color: white;
  }

  .timer-btn {
    background: #ffa500;
    box-shadow: 0 2px 4px rgba(255, 165, 0, 0.3);
  }

  .timer-btn:hover {
    background: #ff8c00;
    transform: translateY(-1px);
  }

  .network-btn {
    background: #00ff88;
    box-shadow: 0 2px 4px rgba(0, 255, 136, 0.3);
  }

  .network-btn:hover {
    background: #00e077;
    transform: translateY(-1px);
  }

  .dom-btn {
    background: #4488ff;
    box-shadow: 0 2px 4px rgba(68, 136, 255, 0.3);
  }

  .dom-btn:hover {
    background: #3377ee;
    transform: translateY(-1px);
  }

  .storage-btn {
    background: #ff4488;
    box-shadow: 0 2px 4px rgba(255, 68, 136, 0.3);
  }

  .storage-btn:hover {
    background: #ee3377;
    transform: translateY(-1px);
  }

  .clear-btn {
    background: #6b7280;
    box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3);
  }

  .clear-btn:hover {
    background: #4b5563;
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
    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #cbd5e0;
  }

  canvas {
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .station-status {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-family: "Monaco", "Menlo", monospace;
    font-size: 0.875rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 200px;
  }

  .station-status h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    color: #4ade80;
  }

  .station-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .station-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s;
  }

  .station-item.active {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .station-icon {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .station-icon.timer {
    background: #ffa500;
  }
  .station-icon.network {
    background: #00ff88;
  }
  .station-icon.dom {
    background: #4488ff;
  }
  .station-icon.storage {
    background: #ff4488;
  }

  .station-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .station-info strong {
    font-size: 0.8rem;
    color: #f3f4f6;
  }

  .station-info span {
    font-size: 0.7rem;
    color: #d1d5db;
  }

  .instructions {
    background: #f8f9fa;
    padding: 1.25rem;
    border-radius: 8px;
    border-left: 4px solid #4a90e2;
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
  :global(.dark) .webapi-demo {
    background: var(--surface-dark, #1f2937);
  }

  :global(.dark) .demo-header {
    border-color: #374151;
  }

  :global(.dark) .canvas-container {
    background: linear-gradient(135deg, #374151, #4b5563);
    border-color: #6b7280;
  }

  :global(.dark) .instructions {
    background: #374151;
    color: #e5e7eb;
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

    .station-status {
      position: relative;
      top: 1rem;
      right: 0;
      margin-top: 1rem;
    }
  }
</style>
