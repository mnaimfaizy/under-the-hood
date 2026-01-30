import * as THREE from "three";
import { gsap } from "gsap";

export class ExecutionFlow {
  private scene: THREE.Scene;
  private container: THREE.Group;
  private flowLine: THREE.Line | null = null;
  private flowParticles: THREE.Points | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.container = new THREE.Group();
    this.scene.add(this.container);
  }

  public animateToCallStack(): void {
    this.createFlowLine(new THREE.Vector3(0, 3, 0), new THREE.Vector3(-12, 5, 0));
  }

  public animateToMicrotasks(): void {
    this.createFlowLine(new THREE.Vector3(-12, 5, 0), new THREE.Vector3(0, 3, 12));
  }

  public animateToMacrotasks(): void {
    this.createFlowLine(new THREE.Vector3(-12, 5, 0), new THREE.Vector3(0, 3, -12));
  }

  public animateToWebAPIs(): void {
    this.createFlowLine(new THREE.Vector3(-12, 5, 0), new THREE.Vector3(12, 5, 0));
  }

  private createFlowLine(start: THREE.Vector3, end: THREE.Vector3): void {
    // Remove existing flow
    if (this.flowLine) {
      this.container.remove(this.flowLine);
      this.flowLine.geometry.dispose();
      (this.flowLine.material as THREE.Material).dispose();
    }

    if (this.flowParticles) {
      this.container.remove(this.flowParticles);
      this.flowParticles.geometry.dispose();
      (this.flowParticles.material as THREE.Material).dispose();
    }

    // Create curved path
    const curve = new THREE.QuadraticBezierCurve3(
      start,
      new THREE.Vector3((start.x + end.x) / 2, Math.max(start.y, end.y) + 3, (start.z + end.z) / 2),
      end
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0,
      linewidth: 3,
    });

    this.flowLine = new THREE.Line(geometry, material);
    this.container.add(this.flowLine);

    // Animate line opacity
    gsap.to(material, {
      opacity: 0.8,
      duration: 0.3,
    });

    gsap.to(material, {
      opacity: 0,
      duration: 0.5,
      delay: 1,
      onComplete: () => {
        if (this.flowLine) {
          this.container.remove(this.flowLine);
          this.flowLine.geometry.dispose();
          (this.flowLine.material as THREE.Material).dispose();
          this.flowLine = null;
        }
      },
    });

    // Create flowing particles
    const particleCount = 20;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const point = curve.getPoint(t);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.3,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.flowParticles = new THREE.Points(particleGeometry, particleMaterial);
    this.container.add(this.flowParticles);

    // Animate particles
    gsap.to(particleMaterial, {
      opacity: 1,
      duration: 0.2,
    });

    // Animate particles along curve
    const animateParticles = () => {
      const positions = particleGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        let t = (i / particleCount + Date.now() * 0.001) % 1;
        const point = curve.getPoint(t);
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      }

      particleGeometry.attributes.position.needsUpdate = true;
    };

    const interval = setInterval(animateParticles, 16);

    setTimeout(() => {
      clearInterval(interval);
      gsap.to(particleMaterial, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          if (this.flowParticles) {
            this.container.remove(this.flowParticles);
            this.flowParticles.geometry.dispose();
            (this.flowParticles.material as THREE.Material).dispose();
            this.flowParticles = null;
          }
        },
      });
    }, 1500);
  }

  public reset(): void {
    if (this.flowLine) {
      this.container.remove(this.flowLine);
      this.flowLine.geometry.dispose();
      (this.flowLine.material as THREE.Material).dispose();
      this.flowLine = null;
    }

    if (this.flowParticles) {
      this.container.remove(this.flowParticles);
      this.flowParticles.geometry.dispose();
      (this.flowParticles.material as THREE.Material).dispose();
      this.flowParticles = null;
    }
  }

  public update(): void {
    // Passive update - animation handled in createFlowLine
  }

  public dispose(): void {
    this.reset();
    this.scene.remove(this.container);
  }
}
