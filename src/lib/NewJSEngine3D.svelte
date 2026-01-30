<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { JSEngine3D } from "./jsengine3d/JSEngine3D";
  import type { SimEvent } from "./sim/types";

  // Export API for parent component
  export let api: any = {};

  // Component state
  let canvasElement: HTMLCanvasElement;
  let engine: JSEngine3D | null = null;
  let narration = "Ready to visualize JavaScript execution";
  let currentPhase = "idle";

  onMount(() => {
    initEngine();
  });

  onDestroy(() => {
    if (engine) {
      engine.dispose();
    }
  });

  function initEngine() {
    if (!canvasElement) return;

    engine = new JSEngine3D(canvasElement, {
      onPhaseChange: (phase) => {
        currentPhase = phase;
      },
      onNarration: (text) => {
        narration = text;
      },
    });

    // Expose API for parent component
    api.handleSimEvent = (event: SimEvent) => {
      if (engine) {
        engine.handleEvent(event);
      }
      // Update narration from event
      if ("description" in event && event.description) {
        narration = event.description;
      }
    };

    api.resetTimeline = () => {
      if (engine) {
        engine.reset();
        narration = "Ready to visualize JavaScript execution";
      }
    };

    api.resetTokens = () => {
      if (engine) {
        engine.reset();
      }
    };

    api.pauseTimeline = () => {
      // No-op for 3D mode, controlled by App
    };

    api.playTimeline = () => {
      // No-op for 3D mode, controlled by App
    };

    api.stepTimeline = () => {
      // No-op for 3D mode, controlled by App
    };
  }
</script>

<div class="engine-container">
  <div class="canvas-wrapper">
    <canvas bind:this={canvasElement}></canvas>
    <div class="overlay-info">
      <div class="phase-indicator">
        <span class="label">Current Phase:</span>
        <span class="value phase-{currentPhase}">{currentPhase}</span>
      </div>
      <div class="narration-box">
        <p>{narration}</p>
      </div>
    </div>
  </div>
</div>

<style>
  .engine-container {
    width: 100%;
    height: 600px;
    display: flex;
    flex-direction: column;
  }

  .canvas-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: #0a0a15;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .overlay-info {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .phase-indicator {
    background: rgba(0, 0, 0, 0.7);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: fit-content;
    color: white;
  }

  .phase-indicator .label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .phase-indicator .value {
    font-size: 0.95rem;
    font-weight: 600;
    margin-left: 0.5rem;
    text-transform: capitalize;
  }

  .narration-box {
    background: rgba(0, 0, 0, 0.7);
    padding: 0.75rem 1rem;
    border-radius: 6px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .narration-box p {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .phase-idle {
    color: #95a5a6;
  }
  .phase-callstack {
    color: #3498db;
  }
  .phase-microtasks {
    color: #9b59b6;
  }
  .phase-macrotasks {
    color: #e67e22;
  }
</style>
