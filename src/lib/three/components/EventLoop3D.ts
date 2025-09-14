import * as THREE from "three";
import { gsap } from "gsap";

export interface EventLoopPhase {
  id: string;
  name: string;
  description: string;
  color: number;
  isActive: boolean;
  duration: number; // in seconds
}

/**
 * 3D Event Loop Controller - Central Orchestrator
 * Represents the JavaScript event loop as a spinning circular platform
 * with phase indicators and connections to all runtime components
 */
export class EventLoop3D {
  private scene: THREE.Scene;
  private platform!: THREE.Mesh;
  private centerCore!: THREE.Mesh;
  private phaseIndicators: Map<string, THREE.Mesh> = new Map();
  private connectionLines: THREE.Group = new THREE.Group();
  private rotationSpeed = 0.5; // radians per second
  private currentPhase: EventLoopPhase | null = null;
  private phases: EventLoopPhase[] = [];

  // Visual elements
  private phaseLights: Map<string, THREE.SpotLight> = new Map();
  private pulseRings: THREE.Group = new THREE.Group();

  // Materials
  private platformMaterial!: THREE.MeshPhongMaterial;
  private coreMaterial!: THREE.MeshPhongMaterial;
  private phaseMaterials: Map<string, THREE.MeshPhongMaterial> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializePhases();
    this.initializeMaterials();
    this.createPlatform();
    this.createCenterCore();
    this.createPhaseIndicators();
    this.createConnectionLines();
    this.setupLighting();
    this.createPulseRings();
  }

  private initializePhases() {
    this.phases = [
      {
        id: "callstack",
        name: "Call Stack",
        description: "Execute synchronous code",
        color: 0x4fc3f7,
        isActive: false,
        duration: 2,
      },
      {
        id: "microtasks",
        name: "Microtasks",
        description: "Process promise callbacks",
        color: 0x9c27b0,
        isActive: false,
        duration: 1,
      },
      {
        id: "rendering",
        name: "Rendering",
        description: "Update DOM and render",
        color: 0x66bb6a,
        isActive: false,
        duration: 1.5,
      },
      {
        id: "macrotasks",
        name: "Macrotasks",
        description: "Execute timer callbacks",
        color: 0xff7043,
        isActive: false,
        duration: 2.5,
      },
    ];
  }

  private initializeMaterials() {
    // Platform material
    this.platformMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c3e50,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });

    // Core material
    this.coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x3498db,
      emissive: 0x1565c0,
      shininess: 200,
    });

    // Phase materials
    this.phases.forEach((phase) => {
      this.phaseMaterials.set(
        phase.id,
        new THREE.MeshPhongMaterial({
          color: phase.color,
          emissive: new THREE.Color(phase.color).multiplyScalar(0.2),
          shininess: 150,
          transparent: true,
          opacity: 0.7,
        })
      );
    });
  }

  private createPlatform() {
    // Create main circular platform
    const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 32);
    this.platform = new THREE.Mesh(platformGeometry, this.platformMaterial);
    this.platform.position.set(0, 0, 0);
    this.platform.castShadow = true;
    this.platform.receiveShadow = true;
    this.scene.add(this.platform);

    // Add platform rim
    const rimGeometry = new THREE.TorusGeometry(8, 0.2, 8, 32);
    const rimMaterial = new THREE.MeshPhongMaterial({
      color: 0x34495e,
      shininess: 100,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.set(0, 0.35, 0);
    rim.rotation.x = Math.PI / 2;
    this.platform.add(rim);

    // Add platform details
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 7;
      const z = Math.sin(angle) * 7;

      const detailGeometry = new THREE.BoxGeometry(0.3, 0.1, 1);
      const detail = new THREE.Mesh(detailGeometry, this.platformMaterial);
      detail.position.set(x, 0.3, z);
      detail.rotation.y = angle;
      this.platform.add(detail);
    }
  }

  private createCenterCore() {
    // Create central core
    const coreGeometry = new THREE.SphereGeometry(1.5, 32, 16);
    this.centerCore = new THREE.Mesh(coreGeometry, this.coreMaterial);
    this.centerCore.position.set(0, 1.5, 0);
    this.centerCore.castShadow = true;
    this.scene.add(this.centerCore);

    // Add core energy rings
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(2 + i * 0.5, 0.1, 8, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.3,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(0, 1.5, 0);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      this.scene.add(ring);

      // Animate rings
      gsap.to(ring.rotation, {
        x: ring.rotation.x + Math.PI * 2,
        y: ring.rotation.y + Math.PI * 2,
        duration: 4 + i,
        repeat: -1,
        ease: "none",
      });
    }
  }

  private createPhaseIndicators() {
    this.phases.forEach((phase, index) => {
      const angle = (index / this.phases.length) * Math.PI * 2;
      const radius = 6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Create phase indicator
      const indicatorGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 8);
      const material = this.phaseMaterials.get(phase.id)!;
      const indicator = new THREE.Mesh(indicatorGeometry, material);
      indicator.position.set(x, 0.75, z);
      indicator.castShadow = true;
      this.scene.add(indicator);

      // Add phase label
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(phase.name, 128, 40);

      const labelTexture = new THREE.CanvasTexture(canvas);
      const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
      });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(x, 2, z);
      label.lookAt(0, 2, 0);
      this.scene.add(label);

      this.phaseIndicators.set(phase.id, indicator);

      // Create phase light
      const light = new THREE.SpotLight(phase.color, 0, 10, Math.PI / 4, 0.5);
      light.position.set(x, 5, z);
      light.target.position.set(x, 0, z);
      light.castShadow = true;
      this.scene.add(light);
      this.scene.add(light.target);
      this.phaseLights.set(phase.id, light);
    });
  }

  private createConnectionLines() {
    // Create connection lines to other components (visual guides)
    const connectionPoints = [
      { name: "Call Stack", position: new THREE.Vector3(-12, 0, 0), color: 0x4fc3f7 },
      { name: "Web APIs", position: new THREE.Vector3(12, 8, 0), color: 0x66bb6a },
      { name: "Microtasks", position: new THREE.Vector3(0, 0, 12), color: 0x9c27b0 },
      { name: "Macrotasks", position: new THREE.Vector3(0, 0, -12), color: 0xff7043 },
    ];

    connectionPoints.forEach((point) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.5, 0),
        point.position,
      ]);
      const material = new THREE.LineBasicMaterial({
        color: point.color,
        transparent: true,
        opacity: 0.3,
        linewidth: 2,
      });
      const line = new THREE.Line(geometry, material);
      this.connectionLines.add(line);
    });

    this.scene.add(this.connectionLines);
  }

  private createPulseRings() {
    // Create expanding pulse rings for visual feedback
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(0, 0.1, 0);
      ring.rotation.x = -Math.PI / 2;
      this.pulseRings.add(ring);
    }
    this.scene.add(this.pulseRings);
  }

  private setupLighting() {
    // Add central lighting
    const centerLight = new THREE.PointLight(0xffffff, 1, 20);
    centerLight.position.set(0, 10, 0);
    centerLight.castShadow = true;
    this.scene.add(centerLight);

    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
  }

  setActivePhase(phaseId: string | null): void {
    // Deactivate current phase
    if (this.currentPhase) {
      const currentIndicator = this.phaseIndicators.get(this.currentPhase.id);
      const currentLight = this.phaseLights.get(this.currentPhase.id);

      if (currentIndicator) {
        gsap.to(currentIndicator.material as THREE.MeshPhongMaterial, {
          opacity: 0.7,
          duration: 0.3,
        });
        gsap.to(currentIndicator.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
        });
      }

      if (currentLight) {
        gsap.to(currentLight, { intensity: 0, duration: 0.3 });
      }
    }

    // Activate new phase
    if (phaseId) {
      const newPhase = this.phases.find((p) => p.id === phaseId);
      const newIndicator = this.phaseIndicators.get(phaseId);
      const newLight = this.phaseLights.get(phaseId);

      if (newPhase && newIndicator) {
        this.currentPhase = newPhase;

        gsap.to(newIndicator.material as THREE.MeshPhongMaterial, {
          opacity: 1,
          duration: 0.3,
        });
        gsap.to(newIndicator.scale, {
          x: 1.3,
          y: 1.3,
          z: 1.3,
          duration: 0.3,
        });

        // Create pulse effect
        this.createPulseEffect();
      }

      if (newLight) {
        gsap.to(newLight, { intensity: 2, duration: 0.3 });
      }
    } else {
      this.currentPhase = null;
    }
  }

  private createPulseEffect(): void {
    const rings = this.pulseRings.children as THREE.Mesh[];

    rings.forEach((ring, index) => {
      setTimeout(() => {
        // Reset ring
        ring.scale.set(0.1, 0.1, 0.1);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.8;

        // Animate pulse
        gsap.to(ring.scale, {
          x: 3,
          y: 3,
          z: 3,
          duration: 1.5,
          ease: "power2.out",
        });
        gsap.to(ring.material as THREE.MeshBasicMaterial, {
          opacity: 0,
          duration: 1.5,
          ease: "power2.out",
        });
      }, index * 200);
    });
  }

  update(deltaTime: number): void {
    // Rotate platform
    this.platform.rotation.y += this.rotationSpeed * deltaTime;

    // Rotate center core in opposite direction
    this.centerCore.rotation.y -= this.rotationSpeed * 0.5 * deltaTime;
    this.centerCore.rotation.x += this.rotationSpeed * 0.3 * deltaTime;

    // Update core glow based on activity
    const time = Date.now() * 0.003;
    const intensity = 0.3 + Math.sin(time) * 0.2;
    this.coreMaterial.emissive.setRGB(0.08 * intensity, 0.4 * intensity, 0.7 * intensity);

    // Animate connection lines
    if (this.connectionLines.children.length > 0) {
      const opacity = 0.3 + Math.sin(time * 2) * 0.1;
      this.connectionLines.children.forEach((line) => {
        if (line instanceof THREE.Line) {
          (line.material as THREE.LineBasicMaterial).opacity = opacity;
        }
      });
    }
  }

  getPhases(): EventLoopPhase[] {
    return [...this.phases];
  }

  getCurrentPhase(): EventLoopPhase | null {
    return this.currentPhase;
  }

  dispose(): void {
    // Clean up geometries and materials
    this.platform.geometry.dispose();
    this.platformMaterial.dispose();

    this.centerCore.geometry.dispose();
    this.coreMaterial.dispose();

    // Clean up phase indicators
    for (const [_id, indicator] of this.phaseIndicators) {
      indicator.geometry.dispose();
      if (Array.isArray(indicator.material)) {
        indicator.material.forEach((material) => material.dispose());
      } else {
        indicator.material.dispose();
      }
      this.scene.remove(indicator);
    }

    // Clean up lights
    for (const [_id, light] of this.phaseLights) {
      this.scene.remove(light);
      this.scene.remove(light.target);
    }

    // Clean up connection lines
    this.connectionLines.children.forEach((line) => {
      if (line instanceof THREE.Line) {
        line.geometry?.dispose();
        if (Array.isArray(line.material)) {
          line.material.forEach((material: any) => material.dispose());
        } else {
          line.material?.dispose();
        }
      }
    });

    // Clean up pulse rings
    this.pulseRings.children.forEach((ring) => {
      if (ring instanceof THREE.Mesh) {
        ring.geometry?.dispose();
        if (Array.isArray(ring.material)) {
          ring.material.forEach((material: any) => material.dispose());
        } else {
          ring.material?.dispose();
        }
      }
    });

    // Remove from scene
    this.scene.remove(this.platform);
    this.scene.remove(this.centerCore);
    this.scene.remove(this.connectionLines);
    this.scene.remove(this.pulseRings);
  }
}
