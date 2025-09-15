/// <reference lib="dom" />
/// <reference lib="dom" />
import * as THREE from "three";

export interface RenderLoopOptions {
  enableAdaptiveQuality?: boolean;
  targetFps?: number;
  enablePerformanceMonitoring?: boolean;
}

export interface PerformanceStats {
  fps: number;
  frameTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export class RenderLoop {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private isRunning = false;
  private animationFrameId: number | null = null;

  // Performance monitoring
  private lastFrameTime = 0;
  private frameTimes: number[] = [];
  private renderTimes: number[] = [];
  private targetFps: number;
  private enableAdaptiveQuality: boolean;
  private enablePerformanceMonitoring: boolean;

  // Callbacks
  private updateCallbacks: Array<(deltaTime: number) => void> = [];
  private preRenderCallbacks: Array<() => void> = [];
  private postRenderCallbacks: Array<() => void> = [];

  // Adaptive quality settings
  private basePixelRatio = 1;
  private currentPixelRatio = 1;
  private qualityLevel = 1.0; // 0.5 = half quality, 1.0 = full quality

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    options: RenderLoopOptions = {}
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.targetFps = options.targetFps ?? 60;
    this.enableAdaptiveQuality = options.enableAdaptiveQuality ?? true;
    this.enablePerformanceMonitoring = options.enablePerformanceMonitoring ?? true;

    this.basePixelRatio = Math.min(window.devicePixelRatio, 2);
    this.currentPixelRatio = this.basePixelRatio;

    // Bind render method to maintain context
    this.render = this.render.bind(this);
  }

  /**
   * Start the render loop
   */
  start(): void {
    if (this.isRunning) {
      console.log("⚠️ RenderLoop: Already running, skipping start");
      return;
    }

    console.log("🎬 RenderLoop: Starting render loop...");
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.render();
    console.log("✅ RenderLoop: First render() called");
  }

  /**
   * Stop the render loop
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main render method
   */
  private render(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) * 0.001; // Convert to seconds
    this.lastFrameTime = currentTime;

    // Performance monitoring
    if (this.enablePerformanceMonitoring) {
      this.updatePerformanceStats(deltaTime);
    }

    // Adaptive quality adjustment
    if (this.enableAdaptiveQuality) {
      this.adjustQuality();
    }

    // Execute pre-render callbacks
    this.preRenderCallbacks.forEach((callback) => callback());

    // Execute update callbacks
    this.updateCallbacks.forEach((callback) => callback(deltaTime));

    // Render the scene
    const renderStartTime = performance.now();
    // Debug: Log every 60th frame to avoid spam
    if (Math.random() < 0.016) {
      // ~1/60 chance
      console.log("🖼️ RenderLoop: Rendering frame, scene objects:", this.scene.children.length);
    }
    this.renderer.render(this.scene, this.camera);
    const renderEndTime = performance.now();

    // Track render time
    if (this.enablePerformanceMonitoring) {
      const renderTime = renderEndTime - renderStartTime;
      this.renderTimes.push(renderTime);
      if (this.renderTimes.length > 60) {
        this.renderTimes.shift();
      }
    }

