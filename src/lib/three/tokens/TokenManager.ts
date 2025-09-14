import * as THREE from "three";
import { gsap } from "gsap";
import { Token3D, type Token3DData, TokenState, type PathConfig } from "./Token3D";
import { createToken3D } from "./TokenTypes";
import { CallStack3D } from "../components/CallStack3D";
import { WebAPI3D } from "../components/WebAPI3D";
import { MicrotaskQueue3D } from "../components/MicrotaskQueue3D";
import { MacrotaskQueue3D } from "../components/MacrotaskQueue3D";
import { EventLoop3D } from "../components/EventLoop3D";
import { TokenPhysics, ParticlePhysics } from "./TokenPhysics";

/**
 * Token creation configuration
 */
export interface TokenConfig {
  type: "sync" | "promise" | "timer" | "fetch" | "dom" | "io";
  content: string;
  priority?: number;
  delay?: number;
  metadata?: Record<string, any>;
}

/**
 * Animation path configuration
 */
export interface AnimationPath {
  points: THREE.Vector3[];
  duration: number;
  ease?: string;
  onComplete?: () => void;
}

/**
 * Token Manager - handles token lifecycle, movement, and scene integration
 */
export class TokenManager3D {
  private scene: THREE.Scene;
  private tokens: Map<string, Token3D> = new Map();
  private tokenCounter: number = 0;

  // Runtime components (injected)
  private callStack?: CallStack3D;
  private webAPI?: WebAPI3D;
  private microtaskQueue?: MicrotaskQueue3D;
  private macrotaskQueue?: MacrotaskQueue3D;
  private eventLoop?: EventLoop3D;

  // Animation tracking
  private activeAnimations: Set<string> = new Set();

  // Token pools for performance
  private tokenPools: Map<string, Token3D[]> = new Map();
  private readonly poolSize = 5;

  // Physics simulation
  private physics: TokenPhysics;
  private particles: ParticlePhysics;

  // Physics configuration
  private physicsEnabled: boolean = false;
  private magneticFields: Map<
    string,
    { position: THREE.Vector3; strength: number; falloff: number }
  > = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializePools();

    // Initialize physics systems
    this.physics = new TokenPhysics();
    this.particles = new ParticlePhysics(scene);

