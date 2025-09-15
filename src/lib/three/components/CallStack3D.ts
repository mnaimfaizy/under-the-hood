import * as THREE from "three";

export interface CallStackFloor {
  id: string;
  label: string;
  functionName: string;
  isActive: boolean;
  executionTime?: number;
  details?: Record<string, any>;
}

export interface CallStack3DOptions {
  maxFloors?: number;
  floorHeight?: number;
  floorSpacing?: number;
  towerWidth?: number;
  towerDepth?: number;
  glowIntensity?: number;
  animationSpeed?: number;
}

export class CallStack3D extends THREE.Group {
  private floors: THREE.Mesh[] = [];
  private floorData: Map<number, CallStackFloor> = new Map();
  private elevatorCube!: THREE.Mesh;
  private baseStructure!: THREE.Group;
  private glowMaterials: Map<number, THREE.MeshPhongMaterial> = new Map();

  // Animation and interaction
  private animationMixers: THREE.AnimationMixer[] = [];
  private currentActiveFloor = -1;
  private elevatorPosition = 0;

  // Configuration
  private options: Required<CallStack3DOptions>;

  constructor(options: CallStack3DOptions = {}) {
    super();

    this.options = {
      maxFloors: options.maxFloors ?? 15,
      floorHeight: options.floorHeight ?? 0.8,
      floorSpacing: options.floorSpacing ?? 0.2,
      towerWidth: options.towerWidth ?? 4,
      towerDepth: options.towerDepth ?? 4,
      glowIntensity: options.glowIntensity ?? 0.5,
      animationSpeed: options.animationSpeed ?? 1.0,
    };

    this.name = "CallStack3D";
    this.position.set(-8, 0, 2); // Position to the left side of the scene

    this.createBaseStructure();
    this.createElevator();
    this.createFloors();
  }

