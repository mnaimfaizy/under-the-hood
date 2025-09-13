import { describe, it, expect } from "vitest";
import {
  scenarioTimerVsPromise,
  scenarioTwoLogs,
  scenarioFetchRobot,
  scenarioMicrotaskChain,
  scenarioNestedTimeouts,
  scenarioAsyncAwait,
  scenarioDomClick,
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

describe("Microtask Chain Scenario", () => {
  it("includes multiple microtasks and one macrotask, ends correctly", () => {
    const events = scenarioMicrotaskChain().map((e) => e.type);
    expect(events.filter((e) => e === "token-move").length).toBe(4); // 3 micro + 1 macro
    expect(events).toContain("microtask-drain");
    expect(events).toContain("macrotask-run");
    expect(events.at(-1)).toBe("scenario-end");
  });
});

describe("Nested Timeouts Scenario", () => {
  it("includes multiple macrotasks in FIFO order, ends correctly", () => {
    const events = scenarioNestedTimeouts().map((e) => e.type);
    expect(events.filter((e) => e === "token-move").length).toBe(3); // 3 timers
    expect(events.filter((e) => e === "macrotask-run").length).toBe(3); // 3 runs
    expect(events.at(-1)).toBe("scenario-end");
  });
});

describe("Async/Await Scenario", () => {
  it("shows await enqueuing microtask for continuation", () => {
    const events = scenarioAsyncAwait().map((e) => e.type);
    expect(events).toContain("token-move"); // to microtask
    expect(events).toContain("microtask-drain");
    expect(events.at(-1)).toBe("scenario-end");
  });
});

describe("DOM Click Scenario", () => {
  it("simulates click event enqueuing handler macrotask", () => {
    const events = scenarioDomClick().map((e) => e.type);
    expect(events).toContain("token-move"); // to macrotask
    expect(events).toContain("macrotask-run");
    expect(events.at(-1)).toBe("scenario-end");
  });
});
