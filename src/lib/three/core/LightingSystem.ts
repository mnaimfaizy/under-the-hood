import * as THREE from "three";

export interface LightingSystemOptions {
  ambientIntensity?: number;
  ambientColor?: number;
  directionalIntensity?: number;
  directionalColor?: number;
  enableShadows?: boolean;
  shadowMapSize?: number;
}

export class LightingSystem {
  private scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private pointLights: THREE.PointLight[] = [];
  private spotLights: THREE.SpotLight[] = [];

  // Dynamic lighting effects
  private animationMixer?: THREE.AnimationMixer;
  private lightAnimations = new Map<string, THREE.AnimationAction>();

  constructor(scene: THREE.Scene, options: LightingSystemOptions = {}) {
    this.scene = scene;

    // Create ambient light for overall illumination
    this.ambientLight = new THREE.AmbientLight(
      options.ambientColor ?? 0x404040,
      options.ambientIntensity ?? 0.3
    );
    this.scene.add(this.ambientLight);

    // Create main directional light (sun-like)
    this.directionalLight = new THREE.DirectionalLight(
      options.directionalColor ?? 0xffffff,
      options.directionalIntensity ?? 0.8
    );
    this.directionalLight.position.set(10, 10, 5);
    this.directionalLight.target.position.set(0, 0, 0);

    // Configure shadows if enabled
    if (options.enableShadows ?? true) {
      this.directionalLight.castShadow = true;
      this.directionalLight.shadow.mapSize.width = options.shadowMapSize ?? 2048;
      this.directionalLight.shadow.mapSize.height = options.shadowMapSize ?? 2048;
      this.directionalLight.shadow.camera.near = 0.5;
      this.directionalLight.shadow.camera.far = 50;
      this.directionalLight.shadow.camera.left = -20;
      this.directionalLight.shadow.camera.right = 20;
      this.directionalLight.shadow.camera.top = 20;
      this.directionalLight.shadow.camera.bottom = -20;
      this.directionalLight.shadow.bias = -0.0001;
    }

    this.scene.add(this.directionalLight);
    this.scene.add(this.directionalLight.target);

    // Add some accent lighting
    this.setupAccentLighting();
  }

  /**
   * Setup accent lighting for enhanced visual appeal
   */
  private setupAccentLighting(): void {
    // Blue accent light for the call stack area
    const callStackLight = new THREE.PointLight(0x4444ff, 0.5, 15);
    callStackLight.position.set(-8, 6, 2);
    this.scene.add(callStackLight);
    this.pointLights.push(callStackLight);

    // Green accent light for the event loop area
    const eventLoopLight = new THREE.PointLight(0x44ff44, 0.4, 10);
    eventLoopLight.position.set(0, 2, 0);
    this.scene.add(eventLoopLight);
    this.pointLights.push(eventLoopLight);

    // Orange accent light for the queue areas
    const queueLight = new THREE.PointLight(0xff8844, 0.3, 12);
    queueLight.position.set(8, 3, -2);
    this.scene.add(queueLight);
    this.pointLights.push(queueLight);

    // Rim lighting for better object definition
    const rimLight = new THREE.DirectionalLight(0x6666ff, 0.2);
    rimLight.position.set(-5, 8, -10);
    this.scene.add(rimLight);
  }

  /**
   * Create a dynamic light that responds to system activity
   */
  createActivityLight(
    position: THREE.Vector3,
    color: number = 0xffffff,
    intensity: number = 1.0,
    distance: number = 10
  ): THREE.PointLight {
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.copy(position);
    this.scene.add(light);
    this.pointLights.push(light);
    return light;
  }

  /**
   * Create a spotlight for highlighting specific components
   */
  createSpotlight(
    position: THREE.Vector3,
    target: THREE.Vector3,
    color: number = 0xffffff,
    intensity: number = 1.0,
    distance: number = 15,
    angle: number = Math.PI / 6,
    penumbra: number = 0.1
  ): THREE.SpotLight {
    const spotlight = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
    spotlight.position.copy(position);
    spotlight.target.position.copy(target);

    // Enable shadows for spotlight
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    spotlight.shadow.camera.near = 0.5;
    spotlight.shadow.camera.far = distance;

    this.scene.add(spotlight);
    this.scene.add(spotlight.target);
    this.spotLights.push(spotlight);

    return spotlight;
  }

