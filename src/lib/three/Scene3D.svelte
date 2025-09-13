<script lang="ts">
  /// <reference lib="dom" />
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { SceneManager, type SceneManagerOptions } from "./core/SceneManager";
  import type { PerformanceStats } from "./core/RenderLoop";

  // Props
  export let width: number = 800;
  export let height: number = 600;
  export let enableStats: boolean = false;
  export let antialias: boolean = true;
  export let alpha: boolean = false;
  export let autoStart: boolean = true;
  export let enableAdaptiveQuality: boolean = true;
  export let targetFps: number = 60;
  export let className: string = "";

  // Event dispatcher
  const dispatch = createEventDispatcher<{
    ready: { sceneManager: SceneManager };
    error: { error: Error };
    performanceUpdate: { stats: PerformanceStats };
    help: {};
    canvasClick: { event: MouseEvent; sceneManager: SceneManager; canvas: HTMLCanvasElement };
    canvasTouch: { event: TouchEvent; sceneManager: SceneManager; canvas: HTMLCanvasElement };
  }>();

  // Component state
  let canvasElement: HTMLCanvasElement;
  let sceneManager: SceneManager | null = null;
  let isInitialized = false;
  let errorMessage = "";

  // Performance monitoring
  let performanceStats: PerformanceStats = {
    fps: 0,
    frameTime: 0,
    renderTime: 0,
  };
  let performanceUpdateInterval: number | null = null;

  /**
   * Initialize the 3D scene
   */
  async function initializeScene(): Promise<void> {
    if (!canvasElement || isInitialized) return;

    try {
      const options: SceneManagerOptions = {
        canvas: canvasElement,
        width,
        height,
        enableStats,
        antialias,
        alpha,
      };

      sceneManager = new SceneManager(options);

      // Configure render loop
      const renderLoop = sceneManager.getRenderLoop();
      renderLoop.setTargetFps(targetFps);
      renderLoop.setAdaptiveQuality(enableAdaptiveQuality);

      // Setup performance monitoring
      if (enableStats) {
        performanceUpdateInterval = window.setInterval(() => {
          if (sceneManager) {
            performanceStats = sceneManager.getRenderLoop().getPerformanceStats();
            dispatch("performanceUpdate", { stats: performanceStats });
          }
        }, 1000); // Update every second
      }

      isInitialized = true;
      dispatch("ready", { sceneManager });
    } catch (error) {
      console.error("Failed to initialize 3D scene:", error);
      errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      dispatch("error", { error: error as Error });
    }
  }

  /**
   * Clean up resources
   */
  function cleanup(): void {
    if (performanceUpdateInterval !== null) {
      clearInterval(performanceUpdateInterval);
      performanceUpdateInterval = null;
    }

    if (sceneManager) {
      sceneManager.dispose();
      sceneManager = null;
    }

    isInitialized = false;
  }

  /**
   * Handle canvas resize
   */
  function handleResize(): void {
    if (sceneManager && isInitialized) {
      sceneManager.resize(width, height);
    }
  }

  // Lifecycle hooks
  onMount(() => {
    if (autoStart) {
      initializeScene();
    }
  });

  onDestroy(cleanup);

  // Reactive statements
  $: if (sceneManager && isInitialized) {
    handleResize();
  }

  $: if (sceneManager && enableAdaptiveQuality !== undefined) {
    sceneManager.getRenderLoop().setAdaptiveQuality(enableAdaptiveQuality);
  }

  $: if (sceneManager && targetFps !== undefined) {
    sceneManager.getRenderLoop().setTargetFps(targetFps);
  }

  // Public API - methods that parent components can call
  export function getSceneManager(): SceneManager | null {
    return sceneManager;
  }

  export function initialize(): Promise<void> {
    if (!isInitialized) {
      return initializeScene();
    }
    return Promise.resolve();
  }

  export function destroy(): void {
    cleanup();
  }

  export function resize(newWidth: number, newHeight: number): void {
    width = newWidth;
    height = newHeight;
    handleResize();
  }

  export function getCanvas(): HTMLCanvasElement {
    return canvasElement;
  }

  export function getPerformanceStats(): PerformanceStats {
    return performanceStats;
  }

  export function setQuality(level: number): void {
    if (sceneManager) {
      sceneManager.getRenderLoop().setQualityLevel(level);
    }
  }

  export function toggleStats(): void {
    enableStats = !enableStats;
  }

  export function isReady(): boolean {
    return isInitialized && sceneManager !== null;
  }

  // Accessibility support
  function handleKeyDown(event: KeyboardEvent): void {
    if (!sceneManager || !isInitialized) return;

    const cameraController = sceneManager.getCameraController();

    // Handle accessibility shortcuts
    switch (event.key.toLowerCase()) {
      case "escape":
        // Reset camera to overview
        cameraController.moveToPreset("overview");
        break;
      case "h":
        // Show help (dispatch event for parent to handle)
        dispatch("help", {});
        break;
      case "p":
        // Toggle performance stats
        toggleStats();
        break;
    }
  }

  // Touch and mouse event handlers for accessibility
  function handleCanvasClick(event: MouseEvent): void {
    if (!sceneManager || !isInitialized) return;

    // Focus canvas for keyboard navigation
    canvasElement.focus();

    // Dispatch click event with 3D scene context
    dispatch("canvasClick", {
      event,
      sceneManager,
      canvas: canvasElement,
    });
  }

  function handleCanvasTouch(event: TouchEvent): void {
    if (!sceneManager || !isInitialized) return;

    // Focus canvas for accessibility
    canvasElement.focus();

    // Dispatch touch event
    dispatch("canvasTouch", {
      event,
      sceneManager,
      canvas: canvasElement,
    });
  }
