import * as THREE from "three";
import { Token3D } from "./Token3D";

/**
 * Advanced physics properties for tokens
 */
export interface PhysicsProperties {
  mass: number;
  drag: number;
  elasticity: number;
  magnetism: number;
  gravity: boolean;
  collisionRadius: number;
}

/**
 * Force types that can be applied to tokens
 */
export interface Force {
  type: "gravity" | "magnetic" | "wind" | "spring" | "collision";
  strength: number;
  direction: THREE.Vector3;
  position?: THREE.Vector3;
  falloff?: number;
}

/**
 * Collision detection and response system
 */
export interface Collision {
  tokenA: Token3D;
  tokenB: Token3D;
  point: THREE.Vector3;
  normal: THREE.Vector3;
  penetration: number;
}

/**
 * Advanced physics engine for token interactions
 */
export class TokenPhysics {
  private tokens: Set<Token3D> = new Set();
  private forces: Force[] = [];
  private constraints: Constraint[] = [];

  // Physics configuration
  private gravity = new THREE.Vector3(0, -9.81, 0);
  private airDensity = 0.02;
  private timeStep = 1 / 60;

  // Spatial optimization
  private spatialGrid: Map<string, Token3D[]> = new Map();
  private gridSize = 2.0;

  // Collision detection
  private collisionPairs: Set<string> = new Set();
  private minCollisionDistance = 0.1;

  constructor() {
    this.setupDefaultForces();
  }

  /**
   * Add token to physics simulation
   */
  addToken(token: Token3D, properties: Partial<PhysicsProperties> = {}): void {
    this.tokens.add(token);

    // Set default physics properties
    const defaultProps: PhysicsProperties = {
      mass: 1.0,
      drag: 0.98,
      elasticity: 0.6,
      magnetism: 1.0,
      gravity: true,
      collisionRadius: 0.5,
      ...properties,
    };

    // Store physics properties on token
    (token as any).physics = defaultProps;

    // Initialize physics vectors if not present
    if (!token.velocity) {
      token.velocity = new THREE.Vector3();
    }
  }

  /**
   * Remove token from physics simulation
   */
  removeToken(token: Token3D): void {
    this.tokens.delete(token);
    this.clearConstraintsForToken(token);
  }

  /**
   * Add environmental force to simulation
   */
  addForce(force: Force): void {
    this.forces.push(force);
  }

  /**
   * Remove all forces of a specific type
   */
  removeForces(type: Force["type"]): void {
    this.forces = this.forces.filter((f) => f.type !== type);
  }

  /**
   * Create magnetic attraction between token and target position
   */
  createMagneticField(position: THREE.Vector3, strength: number, falloff: number = 1.0): void {
    this.addForce({
      type: "magnetic",
      strength,
      direction: new THREE.Vector3(),
      position: position.clone(),
      falloff,
    });
  }

  /**
   * Create spring constraint between two tokens
   */
  createSpringConstraint(
    tokenA: Token3D,
    tokenB: Token3D,
    restLength: number,
    stiffness: number
  ): void {
    const constraint: SpringConstraint = {
      type: "spring",
      tokenA,
      tokenB,
      restLength,
      stiffness,
      damping: 0.1,
    };

    this.constraints.push(constraint);
  }

  /**
   * Main physics update loop
   */
  update(deltaTime: number): void {
    // Update spatial grid for collision optimization
    this.updateSpatialGrid();

    // Apply forces to all tokens
    this.applyForces(deltaTime);

    // Resolve constraints
    this.resolveConstraints(deltaTime);

    // Detect and resolve collisions
    this.detectCollisions();
    this.resolveCollisions();

    // Integrate physics (velocity -> position)
    this.integratePhysics(deltaTime);

    // Update visual positions
    this.updateVisualPositions();
  }

  /**
   * Set up default environmental forces
   */
  private setupDefaultForces(): void {
    // Default gravity
    this.addForce({
      type: "gravity",
      strength: 9.81,
      direction: new THREE.Vector3(0, -1, 0),
    });
  }

