import * as THREE from "three";
import { gsap } from "gsap";

export class EventLoop {
  private scene: THREE.Scene;
  private container: THREE.Group;
  private ring: THREE.Mesh;
  private centerCore: THREE.Mesh;
  private phaseIndicators: Map<string, THREE.Mesh> = new Map();
  private currentPhase: string = "idle";

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.container = new THREE.Group();
    this.container.position.set(0, 0, 0);
    this.scene.add(this.container);

    this.createCore();
    this.createRing();
    this.createPhaseIndicators();
    this.createLabel();
  }

  private createCore(): void {
    // Central processing core
    const coreGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3498db,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x2980b9,
      emissiveIntensity: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    this.centerCore = new THREE.Mesh(coreGeometry, coreMaterial);
    this.centerCore.position.y = 3;
    this.centerCore.castShadow = true;
    this.container.add(this.centerCore);

    // Energy rings around core
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(2 + i * 0.5, 0.1, 16, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.y = 3;
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      this.container.add(ring);

      // Animate rotation
      gsap.to(ring.rotation, {
        x: ring.rotation.x + Math.PI * 2,
        y: ring.rotation.y + Math.PI * 2,
        duration: 4 + i * 2,
        repeat: -1,
        ease: "none",
      });
    }
  }

  private createRing(): void {
    // Main event loop ring
    const ringGeometry = new THREE.TorusGeometry(10, 0.5, 16, 64);
    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1abc9c,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x16a085,
      emissiveIntensity: 0.5,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });
    this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
    this.ring.position.y = 0.5;
    this.ring.rotation.x = Math.PI / 2;
    this.ring.castShadow = true;
    this.ring.receiveShadow = true;
    this.container.add(this.ring);

    // Continuous rotation
    gsap.to(this.ring.rotation, {
      z: Math.PI * 2,
      duration: 10,
      repeat: -1,
      ease: "none",
    });
  }

  private createPhaseIndicators(): void {
    const phases = [
      { id: "callstack", color: 0x3498db, angle: 0 },
      { id: "microtasks", color: 0x9b59b6, angle: Math.PI / 2 },
      { id: "rendering", color: 0x1abc9c, angle: Math.PI },
      { id: "macrotasks", color: 0xe67e22, angle: (3 * Math.PI) / 2 },
    ];

    phases.forEach((phase) => {
      const indicatorGeometry = new THREE.SphereGeometry(0.6, 16, 16);
      const indicatorMaterial = new THREE.MeshPhysicalMaterial({
        color: phase.color,
        metalness: 0.7,
        roughness: 0.3,
        emissive: phase.color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.6,
      });
      const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);

      const radius = 10;
      indicator.position.set(Math.cos(phase.angle) * radius, 0.5, Math.sin(phase.angle) * radius);

      this.container.add(indicator);
      this.phaseIndicators.set(phase.id, indicator);
    });
  }

  private createLabel(): void {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "rgba(26, 188, 156, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("EVENT LOOP", canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(8, 2, 1);
    sprite.position.set(0, 6, 0);
    this.container.add(sprite);
  }

  public setPhase(phase: string): void {
    // Dim all indicators
    this.phaseIndicators.forEach((indicator, id) => {
      gsap.to(indicator.material, {
        opacity: id === phase ? 1.0 : 0.3,
        emissiveIntensity: id === phase ? 1.0 : 0.2,
        duration: 0.3,
      });

      if (id === phase) {
        // Pulse the active indicator
        gsap.to(indicator.scale, {
          x: 1.3,
          y: 1.3,
          z: 1.3,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
        });
      }
    });

    this.currentPhase = phase;

    // Speed up/slow down ring rotation based on phase
    const speed = phase === "idle" ? 10 : 5;
    gsap.to(this.ring.rotation, {
      z: this.ring.rotation.z + Math.PI * 2,
      duration: speed,
      ease: "none",
      onComplete: () => {
        // Continue rotating
        this.setPhase(this.currentPhase);
      },
    });
  }

  public update(): void {
    const time = Date.now() * 0.001;

    // Gentle bob for core
    this.centerCore.position.y = 3 + Math.sin(time * 2) * 0.1;

    // Pulse core based on activity
    const scale = 1 + Math.sin(time * 3) * 0.05;
    this.centerCore.scale.set(scale, scale, scale);
  }

  public dispose(): void {
    this.scene.remove(this.container);
  }
}
