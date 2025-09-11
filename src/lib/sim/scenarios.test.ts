import { describe, it, expect } from "vitest";
import {
  scenarioTimerVsPromise,
  scenarioTwoLogs,
  scenarioFetchRobot,
} from "./scenarios";

describe("Scenarios", () => {
  it("timer vs promise emits expected ordering and ends", () => {
    const events = scenarioTimerVsPromise().map((e) => e.type);
    expect(events[0]).toBe("sync");
    expect(events).toContain("microtask-drain");
    expect(events).toContain("macrotask-run");
    expect(events.at(-1)).toBe("scenario-end");
  });

  it("two logs is sync-only and ends", () => {
    const events = scenarioTwoLogs().map((e) => e.type);
    // two sync moves + scenario end with token-move events in between
    expect(events.filter((e) => e === "sync").length).toBe(2);
    expect(events.at(-1)).toBe("scenario-end");
  });

  it("fetch robot includes web api and microtask then ends", () => {
    const events = scenarioFetchRobot().map((e) => e.type);
    expect(events).toContain("microtask-drain");
    expect(events).toContain("macrotask-run");
    expect(events.at(-1)).toBe("scenario-end");
  });
});