  /**
   * Animate a light's intensity
   */
  animateLightIntensity(
    light: THREE.Light,
    targetIntensity: number,
    duration: number = 1.0,
    easing: string = "easeInOut"
  ): void {
    const startIntensity = light.intensity;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Apply easing
      let easedProgress = progress;
      switch (easing) {
        case "easeIn":
          easedProgress = progress * progress;
          break;
        case "easeOut":
          easedProgress = 1 - Math.pow(1 - progress, 2);
          break;
        case "easeInOut":
          easedProgress =
            progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          break;
      }

      light.intensity = startIntensity + (targetIntensity - startIntensity) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Pulse a light to indicate activity
   */
  pulseLight(
    light: THREE.Light,
    minIntensity: number = 0.2,
    maxIntensity: number = 1.0,
    frequency: number = 2.0
  ): void {
    const amplitude = (maxIntensity - minIntensity) / 2;
    const offset = (maxIntensity + minIntensity) / 2;

    const animate = () => {
      const time = Date.now() * 0.001; // Convert to seconds
      light.intensity = offset + amplitude * Math.sin(time * frequency * Math.PI * 2);
      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Set ambient light intensity (global illumination)
   */
  setAmbientIntensity(intensity: number): void {
    this.ambientLight.intensity = intensity;
  }

  /**
   * Set directional light intensity (main sun-like light)
   */
  setDirectionalIntensity(intensity: number): void {
    this.directionalLight.intensity = intensity;
  }

  /**
   * Update directional light position (simulates sun movement)
   */
  setDirectionalLightPosition(position: THREE.Vector3): void {
    this.directionalLight.position.copy(position);
  }

  /**
   * Enable/disable shadows for all lights
   */
  setShadowsEnabled(enabled: boolean): void {
    this.directionalLight.castShadow = enabled;
    this.spotLights.forEach((light) => {
      light.castShadow = enabled;
    });
  }

  /**
   * Set lighting theme for different modes
   */
  setLightingTheme(theme: "kid" | "pro" | "dark" | "high-contrast"): void {
    switch (theme) {
      case "kid":
        this.ambientLight.intensity = 0.5;
        this.directionalLight.intensity = 1.0;
        this.ambientLight.color.setHex(0x404040);
        break;
      case "pro":
        this.ambientLight.intensity = 0.3;
        this.directionalLight.intensity = 0.8;
        this.ambientLight.color.setHex(0x202040);
        break;
      case "dark":
        this.ambientLight.intensity = 0.2;
        this.directionalLight.intensity = 0.6;
        this.ambientLight.color.setHex(0x101020);
        break;
      case "high-contrast":
        this.ambientLight.intensity = 0.6;
        this.directionalLight.intensity = 1.2;
        this.ambientLight.color.setHex(0xffffff);
        break;
    }
  }

  /**
   * Get all lights in the system
   */
  getAllLights(): THREE.Light[] {
    return [this.ambientLight, this.directionalLight, ...this.pointLights, ...this.spotLights];
  }

  /**
   * Remove a specific light
   */
  removeLight(light: THREE.Light): void {
    this.scene.remove(light);

    // Remove from arrays
    const pointIndex = this.pointLights.indexOf(light as THREE.PointLight);
    if (pointIndex > -1) {
      this.pointLights.splice(pointIndex, 1);
    }

    const spotIndex = this.spotLights.indexOf(light as THREE.SpotLight);
    if (spotIndex > -1) {
      this.spotLights.splice(spotIndex, 1);
    }
  }

  /**
   * Update lighting system (call in render loop if needed)
   */
  update(): void {
    // Update animation mixer if it exists
    if (this.animationMixer) {
      this.animationMixer.update(0.016); // Assume 60fps
    }
  }

  /**
   * Clean up lighting system
   */
  dispose(): void {
    // Remove all lights from scene
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.directionalLight);
    this.scene.remove(this.directionalLight.target);

    this.pointLights.forEach((light) => this.scene.remove(light));
    this.spotLights.forEach((light) => {
      this.scene.remove(light);
      this.scene.remove(light.target);
    });

    // Clear arrays
    this.pointLights.length = 0;
    this.spotLights.length = 0;

    // Dispose animation mixer
    if (this.animationMixer) {
      this.animationMixer.uncacheRoot(this.animationMixer.getRoot());
    }

    this.lightAnimations.clear();
  }
}
