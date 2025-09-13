<script>
  import { onMount } from "svelte";

  let canvasElement;
  let scene, camera, renderer, cube;
  let animationId;

  onMount(async () => {
    // Dynamically import Three.js to avoid SSR issues
    const THREE = await import("three");

    // Set up the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
    camera.position.z = 5;

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    renderer.setSize(600, 400);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create a test cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Add a ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    scene.add(plane);

    // Start animation loop
    animate();
  });

  function animate() {
    animationId = requestAnimationFrame(animate);

    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
    }
  }

  // Cleanup on component destroy
  import { onDestroy } from "svelte";
  onDestroy(cleanup);
</script>

<div class="three-simple-test">
  <h3>Three.js Basic Test</h3>
  <p>This is a basic Three.js test scene with a rotating cube.</p>

  <div class="canvas-container">
    <canvas bind:this={canvasElement} width="600" height="400"></canvas>
  </div>

  <div class="instructions">
    <p>If you see a rotating blue cube above a dark plane, Three.js is working correctly!</p>
  </div>
</div>

<style>
  .three-simple-test {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 700px;
    margin: 2rem auto;
    padding: 1rem;
    background: var(--surface, #ffffff);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .three-simple-test h3 {
    margin: 0;
    color: var(--text-color, #1f2937);
    font-weight: 600;
  }

  .canvas-container {
    display: flex;
    justify-content: center;
    background: #f8fafc;
    border-radius: 6px;
    padding: 1rem;
  }

  canvas {
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .instructions {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    text-align: center;
  }

  /* Dark mode support */
  :global(.dark) .three-simple-test {
    background: var(--surface-dark, #1f2937);
  }

  :global(.dark) .three-simple-test h3 {
    color: var(--text-color-dark, #f9fafb);
  }

  :global(.dark) .canvas-container {
    background: #374151;
  }

  :global(.dark) .instructions {
    color: var(--text-secondary-dark, #d1d5db);
  }
</style>
