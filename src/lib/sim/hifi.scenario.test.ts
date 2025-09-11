import { describe, it, expect } from "vitest";
import { scenarioHiFiBasic } from "./scenarios";

describe("HiFi Scenario", () => {
  it("emits webapi add before enqueue-macro and completes before macro run", () => {
    const events = scenarioHiFiBasic();
    const types = events.map((e) => e.type);
    expect(types[0]).toBe("stack-push");
    expect(types).toContain("webapi-add");
    const addIndex = types.indexOf("webapi-add");
    const completeIndex = types.indexOf("webapi-complete");
    const enqueueMacroIndex = types.indexOf("enqueue-macro");
    expect(addIndex).toBeLessThan(completeIndex);
    expect(completeIndex).toBeLessThan(enqueueMacroIndex);
    expect(types.at(-1)).toBe("scenario-end");
  });
});
