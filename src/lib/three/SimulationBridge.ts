import type { SimEvent, Token } from "../sim/types";
import type { SceneManager } from "./core/SceneManager";
import type { RenderLoop } from "./core/RenderLoop";
import { CallStack3D } from "./components/CallStack3D";
import { WebAPI3D } from "./components/WebAPI3D";
import { MicrotaskQueue3D } from "./components/MicrotaskQueue3D";
import { MacrotaskQueue3D } from "./components/MacrotaskQueue3D";
import { EventLoop3D } from "./components/EventLoop3D";
import { TokenManager3D } from "./tokens/TokenManager";

/**
 * Bridge between the simulation and 3D visualization system
 * Maps simulation events to 3D scene updates and maintains synchronization
 */
export class SimulationBridge {
  // Event callbacks
  private onNarrationUpdate?: (narration: string) => void;
  private onEventProcessed?: (event: SimEvent) => void;

  // 3D Scene management
  private scene?: any; // THREE.Scene
  private sceneManager?: SceneManager;
  private renderLoop?: RenderLoop;
  private THREE?: any; // Three.js module

  // 3D Objects for visualization areas
  private callStack?: CallStack3D;
  private webApi?: WebAPI3D;
  private microtaskQueue?: MicrotaskQueue3D;
  private macrotaskQueue?: MacrotaskQueue3D;
  private eventLoop?: EventLoop3D;
  private tokenManager?: TokenManager3D;
  private updateCallback?: (dt: number) => void;
  // Map simulation token id -> TokenManager internal id
  private tokenObjects: Map<string, string> = new Map();

  // State tracking for debugging and educational narration
  private eventHistory: SimEvent[] = [];
  private tokenRegistry: Map<string, Token> = new Map();

  // Animation timing
  private animationSpeed = 1;
  private baseDelay = 800; // ms
  private reducedMotion = false;

  constructor(
    options: {
      onNarrationUpdate?: (narration: string) => void;
      onEventProcessed?: (event: SimEvent) => void;
    } = {}
  ) {
    this.onNarrationUpdate = options.onNarrationUpdate;
    this.onEventProcessed = options.onEventProcessed;

    // Initialize 3D scene objects when Three.js is available
    this.initialize3D();
  }

  /**
   * Initialize the 3D scene objects
   */
  private async initialize3D(): Promise<void> {
    try {
      this.THREE = await import("three");
      console.log("🎬 SimulationBridge: Three.js loaded, ready to create 3D objects");
    } catch (error) {
      console.error("❌ Failed to load Three.js:", error);
    }
  }

  /**
   * Set the 3D scene for visualization
   */
  setScene(scene: any): void {
    this.scene = scene;
    console.log("🎭 SimulationBridge: Scene set, creating visualization areas");
    this.create3DVisualizationAreas();
  }

  /**
   * Attach to a SceneManager for full 3D integration
   */
  attachSceneManager(sceneManager: SceneManager): void {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.getScene();
    this.renderLoop = sceneManager.getRenderLoop();

    // Detect reduced motion preference
    try {
      this.reducedMotion =
        window?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    } catch {
      this.reducedMotion = false;
    }

    // Build 3D components
    this.buildComponents();

    // Register update callback
    this.updateCallback = (dt: number) => {
      try {
        this.callStack?.update(dt);
        this.webApi?.update(dt);
        this.microtaskQueue?.update(dt);
        this.macrotaskQueue?.update(dt);
        this.eventLoop?.update(dt);
        this.tokenManager?.update(dt);
      } catch (err) {
        console.error("SimulationBridge update error:", err);
      }
    };
    this.renderLoop.addUpdateCallback(this.updateCallback);

    console.log("🔗 SimulationBridge attached to SceneManager with full 3D components");
  }

