import * as THREE from "three";
import { gsap } from "gsap";

export class MicrotaskQueue {
  private scene: THREE.Scene;
  private container: THREE.Group;
  private tasks: THREE.Mesh[] = [];
  private labels: THREE.Sprite[] = [];
  private maxTasks = 8;
  private taskSize = 1.2;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.container = new THREE.Group();
    this.container.position.set(0, 0, 12);
    this.scene.add(this.container);

    this.createStructure();
    this.createLabel();
  }

  private createStructure(): void {
    // VIP Lane platform
    const platformGeometry = new THREE.BoxGeometry(20, 0.5, 5);
    const platformMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8e44ad,
      metalness: 0.6,
      roughness: 0.4,
      emissive: 0x9b59b6,
      emissiveIntensity: 0.3,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.25;
    platform.castShadow = true;
    platform.receiveShadow = true;
    this.container.add(platform);

    // Lane markers
    for (let i = 0; i < 10; i++) {
      const markerGeometry = new THREE.BoxGeometry(1.5, 0.6, 0.3);
      const markerMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc39bd3,
        metalness: 0.8,
        roughness: 0.3,
        emissive: 0x9b59b6,
        emissiveIntensity: 0.5,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(-9 + i * 2, 0.55, 2);
      this.container.add(marker);
    }

    // VIP sign
    const signGeometry = new THREE.BoxGeometry(4, 2, 0.2);
    const signMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9b59b6,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x9b59b6,
      emissiveIntensity: 0.8,
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(-10, 3, 0);
    this.container.add(sign);
  }

  private createLabel(): void {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "rgba(155, 89, 182, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MICROTASK QUEUE", canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 2.5, 1);
    sprite.position.set(0, 5, 0);
    this.container.add(sprite);
  }

  public enqueue(content: string): void {
    const index = this.tasks.length;
    if (index >= this.maxTasks) return;

    const x = -8 + index * 2;
    const y = 0.8;

    // Create task (diamond shape for promises)
    const geometry = new THREE.OctahedronGeometry(this.taskSize * 0.7);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x9b59b6,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x8e44ad,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });

    const task = new THREE.Mesh(geometry, material);
    task.position.set(x, y + 10, 0);
    task.castShadow = true;
    this.container.add(task);
    this.tasks.push(task);

    // Create label
    const label = this.createTextSprite(content);
    label.position.copy(task.position);
    label.scale.set(2, 0.5, 1);
    this.container.add(label);
    this.labels.push(label);

    // Animate in with bounce
    gsap.to(task.position, {
      y: y,
      duration: 0.7,
      ease: "bounce.out",
    });

    gsap.to(task.material, {
      opacity: 1,
      duration: 0.4,
    });

    gsap.to(label.position, {
      y: y + 1,
      duration: 0.7,
      ease: "bounce.out",
    });

    // Continuous rotation
    gsap.to(task.rotation, {
      y: Math.PI * 2,
      duration: 3,
      repeat: -1,
      ease: "none",
    });
  }

  public dequeue(): void {
    const task = this.tasks.shift();
    const label = this.labels.shift();

    // Shift remaining tasks
    this.tasks.forEach((t, i) => {
      gsap.to(t.position, {
        x: -8 + i * 2,
        duration: 0.4,
        ease: "power2.inOut",
      });
    });

    this.labels.forEach((l, i) => {
      gsap.to(l.position, {
        x: -8 + i * 2,
        duration: 0.4,
        ease: "power2.inOut",
      });
    });

    if (task) {
      gsap.to(task.position, {
        y: task.position.y + 8,
        x: -12,
        duration: 0.6,
        ease: "power2.in",
      });

      gsap.to(task.scale, {
        x: 0.1,
        y: 0.1,
        z: 0.1,
        duration: 0.5,
        onComplete: () => {
          this.container.remove(task);
          task.geometry.dispose();
          (task.material as THREE.Material).dispose();
        },
      });
    }

    if (label) {
      gsap.to(label.material, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          this.container.remove(label);
          label.material.dispose();
        },
      });
    }
  }

  public clear(): void {
    this.tasks.forEach((task) => {
      this.container.remove(task);
      task.geometry.dispose();
      (task.material as THREE.Material).dispose();
    });
    this.labels.forEach((label) => {
      this.container.remove(label);
      label.material.dispose();
    });
    this.tasks = [];
    this.labels = [];
  }

  private createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e8daef";
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
    this.tasks.forEach((task, i) => {
      task.position.y = 0.8 + Math.sin(time * 2 + i) * 0.1;
    });
  }

  public dispose(): void {
    this.clear();
    this.scene.remove(this.container);
  }
}
