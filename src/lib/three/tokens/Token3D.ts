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
  public targetPosition: THREE.Vector3 = new THREE.Vector3();

  // Animation properties
  protected animationMixer?: THREE.AnimationMixer;
  protected currentTween?: any; // GSAP tween
  protected pulseAnimation?: any;

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
    // Update position based on velocity if in physics mode
    if (this.state === TokenState.MOVING && this.velocity.lengthSq() > 0) {
      this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
      this.velocity.multiplyScalar(0.95); // Damping
    }

    // Update animation mixer if present
    if (this.animationMixer) {
      this.animationMixer.update(deltaTime);
    }
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
