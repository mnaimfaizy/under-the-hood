import * as THREE from "three";
import { gsap } from "gsap";

/**
 * Base interface for all 3D tokens representing JavaScript tasks
 */
export interface Token3DData {
  id: string;
  type: "sync" | "promise" | "timer" | "fetch" | "dom" | "io";
  content: string;
  priority: number;
  createdAt: number;
  metadata?: Record<string, any>;
}

/**
 * Physics properties for token simulation
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
 * Path movement configuration
 */
export interface PathConfig {
  curve?: THREE.Curve<THREE.Vector3>;
  speed?: number;
  easing?: string;
  lookAhead?: boolean;
  rotateToDirection?: boolean;
  particles?: boolean;
}

/**
 * Token movement states for animation system
 */
export enum TokenState {
  IDLE = "idle",
  MOVING = "moving",
  QUEUED = "queued",
  PROCESSING = "processing",
  COMPLETED = "completed",
  DESTROYED = "destroyed",
}

/**
 * Abstract base class for all 3D token types
 * Provides common functionality and enforces consistent interface
 */
export abstract class Token3D {
  protected mesh: THREE.Group;
  protected geometry!: THREE.BufferGeometry;
  protected material!: THREE.Material | THREE.Material[];
  protected glowEffect?: THREE.Mesh;
  protected labelMesh?: THREE.Mesh;

  public readonly data: Token3DData;
  public state: TokenState = TokenState.IDLE;
  public position: THREE.Vector3 = new THREE.Vector3();
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public acceleration: THREE.Vector3 = new THREE.Vector3();
  public targetPosition: THREE.Vector3 = new THREE.Vector3();

  // Physics properties
  public physics: PhysicsProperties = {
    mass: 1.0,
    drag: 0.98,
    elasticity: 0.6,
    magnetism: 1.0,
    gravity: true,
    collisionRadius: 0.5,
  };

  // Path movement
  protected pathCurve?: THREE.Curve<THREE.Vector3>;
  protected pathProgress = 0;
  protected pathSpeed = 1.0;
  protected isFollowingPath = false;

  // Animation properties
  protected animationMixer?: THREE.AnimationMixer;
  protected currentTween?: any; // GSAP tween
  protected pulseAnimation?: any;
  protected motionTrail: THREE.Vector3[] = [];

  constructor(data: Token3DData) {
    this.data = data;
    this.mesh = new THREE.Group();
    this.mesh.name = `token-${data.type}-${data.id}`;

    // Initialize token
    this.createGeometry();
    this.createMaterial();
    this.createMesh();
    this.createLabel();
    this.createGlowEffect();
    this.setupInitialAnimations();
  }

  /**
   * Abstract methods that must be implemented by token subclasses
   */
  protected abstract createGeometry(): void;
  protected abstract createMaterial(): void;
  protected abstract getBaseColor(): number;
  protected abstract getEmissiveColor(): number;

  /**
   * Create the main mesh from geometry and material
   */
  protected createMesh(): void {
    const mainMesh = new THREE.Mesh(this.geometry, this.material);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    this.mesh.add(mainMesh);
  }