    // Execute post-render callbacks
    this.postRenderCallbacks.forEach((callback) => callback());

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.render);
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(deltaTime: number): void {
    // Track frame times for FPS calculation
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
  }

  /**
   * Adjust rendering quality based on performance
   */
  private adjustQuality(): void {
    const currentFps = this.getCurrentFps();
    const targetFps = this.targetFps;

    // If FPS is significantly below target, reduce quality
    if (currentFps < targetFps * 0.8) {
      this.qualityLevel = Math.max(0.5, this.qualityLevel - 0.1);
    }
    // If FPS is stable above target, increase quality
    else if (currentFps > targetFps * 0.95) {
      this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
    }

    // Apply quality changes
    const newPixelRatio = this.basePixelRatio * this.qualityLevel;
    if (Math.abs(newPixelRatio - this.currentPixelRatio) > 0.1) {
      this.currentPixelRatio = newPixelRatio;
      this.renderer.setPixelRatio(this.currentPixelRatio);
    }
  }

  /**
   * Add a callback that runs every frame before rendering
   */
  addUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallbacks.push(callback);
  }

  /**
   * Remove an update callback
   */
  removeUpdateCallback(callback: (deltaTime: number) => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  /**
   * Add a callback that runs before rendering each frame
   */
  addPreRenderCallback(callback: () => void): void {
    this.preRenderCallbacks.push(callback);
  }

  /**
   * Remove a pre-render callback
   */
  removePreRenderCallback(callback: () => void): void {
    const index = this.preRenderCallbacks.indexOf(callback);
    if (index > -1) {
      this.preRenderCallbacks.splice(index, 1);
    }
  }

  /**
   * Add a callback that runs after rendering each frame
   */
  addPostRenderCallback(callback: () => void): void {
    this.postRenderCallbacks.push(callback);
  }

  /**
   * Remove a post-render callback
   */
  removePostRenderCallback(callback: () => void): void {
    const index = this.postRenderCallbacks.indexOf(callback);
    if (index > -1) {
      this.postRenderCallbacks.splice(index, 1);
    }
  }

  /**
   * Get current FPS
   */
  getCurrentFps(): number {
    if (this.frameTimes.length === 0) return 0;

    const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return 1 / averageFrameTime;
  }

  /**
   * Get current performance statistics
   */
  getPerformanceStats(): PerformanceStats {
    const fps = this.getCurrentFps();
    const frameTime = this.frameTimes.length > 0 ? this.frameTimes[this.frameTimes.length - 1] : 0;
    const renderTime =
      this.renderTimes.length > 0 ? this.renderTimes[this.renderTimes.length - 1] : 0;

    const stats: PerformanceStats = {
      fps,
      frameTime: frameTime * 1000, // Convert to milliseconds
      renderTime,
    };

    // Add memory usage if available
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      stats.memoryUsage = memory.usedJSHeapSize / 1048576; // Convert to MB
    }

    return stats;
  }

  /**
   * Set target FPS
   */
  setTargetFps(fps: number): void {
    this.targetFps = fps;
  }

  /**
   * Enable/disable adaptive quality
   */
  setAdaptiveQuality(enabled: boolean): void {
    this.enableAdaptiveQuality = enabled;
    if (!enabled) {
      // Reset to full quality
      this.qualityLevel = 1.0;
      this.currentPixelRatio = this.basePixelRatio;
      this.renderer.setPixelRatio(this.currentPixelRatio);
    }
  }

  /**
   * Manually set quality level (0.5 - 1.0)
   */
  setQualityLevel(level: number): void {
    this.qualityLevel = Math.max(0.5, Math.min(1.0, level));
    this.currentPixelRatio = this.basePixelRatio * this.qualityLevel;
    this.renderer.setPixelRatio(this.currentPixelRatio);
  }

  /**
   * Get current quality level
   */
  getQualityLevel(): number {
    return this.qualityLevel;
  }

  /**
   * Enable/disable performance monitoring
   */
  setPerformanceMonitoring(enabled: boolean): void {
    this.enablePerformanceMonitoring = enabled;
    if (!enabled) {
      this.frameTimes.length = 0;
      this.renderTimes.length = 0;
    }
  }

  /**
   * Check if the render loop is currently running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Force a single frame render (useful when paused)
   */
  renderFrame(): void {
    if (this.isRunning) return; // Don't render if already running

    // Execute pre-render callbacks
    this.preRenderCallbacks.forEach((callback) => callback());

    // Execute update callbacks with 0 delta time
    this.updateCallbacks.forEach((callback) => callback(0));

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    // Execute post-render callbacks
    this.postRenderCallbacks.forEach((callback) => callback());
  }

  /**
   * Clean up the render loop
   */
  dispose(): void {
    this.stop();

    // Clear all callbacks
    this.updateCallbacks.length = 0;
    this.preRenderCallbacks.length = 0;
    this.postRenderCallbacks.length = 0;

    // Clear performance data
    this.frameTimes.length = 0;
    this.renderTimes.length = 0;
  }
}
