/// <reference types="svelte" />
/// <reference lib="dom" />
/// <reference lib="webgl" />

declare module "stats-js" {
  export default class Stats {
    dom: HTMLElement;
    showPanel(id: number): void;
    update(): void;
    constructor();
  }
}

declare module "three-orbitcontrols-ts" {
  import * as THREE from "three";

  export class OrbitControls extends THREE.EventDispatcher {
    object: THREE.Camera;
    domElement: HTMLElement;

    enabled: boolean;
    target: THREE.Vector3;

    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;

    autoRotate: boolean;
    autoRotateSpeed: number;

    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;

    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;

    constructor(object: THREE.Camera, domElement?: HTMLElement);

    update(): boolean;
    dispose(): void;
  }
}