  /**
   * Update spatial grid for efficient collision detection
   */
  private updateSpatialGrid(): void {
    this.spatialGrid.clear();

    for (const token of this.tokens) {
      const pos = token.getPosition();
      const gridX = Math.floor(pos.x / this.gridSize);
      const gridY = Math.floor(pos.y / this.gridSize);
      const gridZ = Math.floor(pos.z / this.gridSize);
      const key = `${gridX},${gridY},${gridZ}`;

      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, []);
      }
      this.spatialGrid.get(key)!.push(token);
    }
  }

  /**
   * Apply all forces to tokens
   */
  private applyForces(deltaTime: number): void {
    for (const token of this.tokens) {
      const physics = (token as any).physics as PhysicsProperties;
      const acceleration = new THREE.Vector3();

      // Apply environmental forces
      for (const force of this.forces) {
        const forceVector = this.calculateForce(token, force);
        acceleration.add(forceVector.multiplyScalar(1 / physics.mass));
      }

      // Apply drag
      const dragForce = token.velocity.clone().multiplyScalar(-this.airDensity * physics.drag);
      acceleration.add(dragForce);

      // Update velocity
      token.velocity.add(acceleration.multiplyScalar(deltaTime));

      // Apply velocity damping
      token.velocity.multiplyScalar(physics.drag);
    }
  }

  /**
   * Calculate force vector for a specific token and force
   */
  private calculateForce(token: Token3D, force: Force): THREE.Vector3 {
    const forceVector = new THREE.Vector3();
    const tokenPos = token.getPosition();
    const physics = (token as any).physics as PhysicsProperties;

    switch (force.type) {
      case "gravity":
        if (physics.gravity) {
          forceVector.copy(force.direction).multiplyScalar(force.strength * physics.mass);
        }
        break;

      case "magnetic":
        if (force.position) {
          const distance = tokenPos.distanceTo(force.position);
          if (distance > 0.01) {
            // Avoid division by zero
            const direction = force.position.clone().sub(tokenPos).normalize();
            const strength =
              (force.strength * physics.magnetism) / Math.pow(distance / (force.falloff || 1), 2);
            forceVector.copy(direction).multiplyScalar(strength);
          }
        }
        break;

      case "wind":
        forceVector.copy(force.direction).multiplyScalar(force.strength);
        break;

      case "collision":
        // Collision forces handled separately in collision resolution
        break;
    }

    return forceVector;
  }

  /**
   * Resolve all constraints (springs, ropes, etc.)
   */
  private resolveConstraints(deltaTime: number): void {
    for (const constraint of this.constraints) {
      switch (constraint.type) {
        case "spring":
          this.resolveSpringConstraint(constraint as SpringConstraint, deltaTime);
          break;
      }
    }
  }

  /**
   * Resolve spring constraint between two tokens
   */
  private resolveSpringConstraint(constraint: SpringConstraint, deltaTime: number): void {
    const posA = constraint.tokenA.getPosition();
    const posB = constraint.tokenB.getPosition();
    const distance = posA.distanceTo(posB);

    if (distance === 0) return;

    const displacement = distance - constraint.restLength;
    const springForce = displacement * constraint.stiffness;

    const direction = posB.clone().sub(posA).normalize();
    const forceVector = direction.multiplyScalar(springForce);

    // Apply equal and opposite forces
    const physicsA = (constraint.tokenA as any).physics as PhysicsProperties;
    const physicsB = (constraint.tokenB as any).physics as PhysicsProperties;

    constraint.tokenA.velocity.add(forceVector.clone().multiplyScalar(deltaTime / physicsA.mass));
    constraint.tokenB.velocity.sub(forceVector.clone().multiplyScalar(deltaTime / physicsB.mass));

    // Apply damping
    const relativeVelocity = constraint.tokenB.velocity.clone().sub(constraint.tokenA.velocity);
    const dampingForce = direction.multiplyScalar(
      relativeVelocity.dot(direction) * constraint.damping
    );

    constraint.tokenA.velocity.add(dampingForce.clone().multiplyScalar(deltaTime / physicsA.mass));
    constraint.tokenB.velocity.sub(dampingForce.clone().multiplyScalar(deltaTime / physicsB.mass));
  }

  /**
   * Detect collisions between tokens using spatial grid
   */
  private detectCollisions(): void {
    this.collisionPairs.clear();

    for (const [, tokens] of this.spatialGrid) {
      // Check collisions within each grid cell
      for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          if (this.checkCollision(tokens[i], tokens[j])) {
            const pairKey = this.getCollisionPairKey(tokens[i], tokens[j]);
            this.collisionPairs.add(pairKey);
          }
        }
      }
    }
  }

  /**
   * Check if two tokens are colliding
   */
  private checkCollision(tokenA: Token3D, tokenB: Token3D): boolean {
    const posA = tokenA.getPosition();
    const posB = tokenB.getPosition();
    const physicsA = (tokenA as any).physics as PhysicsProperties;
    const physicsB = (tokenB as any).physics as PhysicsProperties;

    const distance = posA.distanceTo(posB);
    const minDistance = physicsA.collisionRadius + physicsB.collisionRadius;

    return distance < minDistance;
  }

  /**
   * Resolve all detected collisions
   */
  private resolveCollisions(): void {
    for (const pairKey of this.collisionPairs) {
      const [tokenAId, tokenBId] = pairKey.split(",");
      const tokenA = Array.from(this.tokens).find((t) => t.data.id === tokenAId);
      const tokenB = Array.from(this.tokens).find((t) => t.data.id === tokenBId);

      if (tokenA && tokenB) {
        this.resolveCollision(tokenA, tokenB);
      }
    }
  }

  /**
   * Resolve collision between two tokens
   */
  private resolveCollision(tokenA: Token3D, tokenB: Token3D): void {
    const posA = tokenA.getPosition();
    const posB = tokenB.getPosition();
    const physicsA = (tokenA as any).physics as PhysicsProperties;
    const physicsB = (tokenB as any).physics as PhysicsProperties;

    // Calculate collision normal
    const normal = posB.clone().sub(posA);
    const distance = normal.length();

    if (distance === 0) return;

    normal.normalize();

    // Calculate penetration depth
    const minDistance = physicsA.collisionRadius + physicsB.collisionRadius;
    const penetration = minDistance - distance;

    // Separate tokens
    const separation = normal.clone().multiplyScalar(penetration * 0.5);
    tokenA.getMesh().position.sub(separation);
    tokenB.getMesh().position.add(separation);

    // Calculate relative velocity
    const relativeVelocity = tokenB.velocity.clone().sub(tokenA.velocity);
    const velocityAlongNormal = relativeVelocity.dot(normal);

    // Don't resolve if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Calculate elasticity
    const elasticity = Math.min(physicsA.elasticity, physicsB.elasticity);

    // Calculate impulse scalar
    const impulseScalar = -(1 + elasticity) * velocityAlongNormal;
    const totalMass = physicsA.mass + physicsB.mass;

    // Apply impulse
    const impulse = normal.clone().multiplyScalar(impulseScalar / totalMass);

    tokenA.velocity.sub(impulse.clone().multiplyScalar(physicsB.mass));
    tokenB.velocity.add(impulse.clone().multiplyScalar(physicsA.mass));
  }

  /**
   * Integrate physics to update positions
   */
  private integratePhysics(deltaTime: number): void {
    for (const token of this.tokens) {
      // Update position based on velocity
      const displacement = token.velocity.clone().multiplyScalar(deltaTime);
      token.getMesh().position.add(displacement);

      // Update token's internal position
      token.position.copy(token.getMesh().position);
    }
  }

  /**
   * Update visual positions and effects
   */
  private updateVisualPositions(): void {
    for (const token of this.tokens) {
      // Update any visual effects based on velocity
      const speed = token.velocity.length();

      // Add motion blur or trail effects based on speed
      if (speed > 5.0) {
        this.addMotionEffect(token, speed);
      }

      // Update glow intensity based on energy
      const energy = speed * 0.1;
      if ((token as any).glowEffect) {
        const glowMaterial = (token as any).glowEffect.material as THREE.MeshBasicMaterial;
        glowMaterial.opacity = Math.min(0.8, 0.2 + energy);
      }
    }
  }

  /**
   * Add motion effects to fast-moving tokens
   */
  private addMotionEffect(token: Token3D, speed: number): void {
    // Create particle trail or motion blur effect
    // This could be implemented with a particle system
    // For now, just increase glow effect
    const intensity = Math.min(1.0, speed / 10.0);

    if (token.getMesh().scale.x < 1.1) {
      token.getMesh().scale.multiplyScalar(1.0 + intensity * 0.1);
    }
  }

  /**
   * Clear all constraints involving a specific token
   */
  private clearConstraintsForToken(token: Token3D): void {
    this.constraints = this.constraints.filter(
      (constraint) =>
        (constraint as SpringConstraint).tokenA !== token &&
        (constraint as SpringConstraint).tokenB !== token
    );
  }

  /**
   * Generate collision pair key for tracking
   */
  private getCollisionPairKey(tokenA: Token3D, tokenB: Token3D): string {
    const idA = tokenA.data.id;
    const idB = tokenB.data.id;
    return idA < idB ? `${idA},${idB}` : `${idB},${idA}`;
  }

  /**
   * Clean up physics simulation
   */
  dispose(): void {
    this.tokens.clear();
    this.forces.length = 0;
    this.constraints.length = 0;
    this.spatialGrid.clear();
    this.collisionPairs.clear();
  }
}

