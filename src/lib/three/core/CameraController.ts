/// <reference lib="dom" />
import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols-ts";

export interface CameraControllerOptions {
  enableDamping?: boolean;
  dampingFactor?: number;
  enableZoom?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  minAzimuthAngle?: number;
  maxAzimuthAngle?: number;
}

export interface CameraPreset {
  position: THREE.Vector3;
  target: THREE.Vector3;
  duration?: number;
}

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private canvas: HTMLCanvasElement;

  // Animation system
  private isAnimating = false;
  private animationCallbacks: Array<() => void> = [];

  // Preset positions
  private presets = new Map<string, CameraPreset>();

  constructor(
    camera: THREE.PerspectiveCamera,
    canvas: HTMLCanvasElement,
    options: CameraControllerOptions = {}
  ) {
    this.camera = camera;
    this.canvas = canvas;

    // Initialize orbit controls
    this.controls = new OrbitControls(this.camera, this.canvas);

    // Configure controls
    this.controls.enableDamping = options.enableDamping ?? true;
    this.controls.dampingFactor = options.dampingFactor ?? 0.05;
    this.controls.enableZoom = options.enableZoom ?? true;
    this.controls.enableRotate = options.enableRotate ?? true;
    this.controls.enablePan = options.enablePan ?? true;
    this.controls.autoRotate = options.autoRotate ?? false;
    this.controls.autoRotateSpeed = options.autoRotateSpeed ?? 2.0;

    // Set distance limits
    this.controls.minDistance = options.minDistance ?? 2;
    this.controls.maxDistance = options.maxDistance ?? 50;

    // Set angle limits
    this.controls.minPolarAngle = options.minPolarAngle ?? 0;
    this.controls.maxPolarAngle = options.maxPolarAngle ?? Math.PI;

    if (options.minAzimuthAngle !== undefined) {
      this.controls.minAzimuthAngle = options.minAzimuthAngle;
    }
    if (options.maxAzimuthAngle !== undefined) {
      this.controls.maxAzimuthAngle = options.maxAzimuthAngle;
    }

    // Set initial target (center of scene)
    this.controls.target.set(0, 0, 0);

    // Initialize camera presets
    this.initializePresets();

    // Handle keyboard controls for accessibility
    this.setupKeyboardControls();
  }

  /**
   * Initialize common camera presets
   */
  private initializePresets(): void {
    this.presets.set("overview", {
      position: new THREE.Vector3(15, 10, 15),
      target: new THREE.Vector3(0, 2, 0),
      duration: 1.5,
    });

    this.presets.set("callstack-focus", {
      position: new THREE.Vector3(-5, 8, 8),
      target: new THREE.Vector3(0, 4, 0),
      duration: 1.2,
    });

    this.presets.set("queues-view", {
      position: new THREE.Vector3(12, 3, 0),
      target: new THREE.Vector3(0, 1, 0),
      duration: 1.2,
    });

    this.presets.set("event-loop-detail", {
      position: new THREE.Vector3(0, 8, 12),
      target: new THREE.Vector3(0, 0, 0),
      duration: 1.0,
    });

    this.presets.set("side-view", {
      position: new THREE.Vector3(20, 5, 0),
      target: new THREE.Vector3(0, 2, 0),
      duration: 1.5,
    });

    this.presets.set("top-down", {
      position: new THREE.Vector3(0, 25, 0),
      target: new THREE.Vector3(0, 0, 0),
      duration: 1.8,
    });
  }

  /**
   * Setup keyboard controls for accessibility
   */
  private setupKeyboardControls(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      const step = 0.5;

      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          this.camera.position.z -= step;
          break;
        case "s":
        case "arrowdown":
          this.camera.position.z += step;
          break;
        case "a":
        case "arrowleft":
          this.camera.position.x -= step;
          break;
        case "d":
        case "arrowright":
          this.camera.position.x += step;
          break;
        case "q":
          this.camera.position.y += step;
          break;
        case "e":
          this.camera.position.y -= step;
          break;
        case "r":
          this.moveToPreset("overview");
          break;
        case "1":
          this.moveToPreset("callstack-focus");
          break;
        case "2":
          this.moveToPreset("queues-view");
          break;
        case "3":
          this.moveToPreset("event-loop-detail");
          break;
        case "4":
          this.moveToPreset("side-view");
          break;
        case "5":
          this.moveToPreset("top-down");
          break;
      }

      // Update controls target
      this.controls.update();
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Store reference for cleanup
    this.keydownHandler = handleKeyDown;
  }

  private keydownHandler?: (event: KeyboardEvent) => void;

  /**
   * Update the camera controls (should be called in render loop)
   */
  update(): void {
    this.controls.update();
  }

  /**
   * Move camera to a predefined preset position
   */
  moveToPreset(presetName: string, customDuration?: number): Promise<void> {
    const preset = this.presets.get(presetName);
    if (!preset) {
      console.warn(`Camera preset '${presetName}' not found`);
      return Promise.resolve();
    }

    return this.animateToPosition(
      preset.position.clone(),
      preset.target.clone(),
      customDuration ?? preset.duration ?? 1.5
    );
  }

  /**
   * Animate camera to a specific position and target
   */
  animateToPosition(
    position: THREE.Vector3,
    target: THREE.Vector3,
    duration: number = 1.5
  ): Promise<void> {
    if (this.isAnimating) {
      return Promise.resolve(); // Skip if already animating
    }

    return new Promise((resolve) => {
      this.isAnimating = true;

      // Store initial values
      const startPosition = this.camera.position.clone();
      const startTarget = this.controls.target.clone();

      // Animation progress
      let progress = 0;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / (duration * 1000), 1);

        // Use easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        // Interpolate position and target
        this.camera.position.lerpVectors(startPosition, position, easedProgress);
        this.controls.target.lerpVectors(startTarget, target, easedProgress);

        this.controls.update();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isAnimating = false;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Focus camera on a specific object
   */
  focusOnObject(object: THREE.Object3D, distance: number = 5): Promise<void> {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Calculate optimal distance based on object size
    const maxDim = Math.max(size.x, size.y, size.z);
    const optimalDistance = Math.max(distance, maxDim * 2);

    // Position camera at an angle for better view
    const position = new THREE.Vector3(
      center.x + optimalDistance * 0.7,
      center.y + optimalDistance * 0.5,
      center.z + optimalDistance * 0.7
    );

    return this.animateToPosition(position, center);
  }

  /**
   * Add a custom camera preset
   */
  addPreset(name: string, preset: CameraPreset): void {
    this.presets.set(name, preset);
  }

  /**
   * Remove a camera preset
   */
  removePreset(name: string): boolean {
    return this.presets.delete(name);
  }

  /**
   * Get available preset names
   */
  getPresetNames(): string[] {
    return Array.from(this.presets.keys());
  }

  /**
   * Enable/disable auto rotation
   */
  setAutoRotate(enabled: boolean, speed?: number): void {
    this.controls.autoRotate = enabled;
    if (speed !== undefined) {
      this.controls.autoRotateSpeed = speed;
    }
  }

  /**
   * Enable/disable controls
   */
  setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }

  /**
   * Get the underlying OrbitControls instance
   */
  getControls(): OrbitControls {
    return this.controls;
  }

  /**
   * Check if camera is currently animating
   */
  getIsAnimating(): boolean {
    return this.isAnimating;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // Remove keyboard event listener
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
    }

    // Dispose controls
    this.controls.dispose();

    // Clear presets
    this.presets.clear();

    // Clear callbacks
    this.animationCallbacks.length = 0;
  }
}
