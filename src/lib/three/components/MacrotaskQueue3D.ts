import * as THREE from "three";
import { gsap } from "gsap";

export interface MacrotaskItem {
  id: string;
  type: "timeout" | "interval" | "immediate" | "io" | "ui";
  content: string;
  priority: number;
  addedAt: number;
}

/**
 * 3D Macrotask Queue System - Conveyor Belt FIFO Visualization
 * Represents the macrotask queue as a conveyor belt with task containers
 */
export class MacrotaskQueue3D {
  private scene: THREE.Scene;
  private macrotasks: Map<string, { item: MacrotaskItem; mesh: THREE.Mesh; position: number }> =
    new Map();
  private conveyorBelt!: THREE.Mesh;
  private taskContainers: THREE.Group = new THREE.Group();
  private beltSpeed = 0.5;
  private taskSpacing = 2;
  private maxVisibleTasks = 12;
  private processZone!: THREE.Mesh;
  private queueLength = 20;

  // Materials
  private beltMaterial!: THREE.MeshPhongMaterial;
  private containerMaterials!: { [key: string]: THREE.MeshPhongMaterial };
  private processZoneMaterial!: THREE.MeshPhongMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeMaterials();
    this.createConveyorBelt();
    this.createProcessZone();
    this.setupLighting();
  }

  private initializeMaterials() {
    // Conveyor belt material
    this.beltMaterial = new THREE.MeshPhongMaterial({
      color: 0x444444,
      shininess: 10,
      transparent: true,
      opacity: 0.8,
    });

    // Task container materials by type
    this.containerMaterials = {
      timeout: new THREE.MeshPhongMaterial({ color: 0xff6b35, shininess: 30 }),
      interval: new THREE.MeshPhongMaterial({ color: 0x4ecdc4, shininess: 30 }),
      immediate: new THREE.MeshPhongMaterial({ color: 0xff3838, shininess: 30 }),
      io: new THREE.MeshPhongMaterial({ color: 0x95e1d3, shininess: 30 }),
      ui: new THREE.MeshPhongMaterial({ color: 0xf38ba8, shininess: 30 }),
    };

    // Process zone material
    this.processZoneMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      emissive: 0x332200,
      transparent: true,
      opacity: 0.6,
    });
  }

  private createConveyorBelt() {
    // Create conveyor belt geometry
    const beltGeometry = new THREE.BoxGeometry(this.queueLength, 0.2, 3);
    this.conveyorBelt = new THREE.Mesh(beltGeometry, this.beltMaterial);
    this.conveyorBelt.position.set(0, -1, 0);
    this.scene.add(this.conveyorBelt);

    // Add belt texture animation
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;

    // Create conveyor belt pattern
    ctx.fillStyle = "#666666";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#888888";
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.fillRect(i, 0, 2, canvas.height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = 4;
    this.beltMaterial.map = texture;

    // Add task containers group
    this.taskContainers.position.set(-this.queueLength / 2 + 1, 0, 0);
    this.scene.add(this.taskContainers);
  }

  private createProcessZone() {
    // Create process zone at the end of the belt
    const zoneGeometry = new THREE.BoxGeometry(2, 3, 4);
    this.processZone = new THREE.Mesh(zoneGeometry, this.processZoneMaterial);
    this.processZone.position.set(this.queueLength / 2 - 1, 0.5, 0);
    this.scene.add(this.processZone);

    // Add pulsing animation to process zone
    gsap.to(this.processZone.scale, {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  private setupLighting() {
    // Add directional light for the conveyor
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(5, 10, 5);
    light.castShadow = true;
    this.scene.add(light);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
  }

  private createTaskContainer(task: MacrotaskItem): THREE.Mesh {
    // Create container geometry
    const containerGeometry = new THREE.BoxGeometry(1.5, 1, 1.5);
    const material = this.containerMaterials[task.type] || this.containerMaterials.timeout;
    const container = new THREE.Mesh(containerGeometry, material);

    // Add task label
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(task.type.toUpperCase(), 64, 20);
    ctx.fillText(task.content.slice(0, 10), 64, 40);

    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(1.2, 0.6);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.y = 0.6;
    container.add(label);

    return container;
  }

  addMacrotask(task: MacrotaskItem): void {
    const container = this.createTaskContainer(task);

    // Position at the start of the queue
    const position = this.macrotasks.size;
    container.position.set(position * this.taskSpacing, 0, 0);

    this.taskContainers.add(container);
    this.macrotasks.set(task.id, { item: task, mesh: container, position });

    // Animate container entrance
    container.scale.set(0.1, 0.1, 0.1);
    gsap.to(container.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
    });

    // Add bounce animation
    gsap.fromTo(container.position, { y: -2 }, { y: 0, duration: 0.6, ease: "bounce.out" });
  }

  processMacrotask(): MacrotaskItem | null {
    // Find the task closest to the process zone (FIFO - first in, first out)
    let nextTask: { item: MacrotaskItem; mesh: THREE.Mesh; position: number } | null = null;
    let minPosition = Infinity;

    for (const [_id, taskData] of this.macrotasks) {
      if (taskData.position < minPosition) {
        minPosition = taskData.position;
        nextTask = taskData;
      }
    }

    if (!nextTask) return null;

    const task = nextTask.item;

    // Animate task processing
    gsap.to(nextTask.mesh.position, {
      x: this.queueLength - 1,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        // Remove from scene and data structure
        this.taskContainers.remove(nextTask!.mesh);
        nextTask!.mesh.geometry.dispose();
        if (Array.isArray(nextTask!.mesh.material)) {
          nextTask!.mesh.material.forEach((material) => material.dispose());
        } else {
          nextTask!.mesh.material.dispose();
        }
        this.macrotasks.delete(task.id);

        // Shift remaining tasks forward
        this.shiftTasksForward();
      },
    });

    // Add processing glow effect
    gsap.to(nextTask.mesh.material as THREE.MeshPhongMaterial, {
      emissive: new THREE.Color(0x444444),
      duration: 0.3,
      yoyo: true,
      repeat: 3,
    });

    return task;
  }

  private shiftTasksForward(): void {
    // Update positions and animate remaining tasks
    const tasks = Array.from(this.macrotasks.values()).sort((a, b) => a.position - b.position);

    tasks.forEach((taskData, index) => {
      taskData.position = index;
      gsap.to(taskData.mesh.position, {
        x: index * this.taskSpacing,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  }

  update(deltaTime: number): void {
    // Animate conveyor belt texture
    if (this.beltMaterial.map) {
      this.beltMaterial.map.offset.x -= this.beltSpeed * deltaTime;
    }

    // Add subtle belt movement
    const time = Date.now() * 0.001;
    this.conveyorBelt.position.y = -1 + Math.sin(time * 2) * 0.02;

    // Update process zone glow based on queue length
    const queueSize = this.macrotasks.size;
    const intensity = Math.min(queueSize / 10, 1);
    this.processZoneMaterial.emissive.setHex(
      intensity > 0 ? 0x332200 + Math.floor(intensity * 0x332200) : 0x000000
    );
  }

  getQueueLength(): number {
    return this.macrotasks.size;
  }

  clear(): void {
    // Clear all tasks
    for (const [_id, taskData] of this.macrotasks) {
      this.taskContainers.remove(taskData.mesh);
      taskData.mesh.geometry.dispose();
      if (Array.isArray(taskData.mesh.material)) {
        taskData.mesh.material.forEach((material) => material.dispose());
      } else {
        taskData.mesh.material.dispose();
      }
    }
    this.macrotasks.clear();
  }

  dispose(): void {
    this.clear();

    // Dispose of main objects
    this.conveyorBelt.geometry.dispose();
    this.beltMaterial.dispose();
    this.processZone.geometry.dispose();
    this.processZoneMaterial.dispose();

    // Dispose of materials
    Object.values(this.containerMaterials).forEach((material) => material.dispose());

    // Remove from scene
    this.scene.remove(this.conveyorBelt);
    this.scene.remove(this.taskContainers);
    this.scene.remove(this.processZone);
  }
}