  /**
   * Create 3D areas representing JavaScript execution areas
   */
  private create3DVisualizationAreas(): void {
    if (!this.scene || !this.THREE) return;

    // Remove existing test cubes first
    const testCubesToRemove: any[] = [];
    this.scene.traverse((child: any) => {
      if (child.isMesh && child.geometry.type === "BoxGeometry") {
        testCubesToRemove.push(child);
      }
    });
    testCubesToRemove.forEach((cube) => this.scene.remove(cube));

    // If attached to SceneManager, we'll build full components instead of placeholders
    if (this.sceneManager) {
      this.buildComponents();
      return;
    }

    // Minimal placeholder areas when not attached to SceneManager (for dev/testing)
    const callStackGeometry = new this.THREE.BoxGeometry(2, 6, 2);
    const callStackMaterial = new this.THREE.MeshBasicMaterial({
      color: 0x4caf50,
      wireframe: true,
    });
    const callStackArea = new this.THREE.Mesh(callStackGeometry, callStackMaterial);
    callStackArea.position.set(-6, 0, 0);
    this.scene.add(callStackArea);

    const webApiGeometry = new this.THREE.BoxGeometry(4, 1, 4);
    const webApiMaterial = new this.THREE.MeshBasicMaterial({ color: 0x2196f3, wireframe: true });
    const webApiArea = new this.THREE.Mesh(webApiGeometry, webApiMaterial);
    webApiArea.position.set(0, 4, 0);
    this.scene.add(webApiArea);

    const microtaskGeometry = new this.THREE.BoxGeometry(1, 0.5, 3);
    const microtaskMaterial = new this.THREE.MeshBasicMaterial({
      color: 0xff9800,
      wireframe: true,
    });
    const microtaskArea = new this.THREE.Mesh(microtaskGeometry, microtaskMaterial);
    microtaskArea.position.set(4, 1, 0);
    this.scene.add(microtaskArea);

    const macrotaskGeometry = new this.THREE.BoxGeometry(1, 0.5, 6);
    const macrotaskMaterial = new this.THREE.MeshBasicMaterial({
      color: 0x9c27b0,
      wireframe: true,
    });
    const macrotaskArea = new this.THREE.Mesh(macrotaskGeometry, macrotaskMaterial);
    macrotaskArea.position.set(6, -1, 0);
    this.scene.add(macrotaskArea);

    console.log("✅ SimulationBridge (placeholder): Created wireframe visualization areas");
  }

  /**
   * Build full 3D components and token manager
   */
  private buildComponents(): void {
    if (!this.scene) return;

    // Clean any previous components
    this.destroyComponents();

    try {
      // Core components
      this.callStack = new CallStack3D();
      this.webApi = new WebAPI3D();
      this.microtaskQueue = new MicrotaskQueue3D();
      this.eventLoop = new EventLoop3D(this.scene);
      this.macrotaskQueue = new MacrotaskQueue3D(this.scene);

      // Position helpers (align components nicely)
      this.callStack.position.set(-8, 0, 2);
      this.microtaskQueue.position.set(0, 0, 10);

      // Add to scene
      this.scene.add(this.callStack);
      this.scene.add(this.webApi);
      this.scene.add(this.microtaskQueue);
      // EventLoop3D and MacrotaskQueue3D already add their own meshes to the scene in constructors
      // but they are not THREE.Object3D groups; nothing to add here explicitly beyond their own setup.

      // Token manager
      this.tokenManager = new TokenManager3D(this.scene);
      this.tokenManager.setComponents({
        callStack: this.callStack,
        webAPI: this.webApi,
        microtaskQueue: this.microtaskQueue,
        macrotaskQueue: this.macrotaskQueue,
        eventLoop: this.eventLoop,
      });

      // Reduced motion adaptation
      if (this.reducedMotion) {
        this.animationSpeed = 0.75;
      }

      console.log("✅ SimulationBridge: Built full 3D components");
    } catch (err) {
      console.error("❌ Failed to build 3D components:", err);
    }
  }

  /**
   * Handle simulation event from the engine
   */
  handleSimEvent(event: SimEvent): void {
    console.log("🎬 SimulationBridge: Processing event", event);

    // Track event in history
    this.eventHistory.push(event);

    // Register tokens for tracking
    if (this.hasToken(event)) {
      const tokenEvent = event as any; // Type assertion since we know it has a token
      this.tokenRegistry.set(tokenEvent.token.id, tokenEvent.token);
    }

    // Generate educational narration
    if (this.onNarrationUpdate) {
      const narration = this.generateNarration(event);
      this.onNarrationUpdate(narration);
    }

    // Process event for 3D visualization
    try {
      this.processEventFor3D(event);
    } catch (err) {
      console.error("❌ SimulationBridge 3D processing error:", err);
    }

    // Callback to notify processing complete
    if (this.onEventProcessed) {
      this.onEventProcessed(event);
    }
  }

  /**
   * Check if event contains a token
   */
  private hasToken(event: SimEvent): boolean {
    return "token" in event && event.token !== undefined;
  }

