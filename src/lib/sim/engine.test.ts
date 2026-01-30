import { describe, it, expect } from "vitest";
import { createRunner } from "./engine";
import { scenarioTimerVsPromise } from "./scenarios";

describe("Simulation Engine", () => {
  it("drains microtasks before macrotasks", () => {
    const events: string[] = [];
    const runner = createRunner({
      onEvent: (e) => events.push(e.type),
      speed: 10,
    });
    runner.load(scenarioTimerVsPromise());
    for (let i = 0; i < 6; i++) runner.step();
    expect(events).toEqual([
      "sync",
      "token-move",
      "token-move",
      "microtask-drain",
      "macrotask-run",
      "scenario-end",
    ]);
  });
});
