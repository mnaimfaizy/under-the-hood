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
    // Step through entire scenario
    for (let i = 0; i < 13; i++) runner.step();

    // Check key ordering: microtask-drain comes before macrotask-run
    const microIndex = events.indexOf("microtask-drain");
    const macroIndex = events.indexOf("macrotask-run");
    expect(microIndex).toBeGreaterThan(-1);
    expect(macroIndex).toBeGreaterThan(-1);
    expect(microIndex).toBeLessThan(macroIndex);
    expect(events.at(-1)).toBe("scenario-end");
  });
});
