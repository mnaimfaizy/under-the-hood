import * as THREE from "three";
import { gsap } from "gsap";
import { Token3D, type Token3DData } from "./Token3D";

/**
 * Synchronous task token - cube shape, immediate execution
 */
export class SyncToken3D extends Token3D {
  protected createGeometry(): void {
    this.geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  }

  protected createMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      color: this.getBaseColor(),
      emissive: this.getEmissiveColor(),
      emissiveIntensity: 0.1,
      roughness: 0.3,
      metalness: 0.7,
    });
  }

  protected getBaseColor(): number {
    return 0x3498db; // Blue
  }

  protected getEmissiveColor(): number {
    return 0x2980b9;
  }
}

/**
 * Promise token - diamond/octahedron shape for async operations
 */
export class PromiseToken3D extends Token3D {
  protected createGeometry(): void {
    this.geometry = new THREE.OctahedronGeometry(0.7);
  }

  protected createMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      color: this.getBaseColor(),
      emissive: this.getEmissiveColor(),
      emissiveIntensity: 0.15,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.9,
    });
  }

  protected getBaseColor(): number {
    return 0x9b59b6; // Purple
  }

  protected getEmissiveColor(): number {
    return 0x8e44ad;
  }

  /**
   * Promise-specific states and animations
   */
  resolve(): Promise<void> {
    return new Promise((resolve) => {
      // Change to green color
      (this.material as THREE.MeshStandardMaterial).color.setHex(0x27ae60);

      // Burst animation
      this.complete().then(resolve);
    });
  }

  reject(): Promise<void> {
    return new Promise((resolve) => {
      // Change to red color
      (this.material as THREE.MeshStandardMaterial).color.setHex(0xe74c3c);

      // Shake animation then complete
      const timeline = gsap.timeline();
      timeline
        .to(this.mesh.position, {
          x: this.mesh.position.x + 0.1,
          duration: 0.05,
          yoyo: true,
          repeat: 5,
        })
        .then(() => {
          this.complete().then(resolve);
        });
    });
  }
}

/**
 * Timer token - cylinder shape for setTimeout/setInterval
 */
export class TimerToken3D extends Token3D {
  private countdownMesh?: THREE.Mesh;
  private delay: number;
  private startTime: number;

  constructor(data: Token3DData & { delay?: number }) {
    super(data);
    this.delay = data.delay || 1000;
    this.startTime = Date.now();
    this.createCountdown();
  }

  protected createGeometry(): void {
    this.geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.2);
  }

  protected createMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      color: this.getBaseColor(),
      emissive: this.getEmissiveColor(),
      emissiveIntensity: 0.12,
      roughness: 0.4,
      metalness: 0.6,
    });
  }

  protected getBaseColor(): number {
    return 0xf39c12; // Orange
  }

  protected getEmissiveColor(): number {
    return 0xe67e22;
  }

  private createCountdown(): void {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.countdownMesh = new THREE.Mesh(geometry, material);
    this.countdownMesh.position.set(0, 0.8, 0);
    this.mesh.add(this.countdownMesh);

    this.updateCountdown(ctx, texture);
  }

  private updateCountdown(ctx: any, texture: THREE.CanvasTexture): void {
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.delay - elapsed);
    const progress = 1 - remaining / this.delay;

    ctx.clearRect(0, 0, 128, 128);

    // Draw countdown circle
    const centerX = 64;
    const centerY = 64;
    const radius = 50;

    // Background circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Progress arc
    ctx.strokeStyle = "#f39c12";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.stroke();

    // Remaining time text
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((remaining / 1000).toFixed(1) + "s", centerX, centerY);

    texture.needsUpdate = true;

    if (remaining > 0) {
      requestAnimationFrame(() => this.updateCountdown(ctx, texture));
    }
  }

  override update(deltaTime: number): void {
    super.update(deltaTime);

    // Auto-complete when timer expires
    const elapsed = Date.now() - this.startTime;
    if (elapsed >= this.delay && this.state !== "completed" && this.state !== "destroyed") {
      this.complete();
    }
  }
}

/**
 * Fetch/AJAX token - sphere shape for network operations
 */
export class FetchToken3D extends Token3D {
  private wireframe?: THREE.Mesh;

  protected createGeometry(): void {
    this.geometry = new THREE.SphereGeometry(0.6, 16, 16);
  }

  protected createMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      color: this.getBaseColor(),
      emissive: this.getEmissiveColor(),
      emissiveIntensity: 0.1,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8,
    });
  }

  protected getBaseColor(): number {
    return 0x1abc9c; // Teal
  }

  protected getEmissiveColor(): number {
    return 0x16a085;
  }

  protected override createMesh(): void {
    super.createMesh();

    // Add wireframe overlay for network effect
    const wireframeGeometry = this.geometry.clone();
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });

    this.wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    this.mesh.add(this.wireframe);
  }

  override startProcessing(): void {
    super.startProcessing();

    // Animate wireframe for network activity
    if (this.wireframe) {
      gsap.to(this.wireframe.material as THREE.MeshBasicMaterial, {
        opacity: 0.8,
        duration: 0.3,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  override complete(): Promise<void> {
    // Stop wireframe animation
    if (this.wireframe) {
      gsap.killTweensOf(this.wireframe.material);
      (this.wireframe.material as THREE.MeshBasicMaterial).opacity = 0.3;
    }

    return super.complete();
  }
}

/**
 * DOM event token - tetrahedron shape for DOM interactions
 */
export class DOMToken3D extends Token3D {
  protected createGeometry(): void {
    this.geometry = new THREE.TetrahedronGeometry(0.8);
  }

  protected createMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      color: this.getBaseColor(),
      emissive: this.getEmissiveColor(),
      emissiveIntensity: 0.15,
      roughness: 0.3,
      metalness: 0.5,
    });
  }

  protected getBaseColor(): number {
    return 0xe74c3c; // Red
  }

  protected getEmissiveColor(): number {
    return 0xc0392b;
  }
}

/**
 * I/O operation token - torus shape for file/database operations
 */
export class IOToken3D extends Token3D {
  protected createGeometry(): void {
    this.geometry = new THREE.TorusGeometry(0.5, 0.2, 8, 16);
  }

  protected createMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      color: this.getBaseColor(),
      emissive: this.getEmissiveColor(),
      emissiveIntensity: 0.1,
      roughness: 0.5,
      metalness: 0.4,
    });
  }

  protected getBaseColor(): number {
    return 0x34495e; // Dark Gray
  }

  protected getEmissiveColor(): number {
    return 0x2c3e50;
  }

  override startProcessing(): void {
    super.startProcessing();

    // Rotate around Y axis for I/O activity
    gsap.to(this.mesh.rotation, {
      y: this.mesh.rotation.y + Math.PI * 8,
      duration: 2,
      ease: "none",
      repeat: -1,
    });
  }
}

/**
 * Factory function to create appropriate token type
 */
export function createToken3D(data: Token3DData & { delay?: number }): Token3D {
  switch (data.type) {
    case "sync":
      return new SyncToken3D(data);
    case "promise":
      return new PromiseToken3D(data);
    case "timer":
      return new TimerToken3D(data);
    case "fetch":
      return new FetchToken3D(data);
    case "dom":
      return new DOMToken3D(data);
    case "io":
      return new IOToken3D(data);
    default:
      return new SyncToken3D(data);
  }
}