  /**
   * Process event specifically for 3D visualization
   */
  private processEventFor3D(event: SimEvent): void {
    // If full 3D is not attached, keep debug logs only
    if (!this.sceneManager || !this.tokenManager) {
      switch (event.type) {
        case "sync":
          console.log("⚡ 3D: Sync execution", event.description);
          break;
        case "token-move":
          console.log(`🎯 3D: Token ${event.token.label} moving from ${event.from} to ${event.to}`);
          break;
        case "microtask-drain":
          console.log("🚀 3D: Microtask queue activating");
          break;
        case "macrotask-run":
          console.log("🏭 3D: Macrotask queue activating");
          break;
        case "scenario-end":
          console.log("🎬 3D: Scenario completed");
          break;
        default:
          console.log(`🔧 3D: Event ${event.type}`);
      }
      return;
    }

    // Full 3D mapping
    switch (event.type) {
      case "sync": {
        // Highlight call stack activity subtly
        this.eventLoop?.setActivePhase("callstack");
        break;
      }
      case "stack-push": {
        this.callStack?.pushFunction({
          id: `frame-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label: event.frame,
          functionName: event.frame,
          isActive: true,
        });
        break;
      }
      case "stack-pop": {
        this.callStack?.popFunction();
        break;
      }
      case "webapi-add": {
        // Move/create token into WebAPI area
        const internalId = this.ensureToken3D(event.token);
        this.tokenManager!.moveToWebAPI(internalId);
        break;
      }
      case "webapi-complete": {
        // Visual feedback handled when enqueued to a queue next
        break;
      }
      case "enqueue-micro": {
        const internalId = this.ensureToken3D(event.token);
        this.tokenManager!.moveToMicrotaskQueue(internalId);
        this.microtaskQueue?.addMicrotask("promise");
        break;
      }
      case "enqueue-macro": {
        const internalId = this.ensureToken3D(event.token);
        this.tokenManager!.moveToMacrotaskQueue(internalId);
        // Mirror container on conveyor belt
        this.macrotaskQueue?.addMacrotask({
          id: event.token.id,
          type: "timeout",
          content: event.token.label,
          priority: 1,
          addedAt: Date.now(),
        });
        break;
      }
      case "dequeue-micro": {
        // Process a microtask token through event loop
        {
          const internalId = this.tokenObjects.get(event.token.id) || event.token.id;
          this.tokenManager!.processWithEventLoop(internalId);
        }
        break;
      }
      case "dequeue-macro": {
        // Process a macrotask token and advance belt
        this.macrotaskQueue?.processMacrotask();
        {
          const internalId = this.tokenObjects.get(event.token.id) || event.token.id;
          this.tokenManager!.processWithEventLoop(internalId);
        }
        break;
      }
      case "token-move": {
        // General movement directive from scenario
        const internalId = this.ensureToken3D(event.token);
        if (event.to === "call-stack") this.tokenManager!.moveToCallStack(internalId);
        else if (event.to === "web-api") this.tokenManager!.moveToWebAPI(internalId);
        else if (event.to === "microtask-queue")
          this.tokenManager!.moveToMicrotaskQueue(internalId);
        else if (event.to === "macrotask-queue")
          this.tokenManager!.moveToMacrotaskQueue(internalId);
        break;
      }
      case "microtask-drain": {
        this.eventLoop?.setActivePhase("microtasks");
        this.microtaskQueue?.setProcessing(true);
        break;
      }
      case "macrotask-run": {
        this.eventLoop?.setActivePhase("macrotasks");
        this.macrotaskQueue?.processMacrotask();
        break;
      }
      case "tick": {
        const map: Record<string, string> = {
          "run-sync": "callstack",
          "drain-micro": "microtasks",
          "run-macro": "macrotasks",
        };
        this.eventLoop?.setActivePhase(map[event.phase] || null);
        break;
      }
      case "scenario-end": {
        this.eventLoop?.setActivePhase(null);
        this.microtaskQueue?.setProcessing(false);
        break;
      }
      default: {
        // no-op
        break;
      }
    }
  }

  /**
   * Ensure a 3D token exists and is registered with the manager
   */
  private ensureToken3D(token: Token): string {
    if (!this.tokenManager) return token.id;

    // Return existing internal id if already created
    const existingInternal = this.tokenObjects.get(token.id);
    if (existingInternal && this.tokenManager.getToken(existingInternal)) {
      return existingInternal;
    }

    // Create a new token with mapped type and store mapping
    const typeMap: Record<string, Parameters<TokenManager3D["createToken"]>[0]["type"]> = {
      log: "sync",
      timer: "timer",
      promise: "promise",
      fetch: "fetch",
      microtask: "promise",
      macrotask: "timer",
      async: "promise",
    } as const;

    const mappedType = typeMap[token.type] ?? "sync";
    const created = this.tokenManager.createToken({ type: mappedType, content: token.label });
    const internalId = created.data.id;
    this.tokenObjects.set(token.id, internalId);
    return internalId;
  }

  /**
   * Generate educational narration for events
   */
  private generateNarration(event: SimEvent): string {
    switch (event.type) {
      case "sync":
        return event.description || "JavaScript is executing synchronous code on the Call Stack.";

      case "token-move": {
        const friendlyNames: { [key: string]: string } = {
          "call-stack": "the Call Stack",
          "web-api": "the Web APIs area",
          "microtask-queue": "the microtask VIP lane",
          "macrotask-queue": "the macrotask conveyor belt",
        };
        return `${event.token.label} moves to ${friendlyNames[event.to] || event.to}.`;
      }

      case "stack-push":
        return `📚 Pushing "${event.frame}" onto the Call Stack.`;

      case "stack-pop":
        return `📤 Popping "${event.frame}" from the Call Stack.`;

      case "enqueue-micro":
        return `🚀 Adding ${event.token.label} to the microtask VIP lane.`;

      case "enqueue-macro":
        return `🏭 Adding ${event.token.label} to the macrotask conveyor belt.`;

      case "dequeue-micro":
        return `⚡ Processing ${event.token.label} from the microtask queue.`;

      case "dequeue-macro":
        return `🏃 Processing ${event.token.label} from the macrotask queue.`;

      case "webapi-add":
        return `🌐 ${event.token.label} is being handled by Web APIs.`;

      case "webapi-complete":
        return `✅ Web API finished processing ${event.token.label}.`;

      case "microtask-drain":
        return event.description || "Promises zoom through the VIP lane (microtasks drain)!";

      case "macrotask-run":
        return event.description || "A timer moves off the conveyor belt (macrotask runs).";

      case "tick": {
        const phaseNames: { [key: string]: string } = {
          "run-sync": "executing synchronous code",
          "drain-micro": "draining the microtask queue",
          "run-macro": "running a macrotask",
        };
        return `⏰ Event loop is ${phaseNames[event.phase] || event.phase}.`;
      }

      case "scenario-end":
        return "🎉 All done! The JavaScript event loop has processed everything.";

      default:
        return `Event: ${(event as any).type}`;
    }
  }

  /**
   * Set animation speed to match simulation speed
   */
  setAnimationSpeed(speed: number): void {
    this.animationSpeed = speed;
    const delay = this.baseDelay / speed;
    console.log(`🎬 Animation speed set to ${speed}x (${delay}ms per step)`);
  }

  /**
   * Get current animation delay based on speed
   */
  getAnimationDelay(): number {
    return this.baseDelay / this.animationSpeed;
  }

  /**
   * Reset bridge state for new scenario
   */
  reset(): void {
    console.log("🔄 Resetting SimulationBridge");

    this.eventHistory = [];
    this.tokenRegistry.clear();
    this.tokenObjects.clear();
    // Reset 3D areas if present
    if (this.callStack) this.callStack.clearStack();
    if (this.microtaskQueue) this.microtaskQueue.clearAllMicrotasks();
  }

  /**
   * Get event history for debugging
   */
  getEventHistory(): SimEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Get registered tokens
   */
  getTokenRegistry(): Map<string, Token> {
    return new Map(this.tokenRegistry);
  }

  /**
   * Dispose bridge and cleanup resources
   */
  dispose(): void {
    console.log("🧹 Disposing SimulationBridge");
    this.reset();
    // Remove update callback
    if (this.updateCallback && this.renderLoop) {
      this.renderLoop.removeUpdateCallback(this.updateCallback);
      this.updateCallback = undefined;
    }
    // Dispose components
    this.destroyComponents();
  }

  /**
   * Destroy 3D components if they exist
   */
  private destroyComponents(): void {
    try {
      this.tokenManager?.dispose();
      this.tokenManager = undefined;

      this.callStack?.dispose();
      if (this.callStack && this.scene) this.scene.remove(this.callStack);
      this.callStack = undefined;

      this.webApi?.dispose?.();
      if (this.webApi && this.scene) this.scene.remove(this.webApi);
      this.webApi = undefined;

      this.microtaskQueue?.dispose();
      if (this.microtaskQueue && this.scene) this.scene.remove(this.microtaskQueue);
      this.microtaskQueue = undefined;

      this.macrotaskQueue?.dispose();
      this.macrotaskQueue = undefined;

      this.eventLoop?.dispose();
      this.eventLoop = undefined;
    } catch (err) {
      console.warn("SimulationBridge.destroyComponents warning:", err);
    }
  }
}
