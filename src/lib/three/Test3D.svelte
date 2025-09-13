<script lang="ts">
  // import { onMount } from "svelte";
  import Scene3D from "../three/Scene3D.svelte";
  import * as THREE from "three";

  let scene3D: any;
  let sceneManager: any;

  // Handle scene ready event
  function handleSceneReady(event: any) {
    sceneManager = event.detail.sceneManager;
    console.log("3D Scene is ready:", sceneManager);

    // Add a simple test cube to verify everything is working
    addTestCube();
  }

  function handleSceneError(event: any) {
    console.error("3D Scene error:", event.detail.error);
  }

  function addTestCube() {
    if (!sceneManager) return;

    // Create a test cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      shininess: 30,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;

    // Add rotation animation
    sceneManager.getRenderLoop().addUpdateCallback((deltaTime: number) => {
      cube.rotation.x += deltaTime * 0.5;
      cube.rotation.y += deltaTime * 0.8;
    });

    sceneManager.addObject(cube, "test-cube");

    // Also add a ground plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      shininess: 10,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;

    sceneManager.addObject(plane, "ground-plane");
  }

  function focusOnCube() {
    if (!sceneManager) return;
    const cube = sceneManager.getObject("test-cube");
    if (cube) {
      sceneManager.getCameraController().focusOnObject(cube, 8);
    }
  }

  function resetCamera() {
    if (!sceneManager) return;
    sceneManager.getCameraController().moveToPreset("overview");
  }
</script>

<div class="three-test-container">
  <div class="three-controls">
    <h3>Three.js Test Scene</h3>
    <div class="controls">
      <button on:click={focusOnCube} disabled={!sceneManager}> Focus on Cube </button>
      <button on:click={resetCamera} disabled={!sceneManager}> Reset Camera </button>
    </div>
  </div>

  <div class="scene-container">
    <Scene3D
      bind:this={scene3D}
      width={600}
      height={400}
      enableStats={true}
      on:ready={handleSceneReady}
      on:error={handleSceneError}
    />
  </div>

  <div class="instructions">
    <p><strong>Controls:</strong></p>
    <ul>
      <li>Mouse: Click and drag to rotate camera</li>
      <li>Wheel: Zoom in/out</li>
      <li>Right-click + drag: Pan camera</li>
      <li>Keyboard: Arrow keys or WASD to move, R to reset view</li>
      <li>Numbers 1-5: Preset camera positions</li>
    </ul>
  </div>
</div>

<style>
  .three-test-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 700px;
    margin: 2rem auto;
    padding: 1rem;
    background: var(--surface);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .three-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  .three-controls h3 {
    margin: 0;
    color: var(--text-color, #1f2937);
    font-weight: 600;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }

  .controls button {
    padding: 0.5rem 1rem;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }

  .controls button:hover:not(:disabled) {
    background: #357abd;
  }

  .controls button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .scene-container {
    display: flex;
    justify-content: center;
    background: #f8fafc;
    border-radius: 6px;
    padding: 1rem;
  }

  .instructions {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .instructions ul {
    margin: 0.5rem 0 0 1rem;
    padding: 0;
  }

  .instructions li {
    margin-bottom: 0.25rem;
  }

  /* Dark mode support */
  :global(.dark) .three-test-container {
    background: var(--surface-dark, #1f2937);
  }

  :global(.dark) .three-controls h3 {
    color: var(--text-color-dark, #f9fafb);
  }

  :global(.dark) .scene-container {
    background: #374151;
  }

  :global(.dark) .instructions {
    color: var(--text-secondary-dark, #d1d5db);
  }
</style>
