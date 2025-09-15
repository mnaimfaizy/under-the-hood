import * as THREE from "three";

export interface MicrotaskParticle {
  id: string;
  type: "promise" | "mutation" | "queueMicrotask" | "async";
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  progress: number;
  priority: number;
  isActive: boolean;
  createdAt: number;
}

export interface MicrotaskQueue3DOptions {
  tubeRadius?: number;
  tubeLength?: number;
  particleCount?: number;
  flowSpeed?: number;
  glowIntensity?: number;
  vipColor?: number;
}

export class MicrotaskQueue3D extends THREE.Group {
  private tubeGeometry!: THREE.TubeGeometry;
  private tubeMesh!: THREE.Mesh;
  private tubeMaterial!: THREE.MeshPhongMaterial;
  private glowMaterial!: THREE.MeshPhongMaterial;
  private glowMesh!: THREE.Mesh;

  // Particle system
  private particleGeometry!: THREE.BufferGeometry;
  private particleMaterial!: THREE.PointsMaterial;
  private particleSystem!: THREE.Points;
  private particles: MicrotaskParticle[];

  // Tube path and configuration
  private flowCurve!: THREE.CatmullRomCurve3;
  private tubeRadius: number;
  private tubeLength: number;
  private particleCount: number;
  private flowSpeed: number;
  private glowIntensity: number;
  private vipColor: number;

  // Animation state
  private time: number;
  private isProcessing: boolean;
  private processingSpeed: number;

  // Particle pool for performance
  private particlePool: MicrotaskParticle[];
  private activeParticles: Set<string>;

  constructor(options: MicrotaskQueue3DOptions = {}) {
    super();

    // Configuration
    this.tubeRadius = options.tubeRadius ?? 0.3;
    this.tubeLength = options.tubeLength ?? 20;
    this.particleCount = options.particleCount ?? 100;
    this.flowSpeed = options.flowSpeed ?? 2.0;
    this.glowIntensity = options.glowIntensity ?? 1.2;
    this.vipColor = options.vipColor ?? 0x00ffff; // Cyan VIP color

    // State
    this.time = 0;
    this.isProcessing = false;
    this.processingSpeed = 1.0;
    this.particles = [];
    this.particlePool = [];
    this.activeParticles = new Set();

    // Build the queue system
    this.createTubePath();
    this.createTubeGeometry();
    this.createTubeMaterials();
    this.createTubeMesh();
    this.createParticleSystem();
    this.createVIPEffects();

    this.name = "MicrotaskQueue3D";
  }

  private createTubePath(): void {
    // Create a curved path that shows the "fast lane" nature of microtasks
    const points = [
      new THREE.Vector3(-10, 2, 0), // Start point
      new THREE.Vector3(-5, 4, 2), // Curve up and forward
      new THREE.Vector3(0, 6, 0), // Peak point (VIP treatment)
      new THREE.Vector3(5, 4, -2), // Curve down
      new THREE.Vector3(10, 2, 0), // End point
    ];

    this.flowCurve = new THREE.CatmullRomCurve3(points);
    this.flowCurve.tension = 0.5; // Smooth curves
    this.flowCurve.closed = false;
  }

  private createTubeGeometry(): void {
    // Create the tube geometry along the curve
    this.tubeGeometry = new THREE.TubeGeometry(
      this.flowCurve,
      64, // tubular segments
      this.tubeRadius,
      16, // radial segments
      false // not closed
    );
  }

  private createTubeMaterials(): void {
    // Main tube material - translucent with emissive glow
    this.tubeMaterial = new THREE.MeshPhongMaterial({
      color: this.vipColor,
      emissive: new THREE.Color(this.vipColor).multiplyScalar(0.2),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      shininess: 100,
    });

    // Outer glow material
    this.glowMaterial = new THREE.MeshPhongMaterial({
      color: this.vipColor,
      emissive: new THREE.Color(this.vipColor).multiplyScalar(0.4),
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });
  }

  private createTubeMesh(): void {
    // Main tube
    this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);
    this.tubeMesh.castShadow = true;
    this.tubeMesh.receiveShadow = true;
    this.add(this.tubeMesh);

    // Glow effect - larger tube
    const glowGeometry = new THREE.TubeGeometry(
      this.flowCurve,
      32,
      this.tubeRadius * 1.5,
      12,
      false
    );