/**
 * Constraint types for physics simulation
 */
interface Constraint {
  type: "spring" | "rope" | "rigid";
}

interface SpringConstraint extends Constraint {
  type: "spring";
  tokenA: Token3D;
  tokenB: Token3D;
  restLength: number;
  stiffness: number;
  damping: number;
}

/**
 * Particle system for motion effects and environmental atmosphere
 */
export class ParticlePhysics {
  private particles: Particle[] = [];
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.PointsMaterial;
  private points!: THREE.Points;

  private maxParticles = 1000;
  private particlePool: Particle[] = [];

  constructor(scene: THREE.Scene) {
    this.initializeParticleSystem(scene);
  }

  /**
   * Initialize GPU-based particle system
   */
  private initializeParticleSystem(scene: THREE.Scene): void {
    // Create geometry for particle system
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.maxParticles * 3);
    const colors = new Float32Array(this.maxParticles * 3);
    const sizes = new Float32Array(this.maxParticles);

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Create material with custom shader for performance
    this.material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    // Create points object
    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }

  /**
   * Emit particles from token position
   */
  emitParticles(position: THREE.Vector3, velocity: THREE.Vector3, count: number = 5): void {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticleFromPool();
      if (particle) {
        particle.position.copy(position);
        particle.velocity.copy(velocity);
        particle.velocity.add(this.randomVector().multiplyScalar(2.0));
        particle.life = 1.0;
        particle.maxLife = 1.0 + Math.random() * 2.0;
        particle.size = 0.05 + Math.random() * 0.1;
        particle.color.setHSL(0.6, 1.0, 0.5 + Math.random() * 0.5);

        this.particles.push(particle);
      }
    }
  }

  /**
   * Update particle system
   */
  update(deltaTime: number): void {
    // Update particle physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

      // Apply gravity and drag
      particle.velocity.y -= 9.81 * deltaTime;
      particle.velocity.multiplyScalar(0.98);

      // Update life
      particle.life -= deltaTime;

      // Remove dead particles
      if (particle.life <= 0) {
        this.returnParticleToPool(particle);
        this.particles.splice(i, 1);
      }
    }

    // Update GPU buffers
    this.updateParticleBuffers();
  }

  /**
   * Update GPU particle buffers for rendering
   */
  private updateParticleBuffers(): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const colors = this.geometry.attributes.color.array as Float32Array;
    const sizes = this.geometry.attributes.size.array as Float32Array;

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const i3 = i * 3;

      // Update position
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;

      // Update color with fade
      const alpha = particle.life / particle.maxLife;
      colors[i3] = particle.color.r * alpha;
      colors[i3 + 1] = particle.color.g * alpha;
      colors[i3 + 2] = particle.color.b * alpha;

      // Update size
      sizes[i] = particle.size * alpha;
    }

    // Mark attributes as needing update
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;

    // Update draw range
    this.geometry.setDrawRange(0, this.particles.length);
  }

  /**
   * Get particle from pool or create new one
   */
  private getParticleFromPool(): Particle | null {
    if (this.particlePool.length > 0) {
      return this.particlePool.pop()!;
    } else if (this.particles.length < this.maxParticles) {
      return new Particle();
    }
    return null;
  }

  /**
   * Return particle to pool for reuse
   */
  private returnParticleToPool(particle: Particle): void {
    this.particlePool.push(particle);
  }

  /**
   * Generate random vector
   */
  private randomVector(): THREE.Vector3 {
    return new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
  }

  /**
   * Dispose particle system
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    if (this.points.parent) {
      this.points.parent.remove(this.points);
    }
  }
}

/**
 * Individual particle for effects
 */
class Particle {
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  color = new THREE.Color();
  size = 0.1;
  life = 1.0;
  maxLife = 1.0;
}
