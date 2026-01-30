import * as THREE from "three";
import { gsap } from "gsap";

interface WebAPITask {
  id: string;
  type: string;
  mesh: THREE.Mesh;
  label: THREE.Sprite;
  particles: THREE.Points;
}

export class WebAPIs {
  private scene: THREE.Scene;
  private container: THREE.Group;
  private tasks: Map<string, WebAPITask> = new Map();
  private slots: THREE.Vector3[] = [];
  private usedSlots: Set<number> = new Set();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.container = new THREE.Group();
    this.container.position.set(12, 0, 0);
    this.scene.add(this.container);

    this.createStructure();
    this.createLabel();
    this.initializeSlots();
  }

  private createStructure(): void {
    // Central hub
    const hubGeometry = new THREE.CylinderGeometry(3, 3, 1, 32);
    const hubMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x27ae60,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x229954,
      emissiveIntensity: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.position.y = 0.5;
    hub.castShadow = true;
    hub.receiveShadow = true;
    this.container.add(hub);

    // Orbital ring
    const ringGeometry = new THREE.TorusGeometry(5, 0.3, 16, 32);
    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2ecc71,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x27ae60,
      emissiveIntensity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 5;
    ring.rotation.x = Math.PI / 2;
    this.container.add(ring);

    // Vertical energy beams
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
      const beamMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2ecc71,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x27ae60,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.6,
      });
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.set(Math.cos(angle) * 5, 5, Math.sin(angle) * 5);
      this.container.add(beam);
    }
  }

  private createLabel(): void {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "rgba(39, 174, 96, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("WEB APIs", canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(8, 2, 1);
    sprite.position.set(0, 12, 0);
    this.container.add(sprite);
  }

  private initializeSlots(): void {
    // Create orbital slots for tasks
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const slot = new THREE.Vector3(Math.cos(angle) * 5, 5, Math.sin(angle) * 5);
      this.slots.push(slot);
    }
  }

  private getAvailableSlot(): number {
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.usedSlots.has(i)) {
        this.usedSlots.add(i);
        return i;
      }
    }
    return 0;
  }

  public startAPI(content: string, type: string): void {
    const slotIndex = this.getAvailableSlot();
    const position = this.slots[slotIndex].clone();

    // Create task mesh (sphere for APIs)
    const geometry = new THREE.SphereGeometry(0.8, 32, 16);
    const color = this.getColorForType(type);
    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.6,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.position.y += 10;
    mesh.castShadow = true;
    this.container.add(mesh);

    // Create label
    const label = this.createTextSprite(content);
    label.position.copy(mesh.position);
    label.scale.set(3, 0.75, 1);
    this.container.add(label);

    // Create particles
    const particles = this.createParticles(color);
    particles.position.copy(position);
    this.container.add(particles);

    // Store task
    const task: WebAPITask = {
      id: content,
      type,
      mesh,
      label,
      particles,
    };
    this.tasks.set(content, task);

    // Animate in
    gsap.to(mesh.position, {
      y: position.y,
      duration: 0.8,
      ease: "back.out(1.5)",
    });

    gsap.to(mesh.material, {
      opacity: 1,
      duration: 0.5,
    });

    gsap.to(label.position, {
      y: position.y + 1.5,
      duration: 0.8,
      ease: "back.out(1.5)",
    });

    // Pulse animation
    gsap.to(mesh.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    // Rotate
    gsap.to(mesh.rotation, {
      y: Math.PI * 2,
      duration: 3,
      repeat: -1,
      ease: "none",
    });
  }

  public completeAPI(content: string): void {
    const task = this.tasks.get(content);
    if (!task) return;

    // Find and free the slot
    const slotIndex = this.slots.findIndex(
      (slot) =>
        Math.abs(slot.x - task.mesh.position.x) < 0.1 &&
        Math.abs(slot.z - task.mesh.position.z) < 0.1
    );
    if (slotIndex !== -1) {
      this.usedSlots.delete(slotIndex);
    }

    // Animate out
    gsap.to(task.mesh.position, {
      y: task.mesh.position.y - 5,
      duration: 0.6,
      ease: "power2.in",
    });

    gsap.to(task.mesh.material, {
      opacity: 0,
      duration: 0.4,
    });

    gsap.to(task.label.material, {
      opacity: 0,
      duration: 0.3,
    });

    gsap.to(task.particles.material, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        this.container.remove(task.mesh);
        this.container.remove(task.label);
        this.container.remove(task.particles);
        task.mesh.geometry.dispose();
        (task.mesh.material as THREE.Material).dispose();
        task.label.material.dispose();
        task.particles.geometry.dispose();
        (task.particles.material as THREE.Material).dispose();
        this.tasks.delete(content);
      },
    });
  }

  public clear(): void {
    this.tasks.forEach((task) => {
      this.container.remove(task.mesh);
      this.container.remove(task.label);
      this.container.remove(task.particles);
      task.mesh.geometry.dispose();
      (task.mesh.material as THREE.Material).dispose();
      task.label.material.dispose();
      task.particles.geometry.dispose();
      (task.particles.material as THREE.Material).dispose();
    });
    this.tasks.clear();
    this.usedSlots.clear();
  }

  private getColorForType(type: string): number {
    const colors: Record<string, number> = {
      timer: 0xf39c12,
      fetch: 0x3498db,
      dom: 0xe74c3c,
      io: 0x9b59b6,
    };
    return colors[type] || 0x27ae60;
  }

  private createParticles(color: number): THREE.Points {
    const particleCount = 30;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 1 + Math.random();

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: color,
      size: 0.2,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
  }

  private createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d5f4e6";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    return new THREE.Sprite(material);
  }

  public update(): void {
    const time = Date.now() * 0.001;

    this.tasks.forEach((task) => {
      // Rotate particles
      task.particles.rotation.y = time;
      task.particles.rotation.x = time * 0.5;
    });
  }

  public dispose(): void {
    this.clear();
    this.scene.remove(this.container);
  }
}