</script>

<!-- Canvas element -->
<canvas
  bind:this={canvasElement}
  {width}
  {height}
  class="three-canvas {className}"
  tabindex="0"
  aria-label="3D JavaScript Visualizer Scene"
  aria-describedby="scene-description"
  on:keydown={handleKeyDown}
  on:click={handleCanvasClick}
  on:touchstart={handleCanvasTouch}
></canvas>

<!-- Screen reader description -->
<div id="scene-description" class="sr-only">
  Interactive 3D visualization of JavaScript execution. Use arrow keys to navigate camera, R to
  reset view, number keys 1-5 for preset views, P to toggle performance stats, H for help, and
  Escape to return to overview.
  {#if errorMessage}
    Error: {errorMessage}
  {:else if isInitialized}
    Scene loaded successfully. FPS: {Math.round(performanceStats.fps)}
  {:else}
    Loading 3D scene...
  {/if}
</div>

<!-- Error display -->
{#if errorMessage && !isInitialized}
  <div class="error-overlay" role="alert">
    <h3>3D Scene Error</h3>
    <p>{errorMessage}</p>
    <button on:click={initializeScene} class="retry-button"> Retry Initialization </button>
  </div>
{/if}

<!-- Performance overlay (if enabled) -->
{#if enableStats && isInitialized}
  <div class="performance-overlay">
    <div class="performance-stat">
      <span class="stat-label">FPS:</span>
      <span class="stat-value">{Math.round(performanceStats.fps)}</span>
    </div>
    <div class="performance-stat">
      <span class="stat-label">Frame:</span>
      <span class="stat-value">{performanceStats.frameTime.toFixed(1)}ms</span>
    </div>
    <div class="performance-stat">
      <span class="stat-label">Render:</span>
      <span class="stat-value">{performanceStats.renderTime.toFixed(1)}ms</span>
    </div>
    {#if performanceStats.memoryUsage}
      <div class="performance-stat">
        <span class="stat-label">Memory:</span>
        <span class="stat-value">{performanceStats.memoryUsage.toFixed(1)}MB</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .three-canvas {
    display: block;
    border: none;
    outline: none;
    background-color: transparent;
    touch-action: none; /* Prevents default touch behaviors */
  }

  .three-canvas:focus {
    outline: 2px solid #4a90e2;
    outline-offset: 2px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .error-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(220, 53, 69, 0.9);
    color: white;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(220, 53, 69, 0.3);
  }

  .error-overlay h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .error-overlay p {
    margin: 0 0 1rem 0;
    opacity: 0.9;
  }

  .retry-button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .performance-overlay {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.75rem;
    border-radius: 6px;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.75rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 120px;
  }

  .performance-stat {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .performance-stat:last-child {
    margin-bottom: 0;
  }

  .stat-label {
    opacity: 0.8;
  }

  .stat-value {
    font-weight: bold;
    color: #4ade80;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .three-canvas:focus {
      outline: 3px solid currentColor;
    }

    .performance-overlay {
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid white;
    }

    .error-overlay {
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #dc3545;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .retry-button {
      transition: none;
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .performance-overlay {
      font-size: 0.7rem;
      padding: 0.5rem;
      top: 5px;
      left: 5px;
    }

    .error-overlay {
      padding: 1rem;
      font-size: 0.9rem;
    }
  }
</style>
