import * as THREE from "three";

export interface APIStation {
  id: string;
  type: "timer" | "network" | "dom" | "storage";
  name: string;
  mesh: THREE.Group;
  position: THREE.Vector3;
  isActive: boolean;
  activeOperations: string[];
}

export interface WebAPI3DOptions {
  orbitRadius?: number;
  stationCount?: number;
  orbitSpeed?: number;
  connectionBeamColor?: number;
  glowIntensity?: number;
}

export class WebAPI3D extends THREE.Group {
  private stations: Map<string, APIStation>;
  private connectionBeams: THREE.Line[];
  private orbitCenter: THREE.Vector3;
  private orbitRadius: number;
  private orbitSpeed: number;
  private time: number;
  private glowIntensity: number;

  // Materials for different station types
  private materials!: {
    timer: THREE.MeshPhongMaterial;
    network: THREE.MeshPhongMaterial;
    dom: THREE.MeshPhongMaterial;
    storage: THREE.MeshPhongMaterial;
  };

  constructor(options: WebAPI3DOptions = {}) {
    super();

    // Configuration
    this.orbitRadius = options.orbitRadius ?? 15;
    this.orbitSpeed = options.orbitSpeed ?? 0.01;
    this.glowIntensity = options.glowIntensity ?? 0.8;
    this.time = 0;

    // Initialize components
    this.stations = new Map();
    this.connectionBeams = [];
    this.orbitCenter = new THREE.Vector3(0, 4, 0);

    // Create materials for different station types
    this.createMaterials();

    // Create the orbital stations
    this.createStations();

    // Add ambient particles around the orbit
    this.createOrbitParticles();
  }

  private createMaterials(): void {
    this.materials = {
      timer: new THREE.MeshPhongMaterial({
        color: 0xffa500, // Orange for timers
        emissive: 0x331100,
        shininess: 100,
      }),
      network: new THREE.MeshPhongMaterial({
        color: 0x00ff88, // Green for network
        emissive: 0x003322,
        shininess: 100,
      }),
      dom: new THREE.MeshPhongMaterial({
        color: 0x4488ff, // Blue for DOM
        emissive: 0x001133,
        shininess: 100,
      }),
      storage: new THREE.MeshPhongMaterial({
        color: 0xff4488, // Pink for storage
        emissive: 0x330011,
        shininess: 100,
      }),
    };
  }

  private createStations(): void {
    const stationConfigs = [
      {
        id: "timer-station",
        type: "timer" as const,
        name: "Timer API",
        angle: 0,
        description: "Handles setTimeout & setInterval",
      },
      {
        id: "network-station",
        type: "network" as const,
        name: "Network API",
        angle: Math.PI / 2,
        description: "Manages fetch & XMLHttpRequest",
      },
      {
        id: "dom-station",
        type: "dom" as const,
        name: "DOM API",
        angle: Math.PI,
        description: "Handles DOM events & manipulation",
      },
      {
        id: "storage-station",
        type: "storage" as const,
        name: "Storage API",
        angle: (3 * Math.PI) / 2,
        description: "Manages localStorage & IndexedDB",
      },
    ];

    stationConfigs.forEach((config) => {
      const station = this.createStation(config);
      this.stations.set(config.id, station);
      this.add(station.mesh);
    });
  }

  private createStation(config: {
    id: string;
    type: "timer" | "network" | "dom" | "storage";
    name: string;
    angle: number;
    description: string;
  }): APIStation {
    const stationGroup = new THREE.Group();
    stationGroup.userData = {
      id: config.id,
      type: config.type,
      name: config.name,
      description: config.description,
    };

    // Calculate initial position
    const x = this.orbitCenter.x + Math.cos(config.angle) * this.orbitRadius;
    const z = this.orbitCenter.z + Math.sin(config.angle) * this.orbitRadius;
    const position = new THREE.Vector3(x, this.orbitCenter.y, z);

    // Create station geometry based on type
    let geometry: THREE.BufferGeometry;
    let stationMesh: THREE.Mesh;

    switch (config.type) {
      case "timer":
        geometry = this.createTimerGeometry();
        break;
      case "network":
        geometry = this.createNetworkGeometry();
        break;
      case "dom":
        geometry = this.createDOMGeometry();
        break;
      case "storage":
        geometry = this.createStorageGeometry();
        break;
      default:
        geometry = new THREE.SphereGeometry(1, 16, 12);
    }

    stationMesh = new THREE.Mesh(geometry, this.materials[config.type]);
    stationMesh.position.copy(position);
    stationMesh.castShadow = true;
    stationMesh.receiveShadow = true;

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(1.5, 16, 12);
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: this.materials[config.type].color,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(position);

    // Add floating text label
    const label = this.createTextLabel(config.name, config.type);
    label.position.set(0, 2, 0);

    stationGroup.add(stationMesh);
    stationGroup.add(glowMesh);
    stationGroup.add(label);

    // Add orbital ring indicator
    const ringGeometry = new THREE.RingGeometry(2, 2.2, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: this.materials[config.type].color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(position);
    stationGroup.add(ring);

    return {
      id: config.id,
      type: config.type,
      name: config.name,
      mesh: stationGroup,
      position: position.clone(),
      isActive: false,
      activeOperations: [],
    };
  }

  private createTimerGeometry(): THREE.BufferGeometry {
    // Clock-like design for timer station
    // Main body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 12);

    // TODO: Add clock face and hands in future iteration
    // const _faceGeometry = new THREE.CylinderGeometry(1.1, 1.1, 0.1, 16);
    // const _hourHandGeometry = new THREE.BoxGeometry(0.05, 0.6, 0.02);
    // const _minuteHandGeometry = new THREE.BoxGeometry(0.03, 0.8, 0.02);

    // Combine geometries (simplified for now, return main body)
    return bodyGeometry;
  }

  private createNetworkGeometry(): THREE.BufferGeometry {
    // Satellite dish design for network station
    // Main dish (cone)
    const dishGeometry = new THREE.ConeGeometry(1.2, 0.8, 12);

    // TODO: Add support structure in future iteration
    // const _supportGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);

    // Return main dish for now
    return dishGeometry;
  }

  private createDOMGeometry(): THREE.BufferGeometry {
    // Control panel design for DOM station
    // Main panel (box)
    const panelGeometry = new THREE.BoxGeometry(1.5, 1, 0.3);

    // TODO: Add control buttons in future iteration

    return panelGeometry;
  }

  private createStorageGeometry(): THREE.BufferGeometry {
    // Database/server design for storage station
    // Main server body (box)
    const serverGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.8);

    // TODO: Add storage drives in future iteration

    return serverGeometry;
  }