    // Setup default magnetic fields for runtime components
    this.setupDefaultMagneticFields();
  }

  /**
   * Set runtime components for token routing
   */
  setComponents(components: {
    callStack?: CallStack3D;
    webAPI?: WebAPI3D;
    microtaskQueue?: MicrotaskQueue3D;
    macrotaskQueue?: MacrotaskQueue3D;
    eventLoop?: EventLoop3D;
  }): void {
    Object.assign(this, components);
  }

  /**
   * Initialize token pools for performance
   */
  private initializePools(): void {
    const tokenTypes = ["sync", "promise", "timer", "fetch", "dom", "io"];

    tokenTypes.forEach((type) => {
      this.tokenPools.set(type, []);
    });
  }

  /**
   * Get or create token from pool
   */
  private getTokenFromPool(config: TokenConfig): Token3D {
    const pool = this.tokenPools.get(config.type) || [];

    if (pool.length > 0) {
      const token = pool.pop()!;

      // Verify token has required methods (in case of version mismatch)
      if (
        typeof token.shouldEmitParticles !== "function" ||
        typeof token.setPhysicsProperties !== "function"
      ) {
        console.warn("Token from pool missing required methods, creating new token");
        // Clear the pool to avoid future issues
        pool.length = 0;
      } else {
        // Reset token state
        token.state = TokenState.IDLE;
        return token;
      }
    }

    // Create new token
    const data: Token3DData & { delay?: number } = {
      id: `token-${++this.tokenCounter}`,
      type: config.type,
      content: config.content,
      priority: config.priority || 0,
      createdAt: Date.now(),
      metadata: config.metadata,
      delay: config.delay,
    };

    return createToken3D(data);
  }

  /**
   * Return token to pool
   */
  private returnTokenToPool(token: Token3D): void {
    const pool = this.tokenPools.get(token.data.type) || [];

    if (pool.length < this.poolSize) {
      // Reset token for reuse
      token.getMesh().position.set(0, 0, 0);
      token.getMesh().scale.set(1, 1, 1);
      token.getMesh().rotation.set(0, 0, 0);

      pool.push(token);
    } else {
      // Dispose if pool is full
      token.dispose();
    }
  }

  /**
   * Create and spawn a new token
   */
  createToken(
    config: TokenConfig,
    spawnPosition: THREE.Vector3 = new THREE.Vector3(0, 5, 0)
  ): Token3D {
    const token = this.getTokenFromPool(config);

    // Position token at spawn point
    token.getMesh().position.copy(spawnPosition);
    token.position.copy(spawnPosition);

    // Add to physics simulation if enabled
    if (this.physicsEnabled) {
      // Set physics properties based on token type
      const physicsProps = this.getPhysicsPropertiesForToken(config.type);
      if (typeof token.setPhysicsProperties === "function") {
        token.setPhysicsProperties(physicsProps);
      }
      this.physics.addToken(token, physicsProps);
    }

    // Add to scene
    this.scene.add(token.getMesh());
    this.tokens.set(token.data.id, token);

    console.log(`Created token ${token.data.id} at position:`, spawnPosition);
    console.log(`Token mesh:`, token.getMesh());
    console.log(`Scene children count after adding token:`, this.scene.children.length);

    // Animate spawn - start small and grow
    token.getMesh().scale.set(0.1, 0.1, 0.1);

    // Animate scale up
    gsap.to(token.getMesh().scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
    });

    if (this.physicsEnabled) {
      // Use magnetic attraction for spawn animation
      token.setMagneticTarget(spawnPosition, 15.0);
    } else {
      // Fallback to traditional animation
      token.moveTo(spawnPosition, 0.5);
    }

    // Emit spawn particles
    this.particles.emitParticles(spawnPosition, new THREE.Vector3(0, 2, 0), 8);

    return token;
  }

  /**
   * Get physics properties based on token type
   */
  private getPhysicsPropertiesForToken(type: string) {
    switch (type) {
      case "sync":
        return { mass: 0.8, drag: 0.95, elasticity: 0.7, magnetism: 1.2, collisionRadius: 0.4 };
      case "promise":
        return { mass: 1.2, drag: 0.98, elasticity: 0.5, magnetism: 0.8, collisionRadius: 0.6 };
      case "timer":
        return { mass: 0.6, drag: 0.99, elasticity: 0.8, magnetism: 1.5, collisionRadius: 0.3 };
      case "fetch":
        return { mass: 1.5, drag: 0.96, elasticity: 0.4, magnetism: 0.6, collisionRadius: 0.7 };
      case "dom":
        return { mass: 1.0, drag: 0.97, elasticity: 0.6, magnetism: 1.0, collisionRadius: 0.5 };
      case "io":
        return { mass: 1.8, drag: 0.94, elasticity: 0.3, magnetism: 0.5, collisionRadius: 0.8 };
      default:
        return { mass: 1.0, drag: 0.98, elasticity: 0.6, magnetism: 1.0, collisionRadius: 0.5 };
    }
  }

  /**
   * Move token to call stack
   */
  async moveToCallStack(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (!token || !this.callStack) return;

    this.activeAnimations.add(tokenId);

    try {
      // Get call stack position - place token near the top of the tower
      const stackDepth = this.callStack.getCurrentDepth();
      const stackPosition = this.callStack.position.clone();
      stackPosition.y += (stackDepth + 1) * 1.2; // Stack height with spacing

      // Update magnetic field for call stack
      this.updateMagneticField("callstack", stackPosition, 15.0);

      if (this.physicsEnabled) {
        // Create smart path to avoid collisions
        const pathConfig = this.createSmartPath(token.getPosition(), stackPosition);
        await token.moveAlongPath(pathConfig);
      } else {
        await token.moveTo(stackPosition, 1);
      }

      // Push function to call stack
      this.callStack.pushFunction({
        id: token.data.id,
        label: token.data.content,
        functionName: token.data.content,
        isActive: true,
        executionTime: Date.now(),
      });

      token.startProcessing();
    } finally {
      this.activeAnimations.delete(tokenId);
    }
  }

  /**
   * Move token to Web API area
   */
  async moveToWebAPI(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (!token || !this.webAPI) return;

    this.activeAnimations.add(tokenId);

    try {
      // Get available station based on token type
      const stations = this.webAPI.getAllStations();
      let targetStation = stations.find((s) => s.type === this.getAPIStationType(token.data.type));

      // Fallback to first available station
      if (!targetStation) {
        targetStation = stations[0];
      }

      await token.moveTo(targetStation.position, 1.2);

      // Activate the station
      this.webAPI.activateStation(targetStation.id, token.data.id);
      token.startProcessing();
    } finally {
      this.activeAnimations.delete(tokenId);
    }
  }

  /**
   * Move token to microtask queue
   */
  async moveToMicrotaskQueue(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (!token || !this.microtaskQueue) return;

    this.activeAnimations.add(tokenId);

    try {
      // Use the queue's position property and add some offset for stacking
      const queuePosition = this.microtaskQueue.position.clone();
      queuePosition.y += 1; // Slight elevation above queue

      await token.addToQueue(queuePosition, 0); // Queue handles its own indexing
    } finally {
      this.activeAnimations.delete(tokenId);
    }
  }

  /**
   * Move token to macrotask queue
   */
  async moveToMacrotaskQueue(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (!token || !this.macrotaskQueue) return;

    this.activeAnimations.add(tokenId);

    try {
      // Use a fixed position for the macrotask queue (it doesn't extend THREE.Group)
      // Position tokens near the conveyor belt area
      const queuePosition = new THREE.Vector3(5, 1, 0); // Right side, elevated

      await token.addToQueue(queuePosition, 0); // Queue handles its own indexing
    } finally {
      this.activeAnimations.delete(tokenId);
    }
  }

  /**
   * Process token through event loop
   */
  async processWithEventLoop(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (!token || !this.eventLoop) return;

    this.activeAnimations.add(tokenId);

    try {
      // Move to event loop center (using fixed position since EventLoop3D doesn't extend THREE.Group)
      const loopCenter = new THREE.Vector3(0, 2, 0); // Center of scene, elevated
      await token.moveTo(loopCenter, 0.8);

      // Simulate processing in event loop (the component doesn't have processToken method)
      token.startProcessing();
      await new Promise((resolve) => setTimeout(resolve, 800)); // Processing delay

      // Complete processing
      await token.complete();
    } finally {
      this.activeAnimations.delete(tokenId);
    }
  }

  /**
   * Animate token along custom path
   */
  async animateAlongPath(tokenId: string, path: AnimationPath): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (!token) return;

    this.activeAnimations.add(tokenId);

    try {
      // Create curve from path points
      const curve = new THREE.CatmullRomCurve3(path.points);
      const points = curve.getPoints(50);

      return new Promise<void>((resolve) => {
        let currentPoint = 0;
        const totalPoints = points.length;

        const animateNextPoint = () => {
          if (currentPoint >= totalPoints) {
            path.onComplete?.();
            resolve();
            return;
          }

          const targetPosition = points[currentPoint];
          const segmentDuration = path.duration / totalPoints;

          token.moveTo(targetPosition, segmentDuration).then(() => {
            currentPoint++;
            animateNextPoint();
          });
        };

        animateNextPoint();
      });
    } finally {
      this.activeAnimations.delete(tokenId);
    }
  }

  /**
   * Execute complete token lifecycle for a JavaScript task
   */
  async executeTokenFlow(config: TokenConfig): Promise<void> {
    const token = this.createToken(config);
    const tokenId = token.data.id;

    try {
      switch (config.type) {
        case "sync":
          await this.executeSync(tokenId);
          break;
        case "promise":
          await this.executePromise(tokenId);
          break;
        case "timer":
          await this.executeTimer(tokenId);
          break;
        case "fetch":
          await this.executeFetch(tokenId);
          break;
        case "dom":
          await this.executeDOM(tokenId);
          break;
        case "io":
          await this.executeIO(tokenId);
          break;
      }
    } finally {
      // Clean up
      setTimeout(() => {
        this.destroyToken(tokenId);
      }, 1000);
    }
  }

  /**
   * Synchronous execution flow
   */
  private async executeSync(tokenId: string): Promise<void> {
    await this.moveToCallStack(tokenId);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Processing time
    await this.processWithEventLoop(tokenId);
  }

  /**
   * Promise execution flow
   */
  private async executePromise(tokenId: string): Promise<void> {
    await this.moveToCallStack(tokenId);
    await this.moveToWebAPI(tokenId);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Async processing
    await this.moveToMicrotaskQueue(tokenId);
    await this.processWithEventLoop(tokenId);
  }

  /**
   * Timer execution flow
   */
  private async executeTimer(tokenId: string): Promise<void> {
    await this.moveToWebAPI(tokenId);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Timer delay
    await this.moveToMacrotaskQueue(tokenId);
    await this.processWithEventLoop(tokenId);
  }

  /**
   * Fetch execution flow
   */
  private async executeFetch(tokenId: string): Promise<void> {
    await this.moveToCallStack(tokenId);
    await this.moveToWebAPI(tokenId);
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Network delay
    await this.moveToMicrotaskQueue(tokenId);
    await this.processWithEventLoop(tokenId);
  }

  /**
   * DOM event execution flow
   */
  private async executeDOM(tokenId: string): Promise<void> {
    await this.moveToMacrotaskQueue(tokenId);
    await this.processWithEventLoop(tokenId);
  }

  /**
   * I/O execution flow
   */
  private async executeIO(tokenId: string): Promise<void> {
    await this.moveToWebAPI(tokenId);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // I/O delay
    await this.moveToMacrotaskQueue(tokenId);
    await this.processWithEventLoop(tokenId);
  }

  /**
   * Remove and destroy token
   */
  destroyToken(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (!token) return Promise.resolve();

    return token.destroy().then(() => {
      this.tokens.delete(tokenId);
      this.scene.remove(token.getMesh());
      this.returnTokenToPool(token);
    });
  }

  /**
   * Get token by ID
   */
  getToken(tokenId: string): Token3D | undefined {
    return this.tokens.get(tokenId);
  }

  /**
   * Get all active tokens
   */
  getAllTokens(): Token3D[] {
    return Array.from(this.tokens.values());
  }

  /**
   * Check if token is animating
   */
  isAnimating(tokenId: string): boolean {
    return this.activeAnimations.has(tokenId);
  }

  /**
   * Update all tokens (called each frame)
   */
  update(deltaTime: number): void {
    // Update physics simulation first
    this.updatePhysics(deltaTime);

    // Update individual tokens
    for (const token of this.tokens.values()) {
      token.update(deltaTime);
    }
  }

  /**
   * Map token type to API station type
   */
  private getAPIStationType(tokenType: string): "timer" | "network" | "dom" | "storage" {
    switch (tokenType) {
      case "timer":
        return "timer";
      case "fetch":
        return "network";
      case "dom":
        return "dom";
      case "io":
        return "storage";
      default:
        return "network";
    }
  }

  /**
   * Setup default magnetic fields for runtime components
   */
  private setupDefaultMagneticFields(): void {
    // These will be updated when components are set
    this.magneticFields.set("callstack", {
      position: new THREE.Vector3(0, 5, 0),
      strength: 10,
      falloff: 1.5,
    });

    this.magneticFields.set("webapi", {
      position: new THREE.Vector3(5, 0, 0),
      strength: 8,
      falloff: 2.0,
    });

    this.magneticFields.set("microtask", {
      position: new THREE.Vector3(0, -3, 3),
      strength: 12,
      falloff: 1.0,
    });

    this.magneticFields.set("macrotask", {
      position: new THREE.Vector3(-5, -3, 0),
      strength: 8,
      falloff: 2.0,
    });
  }

  /**
   * Update magnetic field position for a runtime component
   */
  updateMagneticField(component: string, position: THREE.Vector3, strength?: number): void {
    const field = this.magneticFields.get(component);
    if (field) {
      field.position.copy(position);
      if (strength !== undefined) {
        field.strength = strength;
      }

      // Update physics engine
      this.physics.removeForces("magnetic");
      for (const [, magneticField] of this.magneticFields) {
        this.physics.createMagneticField(
          magneticField.position,
          magneticField.strength,
          magneticField.falloff
        );
      }
    }
  }

  /**
   * Enable/disable physics simulation
   */
  setPhysicsEnabled(enabled: boolean): void {
    this.physicsEnabled = enabled;
  }

  /**
   * Create physics-aware path between components
   */
  createSmartPath(
    from: THREE.Vector3,
    to: THREE.Vector3,
    avoidCollisions: boolean = true
  ): PathConfig {
    const waypoints: THREE.Vector3[] = [from.clone()];

    if (avoidCollisions) {
      // Add intermediate waypoints to avoid collisions with other tokens
      const midpoint = from.clone().lerp(to, 0.5);
      midpoint.y += 2.0; // Arc over potential collisions
      waypoints.push(midpoint);
    }

    waypoints.push(to.clone());

    // Create the curve
    const curve =
      waypoints.length === 2
        ? new THREE.LineCurve3(waypoints[0], waypoints[1])
        : new THREE.CatmullRomCurve3(waypoints, false, "catmullrom", 0.5);

    return {
      curve,
      speed: 2.0,
      easing: "power2.inOut",
      lookAhead: true,
      rotateToDirection: true,
      particles: true,
    };
  }

  /**
   * Update physics simulation
   */
  updatePhysics(deltaTime: number): void {
    if (!this.physicsEnabled) return;

    try {
      // Update physics simulation
      this.physics.update(deltaTime);

      // Update particle effects
      this.particles.update(deltaTime);

      // Handle particle emission from tokens
      for (const token of this.tokens.values()) {
        if (typeof token.shouldEmitParticles === "function" && token.shouldEmitParticles()) {
          const position = token.getPosition();
          const velocity = token.velocity.clone();
          this.particles.emitParticles(position, velocity, 3);
        }
      }
    } catch (error) {
      console.error("Physics update error:", error);
      // Disable physics on error to prevent infinite errors
      this.physicsEnabled = false;
    }
  }

  /**
   * Create collision constraints between tokens
   */
  createTokenConstraints(
    tokenAId: string,
    tokenBId: string,
    type: "spring" | "rope" = "spring"
  ): void {
    const tokenA = this.tokens.get(tokenAId);
    const tokenB = this.tokens.get(tokenBId);

    if (tokenA && tokenB && type === "spring") {
      const distance = tokenA.getPosition().distanceTo(tokenB.getPosition());
      this.physics.createSpringConstraint(tokenA, tokenB, distance, 50.0);
    }
  }

  /**
   * Clean up all tokens and resources
   */
  dispose(): void {
    // Destroy all active tokens
    for (const tokenId of this.tokens.keys()) {
      this.destroyToken(tokenId);
    }

    // Clear pools
    for (const pool of this.tokenPools.values()) {
      for (const token of pool) {
        token.dispose();
      }
      pool.length = 0;
    }

    // Clean up physics systems
    this.physics.dispose();
    this.particles.dispose();

    this.tokens.clear();
    this.activeAnimations.clear();
    this.tokenPools.clear();
    this.magneticFields.clear();
  }
}
