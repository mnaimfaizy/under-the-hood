// Simulation event loop runner (MVP)
import type { SimEvent, RunnerOptions } from "./types";

export function createRunner(options: RunnerOptions) {
  let scenario: SimEvent[] = [];
  let index = 0;
  let playing = false;
  let timer: any = null;
  let delay = options.speed ?? 1000; // ms per step

  function emit(event: SimEvent) {
    options.onEvent(event);
  }

  function step() {
    if (index < scenario.length) {
      emit(scenario[index]);
      index++;
    } else {
      pause();
    }
  }

  function play() {
    if (playing) return;
    playing = true;
    timer = setInterval(() => {
      step();
      if (index >= scenario.length) {
        pause();
      }
    }, delay);
  }

  function pause() {
    playing = false;
    if (timer) clearInterval(timer);
    timer = null;
  }

  function reset() {
    pause();
    index = 0;
  }

  function load(newScenario: SimEvent[]) {
    reset();
    scenario = newScenario;
  }

  function setSpeed(msPerStep: number) {
    // Update delay and restart timer if currently playing
    delay = Math.max(1, msPerStep);
    if (playing) {
      pause();
      play();
    }
  }

  function getCurrentStep() {
    return index;
  }

  function getTotalSteps() {
    return scenario.length;
  }

  function stepBackward() {
    if (index > 0) {
      index--;
      // Re-emit the previous event for narration update
      if (index < scenario.length) {
        emit(scenario[index]);
      }
    }
  }

  return { play, pause, step, stepBackward, reset, load, setSpeed, getCurrentStep, getTotalSteps };
}