  /**
   * Create text label showing token content
   */
  protected createLabel(): void {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    // Draw label background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, 8);
    ctx.fill();

    // Draw text
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.data.content, canvas.width / 2, canvas.height / 2);

    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    this.labelMesh.position.y = 1.5;
    this.labelMesh.visible = false; // Hidden by default, shown on hover
    this.mesh.add(this.labelMesh);
  }

  /**
   * Create glow effect for visual appeal
   */
  protected createGlowEffect(): void {
    const glowGeometry = this.geometry.clone();
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.getEmissiveColor(),
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });

    this.glowEffect = new THREE.Mesh(glowGeometry, glowMaterial);
    this.glowEffect.scale.setScalar(1.1);
    this.mesh.add(this.glowEffect);
  }

  /**
   * Set up initial idle animations
   */
  protected setupInitialAnimations(): void {
    // Gentle floating animation
    this.pulseAnimation = gsap.to(this.mesh.scale, {
      x: 1.05,
      y: 1.05,
      z: 1.05,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    // Gentle rotation
    gsap.to(this.mesh.rotation, {
      y: Math.PI * 2,
      duration: 10,
      repeat: -1,
      ease: "none",
    });
  }

  /**
   * Move token to target position with animation
   */
  moveTo(target: THREE.Vector3, duration: number = 1): Promise<void> {
    this.state = TokenState.MOVING;
    this.targetPosition.copy(target);

    return new Promise((resolve) => {
      if (this.currentTween) {
        this.currentTween.kill();
      }

      this.currentTween = gsap.to(this.mesh.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration,
        ease: "power2.inOut",
        onComplete: () => {
          this.state = TokenState.IDLE;
          resolve();
        },
      });
    });
  }

  /**
   * Move token along a curved path with physics-aware smooth movement
   */
  moveAlongPath(pathConfig: PathConfig): Promise<void> {
    if (!pathConfig.curve) {
      return Promise.reject("No curve provided in path config");
    }

    this.state = TokenState.MOVING;
    this.pathCurve = pathConfig.curve;
    this.pathProgress = 0;
    this.pathSpeed = pathConfig.speed || 1.0;
    this.isFollowingPath = true;

    return new Promise((resolve) => {
      const updatePath = () => {
        if (!this.isFollowingPath || !this.pathCurve) {
          resolve();
          return;
        }

        this.pathProgress += this.pathSpeed * 0.016; // Approximate 60fps delta

        if (this.pathProgress >= 1.0) {
          this.pathProgress = 1.0;
          this.isFollowingPath = false;
          this.state = TokenState.IDLE;
          resolve();
          return;
        }

        // Get position on curve
        const pathPosition = this.pathCurve.getPoint(this.pathProgress);

        // Smooth physics-based movement towards path position
        const direction = pathPosition.clone().sub(this.mesh.position);
        const distance = direction.length();

        if (distance > 0.1) {
          direction.normalize();
          this.velocity.add(direction.multiplyScalar(this.pathSpeed * 10));

          // Apply drag
          this.velocity.multiplyScalar(this.physics.drag);

          // Update position
          this.mesh.position.add(this.velocity.clone().multiplyScalar(0.016));

          // Rotate to face movement direction if requested
          if (pathConfig.rotateToDirection && this.velocity.lengthSq() > 0.01) {
            const lookDirection = this.velocity.clone().normalize();
            this.mesh.lookAt(this.mesh.position.clone().add(lookDirection));
          }
        }

        // Continue path following
        requestAnimationFrame(updatePath);
      };

      updatePath();
    });
  }

  /**
   * Apply physics-based impulse to token
   */
  applyImpulse(force: THREE.Vector3): void {
    const impulse = force.clone().divideScalar(this.physics.mass);
    this.velocity.add(impulse);
  }

  /**
   * Set target with magnetic attraction (smooth physics-based movement)
   */
  setMagneticTarget(target: THREE.Vector3, strength: number = 5.0): void {
    this.targetPosition.copy(target);

    const direction = target.clone().sub(this.mesh.position);
    const distance = direction.length();

    if (distance > 0.1) {
      direction.normalize();

      // Apply magnetic force inversely proportional to distance
      const magneticForce = direction.multiplyScalar(
        (strength * this.physics.magnetism) / Math.max(distance, 0.5)
      );
      this.applyImpulse(magneticForce);
    }
  }

  /**
   * Create smooth curved path between points
   */
  createSmoothPath(waypoints: THREE.Vector3[]): THREE.Curve<THREE.Vector3> {
    if (waypoints.length < 2) {
      throw new Error("Need at least 2 waypoints to create a path");
    }

    if (waypoints.length === 2) {
      // Simple line for 2 points
      return new THREE.LineCurve3(waypoints[0], waypoints[1]);
    }

    // Create smooth spline curve for multiple points
    return new THREE.CatmullRomCurve3(waypoints, false, "catmullrom", 0.5);
  }

  /**
   * Create orbital path around a center point
   */
  createOrbitPath(
    center: THREE.Vector3,
    radius: number,
    startAngle: number = 0,
    endAngle: number = Math.PI * 2
  ): THREE.Curve<THREE.Vector3> {
    const points: THREE.Vector3[] = [];
    const segments = 32;

    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / segments);
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, center.y, z));
    }

    return new THREE.CatmullRomCurve3(points, true);
  }

  /**
   * Create bezier curve path for smooth arcing movement
   */
  createArcPath(
    start: THREE.Vector3,
    end: THREE.Vector3,
    height: number = 2.0
  ): THREE.Curve<THREE.Vector3> {
    const mid = start.clone().lerp(end, 0.5);
    mid.y += height;

    const controlPoint1 = start.clone().lerp(mid, 0.5);
    controlPoint1.y += height * 0.3;

    const controlPoint2 = mid.clone().lerp(end, 0.5);
    controlPoint2.y += height * 0.3;

    return new THREE.CubicBezierCurve3(start, controlPoint1, controlPoint2, end);
  }

  /**
   * Add token to queue with stacking animation
   */
  addToQueue(position: THREE.Vector3, queueIndex: number): Promise<void> {
    this.state = TokenState.QUEUED;

    // Calculate stacked position
    const stackedPosition = position.clone();
    stackedPosition.y += queueIndex * 0.3; // Stack vertically

    return this.moveTo(stackedPosition, 0.5);
  }

  /**
   * Start processing animation
   */
  startProcessing(): void {
    this.state = TokenState.PROCESSING;

    // Intense glow and fast rotation
    if (this.glowEffect) {
      gsap.to(this.glowEffect.material as THREE.MeshBasicMaterial, {
        opacity: 0.8,
        duration: 0.3,
      });
    }

    gsap.to(this.mesh.rotation, {
      y: this.mesh.rotation.y + Math.PI * 4,
      duration: 1,
      ease: "power2.inOut",
    });
  }

  /**
   * Complete processing and trigger completion animation
   */
  complete(): Promise<void> {
    this.state = TokenState.COMPLETED;

    return new Promise((resolve) => {
      // Burst effect
      gsap.to(this.mesh.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
        onComplete: resolve,
      });

      // Fade glow
      if (this.glowEffect) {
        gsap.to(this.glowEffect.material as THREE.MeshBasicMaterial, {
          opacity: 0,
          duration: 0.5,
        });
      }
    });
  }

  /**
   * Destroy token with animation
   */
  destroy(): Promise<void> {
    this.state = TokenState.DESTROYED;

    return new Promise((resolve) => {
      // Kill all animations
      if (this.currentTween) this.currentTween.kill();
      if (this.pulseAnimation) this.pulseAnimation.kill();

      // Shrink and fade out
      gsap.to(this.mesh.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          this.dispose();
          resolve();
        },
      });
    });
  }

  /**
   * Show/hide label on hover
   */
  setLabelVisible(visible: boolean): void {
    if (this.labelMesh) {
      this.labelMesh.visible = visible;
    }
  }

  /**
   * Update token (called each frame)
   */
  update(deltaTime: number): void {
    // Physics integration
    if (this.velocity.lengthSq() > 0.01) {
      // Apply physics if velocity is significant
      this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));

      // Apply drag
      this.velocity.multiplyScalar(this.physics.drag);

      // Update motion trail for visual effects
      this.updateMotionTrail();

      // Update visual effects based on speed
      this.updateSpeedEffects();
    }

    // Path following updates
    if (this.isFollowingPath && this.pathCurve) {
      // This is handled in moveAlongPath, but we can add additional effects here
      const speed = this.velocity.length();
      if (speed > 2.0) {
        this.createMotionParticles();
      }
    }

    // Update animation mixer if present
    if (this.animationMixer) {
      this.animationMixer.update(deltaTime);
    }

    // Sync internal position with mesh position
    this.position.copy(this.mesh.position);
  }

  /**
   * Update motion trail for visual effects
   */
  protected updateMotionTrail(): void {
    const currentPos = this.mesh.position.clone();

    // Add current position to trail
    this.motionTrail.unshift(currentPos);

    // Limit trail length based on speed
    const speed = this.velocity.length();
    const maxTrailLength = Math.min(20, Math.max(5, Math.floor(speed * 3)));

    if (this.motionTrail.length > maxTrailLength) {
      this.motionTrail.splice(maxTrailLength);
    }
  }

  /**
   * Update visual effects based on movement speed
   */
  protected updateSpeedEffects(): void {
    const speed = this.velocity.length();

    if (speed > 1.0) {
      // Increase glow and scale with speed
      const intensity = Math.min(1.0, speed / 10.0);

      if (this.glowEffect) {
        const glowMaterial = this.glowEffect.material as THREE.MeshBasicMaterial;
        glowMaterial.opacity = 0.3 + intensity * 0.5;
        this.glowEffect.scale.setScalar(1.1 + intensity * 0.3);
      }

      // Add slight scale pulsing for high-speed movement
      if (speed > 5.0) {
        const pulse = Math.sin(Date.now() * 0.02) * 0.1 * intensity;
        this.mesh.children[0].scale.setScalar(1.0 + pulse);
      }
    } else {
      // Reset effects for slow movement
      if (this.glowEffect) {
        const glowMaterial = this.glowEffect.material as THREE.MeshBasicMaterial;
        glowMaterial.opacity = 0.3;
        this.glowEffect.scale.setScalar(1.1);
      }
    }
  }

  /**
   * Create particle effects for fast movement
   */
  protected createMotionParticles(): void {
    // This would emit particles from the token's position
    // The actual particle emission would be handled by TokenPhysics ParticlePhysics
    // For now, we just mark that particles should be emitted
    if (Math.random() < 0.3) {
      // 30% chance per frame when moving fast
      (this as any).shouldEmitParticles = true;
    }
  }

  /**
   * Get motion trail points for external rendering
   */
  getMotionTrail(): THREE.Vector3[] {
    return [...this.motionTrail]; // Return copy
  }

  /**
   * Set physics properties
   */
  setPhysicsProperties(properties: Partial<PhysicsProperties>): void {
    this.physics = { ...this.physics, ...properties };
  }

  /**
   * Check if should emit particles (for external particle system)
   */
  shouldEmitParticles(): boolean {
    const should = (this as any).shouldEmitParticles || false;
    (this as any).shouldEmitParticles = false; // Reset flag
    return should;
  }

  /**
   * Get the Three.js mesh for scene integration
   */
  getMesh(): THREE.Group {
    return this.mesh;
  }

  /**
   * Get current world position
   */
  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  /**
   * Set priority and update visual indicators
   */
  setPriority(priority: number): void {
    this.data.priority = priority;

    // Update visual priority indicators
    const intensity = Math.min(priority / 10, 1);
    if (this.glowEffect) {
      (this.glowEffect.material as THREE.MeshBasicMaterial).opacity = 0.2 + intensity * 0.5;
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // Kill animations
    if (this.currentTween) this.currentTween.kill();
    if (this.pulseAnimation) this.pulseAnimation.kill();

    // Dispose geometry and materials
    this.geometry.dispose();

    if (Array.isArray(this.material)) {
      this.material.forEach((material) => material.dispose());
    } else {
      this.material.dispose();
    }

    if (this.glowEffect) {
      this.glowEffect.geometry.dispose();
      (this.glowEffect.material as THREE.Material).dispose();
    }

    if (this.labelMesh) {
      this.labelMesh.geometry.dispose();
      (this.labelMesh.material as THREE.Material).dispose();
    }

    // Remove from scene
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}

/**
 * Draw rounded rectangle on canvas context
 */
function drawRoundedRect(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
