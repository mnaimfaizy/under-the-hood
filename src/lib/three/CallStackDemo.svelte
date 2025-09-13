<script>
  import { onMount } from "svelte";
  import { CallStack3D } from "../components/CallStack3D.ts";

  let canvasElement;
  let scene, camera, renderer;
  let callStack;
  let animationId;

  // Demo state
  let stackItems = [
    { id: '1', label: 'main()', functionName: 'main', isActive: true },
    { id: '2', label: 'fetchData()', functionName: 'fetchData', isActive: true },
    { id: '3', label: 'parseJSON()', functionName: 'parseJSON', isActive: true },
  ];
  
  let currentStackSize = 0;

  onMount(async () => {
    // Dynamically import Three.js
    const THREE = await import('three');
    
    // Set up the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    renderer.setSize(800, 600);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create the call stack
    callStack = new CallStack3D({
      maxFloors: 10,
      floorHeight: 0.8,
      floorSpacing: 0.2,
      glowIntensity: 0.6
    });
    scene.add(callStack);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add some accent lighting
    const blueLight = new THREE.PointLight(0x4444ff, 0.5, 15);
    blueLight.position.set(-12, 6, 2);
    scene.add(blueLight);

    // Add a ground plane
    const planeGeometry = new THREE.PlaneGeometry(30, 30);
    const planeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 10
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Add orbit controls
    const { OrbitControls } = await import('three-orbitcontrols-ts');
    const controls = new OrbitControls(camera, canvasElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(-8, 4, 2); // Focus on the call stack

    // Start animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);
      
      controls.update();
      
      if (callStack) {
        callStack.update(0.016); // Assume 60fps
      }
      
      renderer.render(scene, camera);
    }
    animate();
  });

  function pushFunction() {
    if (currentStackSize < stackItems.length && callStack) {
      const item = stackItems[currentStackSize];
      callStack.pushFunction({
        id: item.id,
        label: item.label,
        functionName: item.functionName,
        isActive: true
      });
      currentStackSize++;
    }
  }

  function popFunction() {
    if (currentStackSize > 0 && callStack) {
      const popped = callStack.popFunction();
      console.log('Popped function:', popped);
      currentStackSize--;
    }
  }

  function clearStack() {
    if (callStack) {
      callStack.clearStack();
      currentStackSize = 0;
    }
  }

  function autoDemo() {
    // Clear first
    clearStack();
    
    // Push functions one by one with delays
    setTimeout(() => pushFunction(), 500);
    setTimeout(() => pushFunction(), 1000);
    setTimeout(() => pushFunction(), 1500);
    setTimeout(() => popFunction(), 3000);
    setTimeout(() => popFunction(), 3500);
    setTimeout(() => popFunction(), 4000);
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (callStack) {
      callStack.dispose();
    }
    if (renderer) {
      renderer.dispose();
    }
  }

  // Cleanup on component destroy
  import { onDestroy } from "svelte";
  onDestroy(cleanup);
</script>

<div class="callstack-demo">
  <div class="demo-header">
    <h3>3D Call Stack Tower</h3>
    <div class="controls">
      <button on:click={pushFunction} disabled={currentStackSize >= stackItems.length}>
        Push Function
      </button>
      <button on:click={popFunction} disabled={currentStackSize <= 0}>
        Pop Function  
      </button>
      <button on:click={clearStack}>
        Clear Stack
      </button>
      <button on:click={autoDemo} class="demo-btn">
        Auto Demo
      </button>
    </div>
  </div>
  
  <div class="canvas-container">
    <canvas bind:this={canvasElement} width="800" height="600"></canvas>
    
    <div class="stack-info">
      <h4>Stack Info:</h4>
      <p>Current Depth: {currentStackSize}</p>
      <p>Next Function: {currentStackSize < stackItems.length ? stackItems[currentStackSize].functionName : 'None'}</p>
    </div>
  </div>
  
  <div class="instructions">
    <h4>Interactive 3D Call Stack Tower:</h4>
    <ul>
      <li><strong>Glass Tower:</strong> Each floor represents a function frame in the call stack</li>
      <li><strong>Elevator:</strong> Red cube shows current execution context moving between floors</li>
      <li><strong>Glowing Floors:</strong> Active function frames glow with blue light</li>
      <li><strong>Function Labels:</strong> Function names appear on active floors</li>
      <li><strong>Controls:</strong> Mouse to rotate camera, wheel to zoom, right-click to pan</li>
      <li><strong>Stack Operations:</strong> Use buttons to push/pop functions and see the tower animate</li>
    </ul>
  </div>
</div>

<style>
  .callstack-demo {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 900px;
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
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
  }

  .controls button:hover:not(:disabled) {
    background: #357abd;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
  }

  .controls button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .demo-btn {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24) !important;
    box-shadow: 0 2px 4px rgba(255, 107, 107, 0.2) !important;
  }

  .demo-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff5252, #e55100) !important;
    box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3) !important;
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

  .stack-info {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .stack-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #4ade80;
  }

  .stack-info p {
    margin: 0.25rem 0;
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
  :global(.dark) .callstack-demo {
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
    }
    
    .controls button {
      flex: 1;
      min-width: 0;
    }
    
    canvas {
      width: 100%;
      height: auto;
    }
    
    .stack-info {
      position: relative;
      top: 1rem;
      right: 0;
      margin-top: 1rem;
    }
  }
</style>