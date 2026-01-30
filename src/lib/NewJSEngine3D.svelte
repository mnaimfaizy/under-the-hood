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
    padding: 1.25rem;
    background: linear-gradient(145deg, #0a0a18 0%, #12122a 40%, #0f1628 100%);
    border-radius: var(--radius-2xl);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.3),
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 0 80px rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.1);
  }

  .canvas-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    background: radial-gradient(ellipse 80% 60% at 50% 40%, #0d0d1f 0%, #030308 100%);
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.6),
      inset 0 0 120px rgba(99, 102, 241, 0.04),
      inset 0 0 80px rgba(139, 92, 246, 0.03);
    border: 1px solid rgba(139, 92, 246, 0.2);
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .overlay-info {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    pointer-events: none;
  }

  .phase-indicator {
    background: linear-gradient(145deg, rgba(10, 10, 24, 0.95) 0%, rgba(18, 18, 42, 0.95) 100%);
    padding: 0.875rem 1.5rem;
    border-radius: var(--radius-lg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(99, 102, 241, 0.25);
    width: fit-content;
    color: white;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(99, 102, 241, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    pointer-events: auto;
    transition:
      transform 0.3s var(--ease-spring),
      box-shadow 0.3s ease;
  }

  .phase-indicator:hover {
    transform: translateY(-3px);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.6),
      0 0 30px rgba(99, 102, 241, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .phase-indicator .label {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  .phase-indicator .value {
    font-size: 1rem;
    font-weight: 700;
    text-transform: capitalize;
    padding: 0.3rem 0.875rem;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.06);
    transition:
      background 0.3s ease,
      color 0.3s ease,
      box-shadow 0.3s ease;
  }

  .narration-box {
    background: linear-gradient(145deg, rgba(10, 10, 24, 0.96) 0%, rgba(18, 18, 42, 0.96) 100%);
    padding: 1.125rem 1.5rem;
    border-radius: var(--radius-lg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(99, 102, 241, 0.2);
    max-width: 520px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
    pointer-events: auto;
    transition:
      transform 0.3s var(--ease-spring),
      border-color 0.3s ease;
  }

  .narration-box:hover {
    transform: translateY(-3px);
    border-color: rgba(99, 102, 241, 0.35);
  }

  .narration-box p {
    margin: 0;
    color: rgba(255, 255, 255, 0.88);
    font-size: 0.9375rem;
    line-height: 1.65;
    font-weight: 450;
  }

  /* Phase colors - matching the indigo-based theme */
  .phase-idle {
    color: #94a3b8;
    background: rgba(148, 163, 184, 0.12) !important;
  }

  .phase-callstack {
    color: #818cf8;
    background: rgba(129, 140, 248, 0.18) !important;
    text-shadow: 0 0 24px rgba(129, 140, 248, 0.4);
    box-shadow: 0 0 16px rgba(129, 140, 248, 0.15) !important;
  }

  .phase-microtasks {
    color: #c084fc;
    background: rgba(192, 132, 252, 0.18) !important;
    text-shadow: 0 0 24px rgba(192, 132, 252, 0.4);
    box-shadow: 0 0 16px rgba(192, 132, 252, 0.15) !important;
  }

  .phase-macrotasks {
    color: #f472b6;
    background: rgba(244, 114, 182, 0.18) !important;
    text-shadow: 0 0 24px rgba(244, 114, 182, 0.4);
    box-shadow: 0 0 16px rgba(244, 114, 182, 0.15) !important;
  }

  /* Subtle animated glow on the canvas wrapper */
  .canvas-wrapper::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: radial-gradient(
      ellipse 80% 50% at 50% 0%,
      rgba(139, 92, 246, 0.08) 0%,
      transparent 50%
    );
    z-index: 1;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .engine-container {
      height: 450px;
      padding: 0.75rem;
    }

    .overlay-info {
      top: 0.75rem;
      left: 0.75rem;
      right: 0.75rem;
    }

    .phase-indicator {
      padding: 0.5rem 1rem;
    }

    .phase-indicator .label {
      font-size: 0.65rem;
    }

    .phase-indicator .value {
      font-size: 0.85rem;
      padding: 0.2rem 0.5rem;
    }

    .narration-box {
      padding: 0.75rem 1rem;
    }

    .narration-box p {
      font-size: 0.85rem;
    }
  }
</style>