  private createTextLabel(text: string, type: "timer" | "network" | "dom" | "storage"): THREE.Mesh {
    // Create a simple text label using basic geometry for now
    // In a real implementation, you'd use TextGeometry or a texture
    const geometry = new THREE.PlaneGeometry(2, 0.5);
    const material = new THREE.MeshBasicMaterial({
      color: this.materials[type].color,
      transparent: true,
      opacity: 0.8,
    });

    const label = new THREE.Mesh(geometry, material);
    label.userData = { isLabel: true, text };

    return label;
  }

  private createOrbitParticles(): void {
    // Create ambient particles that follow the orbital path
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = this.orbitRadius + (Math.random() - 0.5) * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = this.orbitCenter.y + (Math.random() - 0.5) * 4;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x4444ff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(geometry, material);
    this.add(particles);
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;

    // Update orbital positions
    this.stations.forEach((station, id) => {
      const angle = this.time * this.orbitSpeed + this.getStationIndex(id) * Math.PI * 0.5;
      const x = this.orbitCenter.x + Math.cos(angle) * this.orbitRadius;
      const z = this.orbitCenter.z + Math.sin(angle) * this.orbitRadius;

      station.position.set(x, this.orbitCenter.y, z);
      station.mesh.position.copy(station.position);

      // Add gentle bobbing animation
      station.mesh.position.y += Math.sin(this.time * 2 + angle) * 0.2;

      // Rotate stations on their axis
      station.mesh.rotation.y += deltaTime * 0.5;
    });

    // Update connection beams
    this.updateConnectionBeams();
  }

  private getStationIndex(stationId: string): number {
    const stations = Array.from(this.stations.keys());
    return stations.indexOf(stationId);
  }

  private updateConnectionBeams(): void {
    // Clear existing beams
    this.connectionBeams.forEach((beam) => this.remove(beam));
    this.connectionBeams = [];

    // Create beams for active stations
    this.stations.forEach((station) => {
      if (station.isActive && station.activeOperations.length > 0) {
        const beam = this.createConnectionBeam(station.position, this.orbitCenter);
        this.connectionBeams.push(beam);
        this.add(beam);
      }
    });
  }

  private createConnectionBeam(from: THREE.Vector3, to: THREE.Vector3): THREE.Line {
    const points = [];
    points.push(from);
    points.push(to);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    });

    return new THREE.Line(geometry, material);
  }

  public activateStation(stationId: string, operation: string): void {
    const station = this.stations.get(stationId);
    if (station) {
      station.isActive = true;
      station.activeOperations.push(operation);

      // Enhance glow when active
      const glowMesh = station.mesh.children.find(
        (child) =>
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshPhongMaterial &&
          child.material.transparent
      ) as THREE.Mesh;

      if (glowMesh && glowMesh.material instanceof THREE.MeshPhongMaterial) {
        glowMesh.material.opacity = Math.min(0.3, glowMesh.material.opacity + 0.1);
      }
    }
  }

  public deactivateStation(stationId: string, operation?: string): void {
    const station = this.stations.get(stationId);
    if (station) {
      if (operation) {
        const index = station.activeOperations.indexOf(operation);
        if (index > -1) {
          station.activeOperations.splice(index, 1);
        }
      } else {
        station.activeOperations = [];
      }

      if (station.activeOperations.length === 0) {
        station.isActive = false;

        // Reduce glow when inactive
        const glowMesh = station.mesh.children.find(
          (child) =>
            child instanceof THREE.Mesh &&
            child.material instanceof THREE.MeshPhongMaterial &&
            child.material.transparent
        ) as THREE.Mesh;

        if (glowMesh && glowMesh.material instanceof THREE.MeshPhongMaterial) {
          glowMesh.material.opacity = 0.1;
        }
      }
    }
  }

  public getStationInfo(stationId: string): APIStation | undefined {
    return this.stations.get(stationId);
  }

  public getAllStations(): APIStation[] {
    return Array.from(this.stations.values());
  }

  public dispose(): void {
    // Dispose of geometries and materials
    this.stations.forEach((station) => {
      station.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });

    // Dispose of materials
    Object.values(this.materials).forEach((material) => material.dispose());

    // Clear arrays
    this.stations.clear();
    this.connectionBeams = [];
  }
}
