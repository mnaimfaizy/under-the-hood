// Simulation event loop runner (MVP)
import type { SimEvent, RunnerOptions } from './types';

export function createRunner(options: RunnerOptions) {
  let scenario: SimEvent[] = [];
  let index = 0;
  let playing = false;
  let timer: any = null;
  const speed = options.speed ?? 1000;

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
    }, speed);
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

  return { play, pause, step, reset, load };
}
