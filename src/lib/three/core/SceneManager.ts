/// <reference lib="dom" />
import * as THREE from "three";
import Stats from "stats-js";
import { CameraController } from "./CameraController";
import { LightingSystem } from "./LightingSystem";
import { RenderLoop } from "./RenderLoop";

export interface SceneManagerOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  enableStats?: boolean;
  antialias?: boolean;
  alpha?: boolean;
}

export class SceneManager {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private cameraController: CameraController;
  private lightingSystem: LightingSystem;
  private renderLoop: RenderLoop;
  private stats?: Stats;

  private canvas: HTMLCanvasElement;
  private isDisposed = false;

  // Scene components
  private sceneObjects = new Map<string, THREE.Object3D>();

  constructor(options: SceneManagerOptions) {
    this.canvas = options.canvas;

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f0f23); // Dark blue background

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view
      options.width / options.height, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    this.camera.position.set(0, 5, 10);

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: options.antialias ?? true,
      alpha: options.alpha ?? false,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(options.width, options.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Initialize camera controller
    this.cameraController = new CameraController(this.camera, this.canvas);

    // Initialize lighting system
    this.lightingSystem = new LightingSystem(this.scene);

    // Initialize render loop
    this.renderLoop = new RenderLoop(this.renderer, this.scene, this.camera);

    // Initialize performance stats if enabled
    if (options.enableStats) {
      this.stats = new Stats();
      this.stats.showPanel(0); // Show FPS panel
      document.body.appendChild(this.stats.dom);
      this.stats.dom.style.position = "absolute";
      this.stats.dom.style.top = "0px";
      this.stats.dom.style.right = "0px";
      this.stats.dom.style.left = "auto";
    }

    // Start the render loop
    this.renderLoop.start();

    // Add stats update to render loop if enabled
    if (this.stats) {
      this.renderLoop.addUpdateCallback(() => {
        this.stats!.update();
      });
    }

    // Add camera controller update to render loop
    this.renderLoop.addUpdateCallback(() => {
      this.cameraController.update();
    });
  }

  /**
   * Add an object to the scene with an optional identifier
   */
  addObject(object: THREE.Object3D, id?: string): void {
    this.scene.add(object);
    if (id) {
      this.sceneObjects.set(id, object);
    }
  }

  /**
   * Remove an object from the scene by reference or ID
   */
  removeObject(objectOrId: THREE.Object3D | string): void {
    let object: THREE.Object3D | undefined;

    if (typeof objectOrId === "string") {
      object = this.sceneObjects.get(objectOrId);
      this.sceneObjects.delete(objectOrId);
    } else {
      object = objectOrId;
      // Remove from map if it exists there
      for (const [id, obj] of this.sceneObjects) {
        if (obj === object) {
          this.sceneObjects.delete(id);
          break;
        }
      }
    }

    if (object) {
      this.scene.remove(object);
    }
  }

  /**
   * Get an object by its ID
   */
  getObject(id: string): THREE.Object3D | undefined {
    return this.sceneObjects.get(id);
  }

  /**
   * Resize the renderer and update camera aspect ratio
   */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Get the scene (for direct manipulation if needed)
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get the camera (for direct manipulation if needed)
   */
  getCamera(): THREE.Camera {
    return this.camera;
  }

  /**
   * Get the renderer (for direct manipulation if needed)
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * Get the camera controller
   */
  getCameraController(): CameraController {
    return this.cameraController;
  }

  /**
   * Get the lighting system
   */
  getLightingSystem(): LightingSystem {
    return this.lightingSystem;
  }

  /**
   * Get the render loop
   */
  getRenderLoop(): RenderLoop {
    return this.renderLoop;
  }

  /**
   * Clean up resources and dispose of the scene manager
   */
  dispose(): void {
    if (this.isDisposed) return;

    this.isDisposed = true;

    // Stop render loop
    this.renderLoop.stop();

    // Dispose camera controller
    this.cameraController.dispose();

    // Dispose lighting system
    this.lightingSystem.dispose();

    // Clean up all scene objects
    for (const object of this.sceneObjects.values()) {
      this.scene.remove(object);
      // Recursively dispose of geometries and materials
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    }
    this.sceneObjects.clear();

    // Remove stats from DOM
    if (this.stats) {
      document.body.removeChild(this.stats.dom);
    }

    // Dispose renderer
    this.renderer.dispose();
  }
}