    this.glowMesh = new THREE.Mesh(glowGeometry, this.glowMaterial);
    this.add(this.glowMesh);

    // Add entrance and exit markers
    this.createEntranceExit();
  }

  private createEntranceExit(): void {
    // Entrance marker (where microtasks enter)
    const entranceGeometry = new THREE.SphereGeometry(0.5, 16, 12);
    const entranceMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x003300,
    });

    const entranceMesh = new THREE.Mesh(entranceGeometry, entranceMaterial);
    const startPoint = this.flowCurve.getPoint(0);
    entranceMesh.position.copy(startPoint);
    entranceMesh.userData = { isEntrance: true };
    this.add(entranceMesh);

    // Exit marker (where microtasks go to event loop)
    const exitGeometry = new THREE.SphereGeometry(0.5, 16, 12);
    const exitMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6600,
      emissive: 0x330011,
    });

    const exitMesh = new THREE.Mesh(exitGeometry, exitMaterial);
    const endPoint = this.flowCurve.getPoint(1);
    exitMesh.position.copy(endPoint);
    exitMesh.userData = { isExit: true };
    this.add(exitMesh);
  }

  private createParticleSystem(): void {
    // Initialize particle pool
    for (let i = 0; i < this.particleCount; i++) {
      this.particlePool.push(this.createParticle(`pool-${i}`, "promise"));
    }

    // Create particle geometry and material
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.add(this.particleSystem);
  }

  private createVIPEffects(): void {
    // Add speed indicator lines along the tube
    const speedLines = new THREE.Group();

    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      const point = this.flowCurve.getPoint(t);
      const nextPoint = this.flowCurve.getPoint(Math.min(t + 0.02, 1));

      const geometry = new THREE.BufferGeometry().setFromPoints([point, nextPoint]);
      const material = new THREE.LineBasicMaterial({
        color: this.vipColor,
        transparent: true,
        opacity: 0.4,
      });

      const line = new THREE.Line(geometry, material);
      speedLines.add(line);
    }

    speedLines.userData = { isSpeedLines: true };
    this.add(speedLines);
  }

  private createParticle(id: string, type: MicrotaskParticle["type"]): MicrotaskParticle {
    return {
      id,
      type,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      progress: 0,
      priority: this.getPriorityForType(type),
      isActive: false,
      createdAt: Date.now(),
    };
  }

  private getPriorityForType(type: MicrotaskParticle["type"]): number {
    // Different microtask types have different priorities
    switch (type) {
      case "promise":
        return 1.0;
      case "mutation":
        return 1.2; // MutationObserver is highest priority
      case "queueMicrotask":
        return 0.9;
      case "async":
        return 1.1;
      default:
        return 1.0;
    }
  }

  private getColorForType(type: MicrotaskParticle["type"]): THREE.Color {
    switch (type) {
      case "promise":
        return new THREE.Color(0x00ffff); // Cyan
      case "mutation":
        return new THREE.Color(0xff00ff); // Magenta (highest priority)
      case "queueMicrotask":
        return new THREE.Color(0x00ff88); // Green
      case "async":
        return new THREE.Color(0x4488ff); // Blue
      default:
        return new THREE.Color(0xffffff);
    }
  }

  public addMicrotask(type: MicrotaskParticle["type"] = "promise"): string {
    const particle = this.particlePool.pop();
    if (!particle) return "";

    // Initialize particle
    particle.id = `microtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    particle.type = type;
    particle.progress = 0;
    particle.priority = this.getPriorityForType(type);
    particle.isActive = true;
    particle.createdAt = Date.now();

    // Set starting position at tube entrance
    const startPoint = this.flowCurve.getPoint(0);
    particle.position.copy(startPoint);

    this.particles.push(particle);
    this.activeParticles.add(particle.id);

    return particle.id;
  }

  public removeMicrotask(id: string): void {
    const index = this.particles.findIndex((p) => p.id === id);
    if (index !== -1) {
      const particle = this.particles[index];
      particle.isActive = false;
      this.particles.splice(index, 1);
      this.activeParticles.delete(id);
      this.particlePool.push(particle);
    }
  }

  public clearAllMicrotasks(): void {
    this.particles.forEach((particle) => {
      particle.isActive = false;
      this.particlePool.push(particle);
    });
    this.particles = [];
    this.activeParticles.clear();
  }

  public setProcessing(processing: boolean): void {
    this.isProcessing = processing;
    this.processingSpeed = processing ? 2.0 : 0.5;

    // Update tube glow based on processing state
    if (processing) {
      this.tubeMaterial.emissive.setHex(this.vipColor);
      this.tubeMaterial.emissive.multiplyScalar(0.4);
      this.glowMaterial.opacity = 0.5;
    } else {
      this.tubeMaterial.emissive.setHex(this.vipColor);
      this.tubeMaterial.emissive.multiplyScalar(0.1);
      this.glowMaterial.opacity = 0.2;
    }
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;

    // Update particle positions and effects
    this.updateParticles(deltaTime);
    this.updateTubeEffects(deltaTime);
    this.updateParticleSystem();
  }

  private updateParticles(deltaTime: number): void {
    const completedParticles: string[] = [];

    this.particles.forEach((particle) => {
      if (!particle.isActive) return;

      // Move particle along the curve based on priority and processing speed
      const speed = this.flowSpeed * particle.priority * this.processingSpeed;
      particle.progress += speed * deltaTime * 0.1; // Scale for reasonable speed

      if (particle.progress >= 1.0) {
        // Particle reached the end
        completedParticles.push(particle.id);
        return;
      }

      // Update position along the curve
      const point = this.flowCurve.getPoint(particle.progress);
      particle.position.copy(point);

      // Add some variation for visual interest
      const variation = Math.sin(this.time * 2 + particle.progress * 10) * 0.1;
      particle.position.y += variation;
    });

    // Remove completed particles
    completedParticles.forEach((id) => this.removeMicrotask(id));
  }

  private updateTubeEffects(deltaTime: number): void {
    // Pulse the glow based on activity
    const intensity = 0.5 + Math.sin(this.time * 3) * 0.2;
    this.glowMaterial.opacity = Math.max(0.1, intensity * this.glowIntensity);

    // Update speed lines animation
    const speedLines = this.children.find((child) => child.userData.isSpeedLines);
    if (speedLines) {
      speedLines.rotation.z += deltaTime * this.processingSpeed;
    }

    // Animate entrance/exit markers
    const entrance = this.children.find((child) => child.userData.isEntrance);
    const exit = this.children.find((child) => child.userData.isExit);

    if (entrance) {
      entrance.rotation.y += deltaTime * 2;
      const pulseScale = 1 + Math.sin(this.time * 4) * 0.1;
      entrance.scale.setScalar(pulseScale);
    }

    if (exit) {
      exit.rotation.y -= deltaTime * 2;
      const pulseScale = 1 + Math.sin(this.time * 4 + Math.PI) * 0.1;
      exit.scale.setScalar(pulseScale);
    }
  }

  private updateParticleSystem(): void {
    const positions = this.particleGeometry.attributes.position.array as Float32Array;
    const colors = this.particleGeometry.attributes.color.array as Float32Array;
    const sizes = this.particleGeometry.attributes.size.array as Float32Array;

    // Reset arrays
    positions.fill(0);
    colors.fill(0);
    sizes.fill(0);

    // Update active particles
    this.particles.forEach((particle, index) => {
      if (index >= this.particleCount) return;

      const i3 = index * 3;

      // Position
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;

      // Color based on type
      const color = this.getColorForType(particle.type);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Size based on priority
      sizes[index] = particle.priority * 0.3;
    });

    // Mark attributes as needing update
    this.particleGeometry.attributes.position.needsUpdate = true;
    this.particleGeometry.attributes.color.needsUpdate = true;
    this.particleGeometry.attributes.size.needsUpdate = true;
  }

  public getQueueLength(): number {
    return this.particles.length;
  }

  public getProcessingRate(): number {
    return this.processingSpeed;
  }

  public getActiveParticleIds(): string[] {
    return Array.from(this.activeParticles);
  }

  public dispose(): void {
    // Dispose geometries
    this.tubeGeometry?.dispose();
    this.particleGeometry?.dispose();

    // Dispose materials
    this.tubeMaterial?.dispose();
    this.glowMaterial?.dispose();
    this.particleMaterial?.dispose();

    // Clear arrays
    this.particles = [];
    this.particlePool = [];
    this.activeParticles.clear();

    // Dispose of child meshes
    this.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