  /**
   * Create the base foundation and structure of the tower
   */
  private createBaseStructure(): void {
    this.baseStructure = new THREE.Group();

    // Create foundation platform
    const foundationGeometry = new THREE.CylinderGeometry(
      this.options.towerWidth * 0.7,
      this.options.towerWidth * 0.8,
      0.5,
      16
    );
    const foundationMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c3e50,
      shininess: 30,
    });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = -0.25;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    this.baseStructure.add(foundation);

    // Create vertical support beams
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const beamRadius = this.options.towerWidth * 0.6;
      const beamGeometry = new THREE.CylinderGeometry(
        0.1,
        0.1,
        this.options.maxFloors * (this.options.floorHeight + this.options.floorSpacing),
        8
      );
      const beamMaterial = new THREE.MeshPhongMaterial({
        color: 0x34495e,
        shininess: 50,
      });
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.set(
        Math.cos(angle) * beamRadius,
        (this.options.maxFloors * (this.options.floorHeight + this.options.floorSpacing)) / 2,
        Math.sin(angle) * beamRadius
      );
      beam.castShadow = true;
      this.baseStructure.add(beam);
    }

    this.add(this.baseStructure);
  }

  /**
   * Create the elevator system
   */
  private createElevator(): void {
    const elevatorGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.6);
    const elevatorMaterial = new THREE.MeshPhongMaterial({
      color: 0xe74c3c,
      shininess: 80,
      transparent: true,
      opacity: 0.9,
    });

    this.elevatorCube = new THREE.Mesh(elevatorGeometry, elevatorMaterial);
    this.elevatorCube.position.set(0, 0.5, 0);
    this.elevatorCube.castShadow = true;

    // Add elevator light
    const elevatorLight = new THREE.PointLight(0xe74c3c, 0.5, 3);
    elevatorLight.position.set(0, 0.2, 0);
    this.elevatorCube.add(elevatorLight);

    this.add(this.elevatorCube);
  }

  /**
   * Create the floor structures (initially empty)
   */
  private createFloors(): void {
    for (let i = 0; i < this.options.maxFloors; i++) {
      const floor = this.createFloor(i);
      this.floors.push(floor);
      this.add(floor);
    }
  }

  /**
   * Create a single floor mesh
   */
  private createFloor(floorIndex: number): THREE.Mesh {
    const floorY = floorIndex * (this.options.floorHeight + this.options.floorSpacing) + 0.5;

    // Create floor geometry - glass-like appearance
    const floorGeometry = new THREE.BoxGeometry(
      this.options.towerWidth,
      this.options.floorHeight,
      this.options.towerDepth
    );

    // Create different materials for active/inactive states
    const inactiveMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c3e50,
      transparent: true,
      opacity: 0.3,
      shininess: 100,
    });

    const activeMaterial = new THREE.MeshPhongMaterial({
      color: 0x3498db,
      transparent: true,
      opacity: 0.8,
      shininess: 100,
      emissive: 0x1a5490,
      emissiveIntensity: this.options.glowIntensity,
    });

    const floor = new THREE.Mesh(floorGeometry, inactiveMaterial);
    floor.position.set(0, floorY, 0);
    floor.castShadow = true;
    floor.receiveShadow = true;

    // Store materials for quick switching
    (floor as any).inactiveMaterial = inactiveMaterial;
    (floor as any).activeMaterial = activeMaterial;

    // Add floor edges for better definition
    const edgeGeometry = new THREE.EdgesGeometry(floorGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x7fb3d3,
      transparent: true,
      opacity: 0.5,
    });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    floor.add(edges);

    // Add floor label (initially hidden)
    const labelCanvas = document.createElement("canvas");
    labelCanvas.getContext("2d")!; // Initialize canvas context
    labelCanvas.width = 256;
    labelCanvas.height = 64;

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
      opacity: 0,
    });

    const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 0, this.options.towerDepth / 2 + 0.1);
    label.name = "label";
    floor.add(label);

    return floor;
  }

  /**
   * Push a new function onto the call stack
   */
  pushFunction(floorData: CallStackFloor): void {
    const availableFloor = this.floors.findIndex(
      (floor) => !this.floorData.has(this.floors.indexOf(floor))
    );

    if (availableFloor === -1) {
      console.warn("Call stack overflow - maximum floors reached");
      return;
    }

    this.floorData.set(availableFloor, floorData);
    this.activateFloor(availableFloor);
    this.updateFloorLabel(availableFloor, floorData);
    this.animateElevatorTo(availableFloor);
    this.currentActiveFloor = availableFloor;
  }

  /**
   * Pop the top function from the call stack
   */
  popFunction(): CallStackFloor | null {
    if (this.floorData.size === 0) return null;

    // Find the highest active floor
    const activeFloors = Array.from(this.floorData.keys()).sort((a, b) => b - a);
    const topFloor = activeFloors[0];

    const floorData = this.floorData.get(topFloor);
    this.floorData.delete(topFloor);

    this.deactivateFloor(topFloor);

    // Move elevator to new top floor
    const newTopFloor = activeFloors[1];
    if (newTopFloor !== undefined) {
      this.animateElevatorTo(newTopFloor);
      this.currentActiveFloor = newTopFloor;
    } else {
      this.animateElevatorTo(0);
      this.currentActiveFloor = -1;
    }

    return floorData || null;
  }

  /**
   * Activate a floor (make it glow and visible)
   */
  private activateFloor(floorIndex: number): void {
    const floor = this.floors[floorIndex];
    if (!floor) return;

    // Switch to active material
    floor.material = (floor as any).activeMaterial;

    // Animate the activation
    const targetScale = 1.05;
    const animateActivation = () => {
      floor.scale.lerp(new THREE.Vector3(targetScale, 1, targetScale), 0.1);
      if (Math.abs(floor.scale.x - targetScale) > 0.01) {
        requestAnimationFrame(animateActivation);
      }
    };
    animateActivation();

    // Show label
    const label = floor.getObjectByName("label") as THREE.Mesh;
    if (label && label.material) {
      (label.material as THREE.MeshBasicMaterial).opacity = 1;
    }
  }

  /**
   * Deactivate a floor
   */
  private deactivateFloor(floorIndex: number): void {
    const floor = this.floors[floorIndex];
    if (!floor) return;

    // Switch to inactive material
    floor.material = (floor as any).inactiveMaterial;

    // Animate deactivation
    floor.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);

    // Hide label
    const label = floor.getObjectByName("label") as THREE.Mesh;
    if (label && label.material) {
      (label.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  }

  /**
   * Update floor label text
   */
  private updateFloorLabel(floorIndex: number, floorData: CallStackFloor): void {
    const floor = this.floors[floorIndex];
    const label = floor.getObjectByName("label") as THREE.Mesh;
    if (!label || !label.material) return;

    const material = label.material as THREE.MeshBasicMaterial;
    const texture = material.map as THREE.CanvasTexture;
    const canvas = texture.image as HTMLCanvasElement;
    const context = canvas.getContext("2d")!;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set text style
    context.fillStyle = "#ffffff";
    context.font = "bold 20px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Draw function name
    context.fillText(floorData.functionName, canvas.width / 2, canvas.height / 2);

    // Update texture
    texture.needsUpdate = true;
  }

  /**
   * Animate elevator movement to a specific floor
   */
  private animateElevatorTo(floorIndex: number): void {
    const targetY = floorIndex * (this.options.floorHeight + this.options.floorSpacing) + 0.5;

    const animateElevator = () => {
      this.elevatorCube.position.y += (targetY - this.elevatorCube.position.y) * 0.1;

      if (Math.abs(this.elevatorCube.position.y - targetY) > 0.01) {
        requestAnimationFrame(animateElevator);
      } else {
        this.elevatorCube.position.y = targetY;
        this.elevatorPosition = floorIndex;
      }
    };

    animateElevator();
  }

  /**
   * Get floor at specific index for interaction
   */
  getFloor(index: number): THREE.Mesh | null {
    return this.floors[index] || null;
  }

  /**
   * Get floor data
   */
  getFloorData(index: number): CallStackFloor | null {
    return this.floorData.get(index) || null;
  }

  /**
   * Get current stack depth
   */
  getCurrentDepth(): number {
    return this.floorData.size;
  }

  /**
   * Clear the entire call stack
   */
  clearStack(): void {
    this.floorData.forEach((_, index) => {
      this.deactivateFloor(index);
    });
    this.floorData.clear();
    this.animateElevatorTo(0);
    this.currentActiveFloor = -1;
  }

  /**
   * Handle raycaster intersection for interaction
   */
  handleInteraction(intersectionPoint: THREE.Vector3): CallStackFloor | null {
    // Find which floor was clicked
    for (let i = 0; i < this.floors.length; i++) {
      const floor = this.floors[i];
      const floorBounds = new THREE.Box3().setFromObject(floor);

      if (floorBounds.containsPoint(intersectionPoint)) {
        return this.floorData.get(i) || null;
      }
    }

    return null;
  }

  /**
   * Update animations (call in render loop)
   */
  update(deltaTime: number): void {
    // Update animation mixers
    this.animationMixers.forEach((mixer) => mixer.update(deltaTime));

    // Subtle floating animation for the entire tower
    this.position.y = Math.sin(Date.now() * 0.001) * 0.1;

    // Pulse the elevator light
    if (this.elevatorCube.children[0] instanceof THREE.PointLight) {
      const light = this.elevatorCube.children[0] as THREE.PointLight;
      light.intensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.2;
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    // Dispose geometries and materials
    this.floors.forEach((floor) => {
      if (floor.geometry) floor.geometry.dispose();
      if (floor.material && Array.isArray(floor.material)) {
        floor.material.forEach((mat) => mat.dispose());
      } else if (floor.material) {
        (floor.material as THREE.Material).dispose();
      }
    });

    // Dispose animation mixers
    this.animationMixers.forEach((mixer) => mixer.uncacheRoot(mixer.getRoot()));
    this.animationMixers.length = 0;

    // Clear data
    this.floorData.clear();
    this.glowMaterials.clear();
  }
}
