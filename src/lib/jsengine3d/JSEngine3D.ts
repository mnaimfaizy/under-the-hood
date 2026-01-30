import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols-ts";
import type { SimEvent } from "../sim/types";
import {
  CallStack,
  MicrotaskQueue,
  MacrotaskQueue,
  WebAPIs,
  EventLoop,
  ExecutionFlow,
} from "./components";

export interface JSEngine3DOptions {
  onPhaseChange?: (phase: string) => void;
  onNarration?: (text: string) => void;
}

export class JSEngine3D {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private options: JSEngine3DOptions;

  // Components
  private callStack: CallStack;
  private microtaskQueue: MicrotaskQueue;
  private macrotaskQueue: MacrotaskQueue;
  private webAPIs: WebAPIs;
  private eventLoop: EventLoop;
  private executionFlow: ExecutionFlow;

  // Animation
  private animationId: number | null = null;
  private currentPhase: string = "idle";

  constructor(canvas: HTMLCanvasElement, options: JSEngine3DOptions = {}) {
    this.canvas = canvas;
    this.options = options;

    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a15);
    this.scene.fog = new THREE.Fog(0x0a0a15, 40, 100);

    // Setup camera
    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(25, 20, 35);
    this.camera.lookAt(0, 5, 0);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    // Setup controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 70;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.target.set(0, 5, 0);

    // Setup lighting
    this.setupLighting();

    // Create components
    this.callStack = new CallStack(this.scene);
    this.microtaskQueue = new MicrotaskQueue(this.scene);
    this.macrotaskQueue = new MacrotaskQueue(this.scene);
    this.webAPIs = new WebAPIs(this.scene);
    this.eventLoop = new EventLoop(this.scene);
    this.executionFlow = new ExecutionFlow(this.scene);

    // Add reference grid
    this.addReferenceGrid();

    // Handle window resize
    window.addEventListener("resize", this.handleResize);

    // Start animation loop
    this.animate();
  }

  private setupLighting(): void {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x404060, 0.8);
    this.scene.add(ambient);

    // Main directional light (key light)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(20, 30, 15);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.left = -40;
    mainLight.shadow.camera.right = 40;
    mainLight.shadow.camera.top = 40;
    mainLight.shadow.camera.bottom = -40;
    mainLight.shadow.camera.near = 1;
    mainLight.shadow.camera.far = 100;
    this.scene.add(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    fillLight.position.set(-15, 10, -10);
    this.scene.add(fillLight);

    // Accent lights for each component
    const callStackLight = new THREE.PointLight(0x3498db, 1.5, 25);
    callStackLight.position.set(-12, 10, 0);
    this.scene.add(callStackLight);

    const microtaskLight = new THREE.PointLight(0x9b59b6, 1.2, 20);
    microtaskLight.position.set(0, 8, 12);
    this.scene.add(microtaskLight);

    const macrotaskLight = new THREE.PointLight(0xe67e22, 1.2, 20);
    macrotaskLight.position.set(0, 8, -12);
    this.scene.add(macrotaskLight);

    const webAPILight = new THREE.PointLight(0x27ae60, 1.0, 20);
    webAPILight.position.set(12, 8, 0);
    this.scene.add(webAPILight);
  }

  private addReferenceGrid(): void {
    const grid = new THREE.GridHelper(60, 30, 0x444466, 0x222233);
    grid.position.y = 0;
    this.scene.add(grid);

    // Add subtle glow to grid
    const gridMaterial = grid.material as THREE.Material;
    if ("opacity" in gridMaterial) {
      gridMaterial.opacity = 0.3;
      gridMaterial.transparent = true;
    }
  }

  private handleResize = (): void => {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Update controls
    this.controls.update();

    // Update components
    this.callStack.update();
    this.microtaskQueue.update();
    this.macrotaskQueue.update();
    this.webAPIs.update();
    this.eventLoop.update();
    this.executionFlow.update();

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  public handleEvent(event: SimEvent): void {
    switch (event.type) {
      case "stack-push":
        this.callStack.push(event.frame);
        this.setPhase("callstack");
        this.executionFlow.animateToCallStack();
        break;

      case "stack-pop":
        this.callStack.pop();
        break;

      case "enqueue-micro":
        this.microtaskQueue.enqueue(event.token.label);
        this.executionFlow.animateToMicrotasks();
        break;

      case "enqueue-macro":
        this.macrotaskQueue.enqueue(event.token.label);
        this.executionFlow.animateToMacrotasks();
        break;

      case "dequeue-micro":
        this.microtaskQueue.dequeue();
        this.setPhase("microtasks");
        break;

      case "dequeue-macro":
        this.macrotaskQueue.dequeue();
        this.setPhase("macrotasks");
        break;

      case "webapi-add":
        this.webAPIs.startAPI(event.token.label, event.token.type);
        this.executionFlow.animateToWebAPIs();
        break;

      case "webapi-complete":
        this.webAPIs.completeAPI(event.token.label);
        break;

      case "microtask-drain":
        this.setPhase("microtasks");
        this.eventLoop.setPhase("microtasks");
        break;

      case "tick":
        if (event.phase === "drain-micro") {
          this.eventLoop.setPhase("microtasks");
        } else if (event.phase === "run-macro") {
          this.eventLoop.setPhase("macrotasks");
        }
        break;

      case "scenario-end":
        this.setPhase("idle");
        this.eventLoop.setPhase("idle");
        break;
    }
  }

  private setPhase(phase: string): void {
    this.currentPhase = phase;
    if (this.options.onPhaseChange) {
      this.options.onPhaseChange(phase);
    }
  }

  public reset(): void {
    this.callStack.clear();
    this.microtaskQueue.clear();
    this.macrotaskQueue.clear();
    this.webAPIs.clear();
    this.eventLoop.setPhase("idle");
    this.executionFlow.reset();
    this.setPhase("idle");
  }

  public dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    window.removeEventListener("resize", this.handleResize);

    this.controls.dispose();
    this.renderer.dispose();

    // Dispose components
    this.callStack.dispose();
    this.microtaskQueue.dispose();
    this.macrotaskQueue.dispose();
    this.webAPIs.dispose();
    this.eventLoop.dispose();
    this.executionFlow.dispose();
  }
}
