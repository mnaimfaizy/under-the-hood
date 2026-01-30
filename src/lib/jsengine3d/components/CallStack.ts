import * as THREE from "three";
import { gsap } from "gsap";

export class CallStack {
  private scene: THREE.Scene;
  private container: THREE.Group;
  private frames: THREE.Mesh[] = [];
  private labels: THREE.Sprite[] = [];
  private maxFrames = 10;
  private frameHeight = 1.5;
  private frameWidth = 8;
  private frameDepth = 6;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.container = new THREE.Group();
    this.container.position.set(-12, 0, 0);
    this.scene.add(this.container);

    this.createBase();
    this.createLabel();
  }

  private createBase(): void {
    // Base platform
    const baseGeometry = new THREE.CylinderGeometry(5, 5.5, 0.5, 32);
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2c3e50,
      metalness: 0.8,
      roughness: 0.3,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    base.castShadow = true;
    base.receiveShadow = true;
    this.container.add(base);

    // Support pillars
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const radius = 4;
      const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 20, 16);
      const pillarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x34495e,
        metalness: 0.7,
        roughness: 0.4,
        emissive: 0x3498db,
        emissiveIntensity: 0.1,
      });
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(Math.cos(angle) * radius, 10, Math.sin(angle) * radius);
      pillar.castShadow = true;
      this.container.add(pillar);
    }

    // Top ring
    const ringGeometry = new THREE.TorusGeometry(4.5, 0.3, 16, 32);
    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3498db,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x3498db,
      emissiveIntensity: 0.3,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 20;
    ring.rotation.x = Math.PI / 2;
    this.container.add(ring);
  }

  private createLabel(): void {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "rgba(52, 152, 219, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CALL STACK", canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(8, 2, 1);
    sprite.position.set(0, 22, 0);
    this.container.add(sprite);
  }

  public push(content: string): void {
    const index = this.frames.length;
    if (index >= this.maxFrames) return;

    const y = 0.5 + index * (this.frameHeight + 0.2);

    // Create frame
    const geometry = new THREE.BoxGeometry(this.frameWidth, this.frameHeight, this.frameDepth);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x3498db,
      metalness: 0.4,
      roughness: 0.6,
      emissive: 0x2980b9,
      emissiveIntensity: 0.4,
      clearcoat: 0.6,
      clearcoatRoughness: 0.3,
      transparent: true,
      opacity: 0,
    });

    const frame = new THREE.Mesh(geometry, material);
    frame.position.set(0, y - 10, 0);
    frame.castShadow = true;
    frame.receiveShadow = true;
    this.container.add(frame);
    this.frames.push(frame);

    // Create label
    const label = this.createTextSprite(content);
    label.position.copy(frame.position);
    label.scale.set(6, 1, 1);
    this.container.add(label);
    this.labels.push(label);

    // Animate in
    gsap.to(frame.position, {
      y: y,
      duration: 0.6,
      ease: "back.out(1.7)",
    });

    gsap.to(frame.material, {
      opacity: 1,
      duration: 0.4,
    });

    gsap.to(label.position, {
      y: y,
      duration: 0.6,
      ease: "back.out(1.7)",
    });

    // Pulse effect
    gsap.to(frame.scale, {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
    });
  }

  public pop(): void {
    const frame = this.frames.pop();
    const label = this.labels.pop();

    if (frame) {
      gsap.to(frame.position, {
        y: frame.position.y + 5,
        duration: 0.4,
        ease: "power2.in",
      });

      gsap.to(frame.material, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          this.container.remove(frame);
          frame.geometry.dispose();
          (frame.material as THREE.Material).dispose();
        },
      });
    }

    if (label) {
      gsap.to(label.position, {
        y: label.position.y + 5,
        duration: 0.4,
        ease: "power2.in",
      });

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
    this.frames.forEach((frame) => {
      this.container.remove(frame);
      frame.geometry.dispose();
      (frame.material as THREE.Material).dispose();
    });
    this.labels.forEach((label) => {
      this.container.remove(label);
      label.material.dispose();
    });
    this.frames = [];
    this.labels = [];
  }

  private createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 40px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    return new THREE.Sprite(material);
  }

  public update(): void {
    // Gentle floating animation for frames
    this.frames.forEach((frame, i) => {
      const time = Date.now() * 0.001;
      frame.rotation.y = Math.sin(time + i * 0.5) * 0.05;
    });
  }

  public dispose(): void {
    this.clear();
    this.scene.remove(this.container);
  }
}
