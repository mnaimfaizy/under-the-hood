import { describe, it, expect, beforeEach, vi } from "vitest";
import { SimulationBridge } from "./SimulationBridge";
import type { SimEvent } from "../sim/types";

describe("SimulationBridge", () => {
  let bridge: SimulationBridge;
  let mockNarrationUpdate: ReturnType<typeof vi.fn>;
  let mockEventProcessed: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNarrationUpdate = vi.fn();
    mockEventProcessed = vi.fn();

    bridge = new SimulationBridge({
      onNarrationUpdate: mockNarrationUpdate,
      onEventProcessed: mockEventProcessed,
    });
  });

  it("should initialize with default state", () => {
    expect(bridge.getEventHistory()).toHaveLength(0);
    expect(bridge.getTokenRegistry().size).toBe(0);
    expect(bridge.getAnimationDelay()).toBe(800); // Default delay
  });

  it("should handle sync events", () => {
    const syncEvent: SimEvent = {
      type: "sync",
      description: "console.log('Hello')",
    };

    bridge.handleSimEvent(syncEvent);

    expect(bridge.getEventHistory()).toContainEqual(syncEvent);
    expect(mockNarrationUpdate).toHaveBeenCalledWith("console.log('Hello')");
    expect(mockEventProcessed).toHaveBeenCalledWith(syncEvent);
  });

  it("should handle token-move events", () => {
    const tokenMoveEvent: SimEvent = {
      type: "token-move",
      token: { id: "t1", type: "promise", label: "Promise" },
      from: "code",
      to: "microtask-queue",
    };

    bridge.handleSimEvent(tokenMoveEvent);

    expect(bridge.getEventHistory()).toContainEqual(tokenMoveEvent);
    expect(bridge.getTokenRegistry().get("t1")).toEqual({
      id: "t1",
      type: "promise",
      label: "Promise",
    });
    expect(mockNarrationUpdate).toHaveBeenCalledWith("Promise moves to the microtask VIP lane.");
  });

  it("should handle scenario-end events", () => {
    const endEvent: SimEvent = {
      type: "scenario-end",
    };

    bridge.handleSimEvent(endEvent);

    expect(mockNarrationUpdate).toHaveBeenCalledWith(
      "🎉 All done! The JavaScript event loop has processed everything."
    );
  });

  it("should update animation speed", () => {
    bridge.setAnimationSpeed(2);
    expect(bridge.getAnimationDelay()).toBe(400); // 800 / 2

    bridge.setAnimationSpeed(0.5);
    expect(bridge.getAnimationDelay()).toBe(1600); // 800 / 0.5
  });

  it("should reset state", () => {
    // Add some events first
    bridge.handleSimEvent({ type: "sync", description: "Test" });
    bridge.handleSimEvent({
      type: "token-move",
      token: { id: "t1", type: "timer", label: "Timer" },
      from: "code",
      to: "macrotask-queue",
    });

    expect(bridge.getEventHistory()).toHaveLength(2);
    expect(bridge.getTokenRegistry().size).toBe(1);

    // Reset
    bridge.reset();

    expect(bridge.getEventHistory()).toHaveLength(0);
    expect(bridge.getTokenRegistry().size).toBe(0);
  });

  it("should generate appropriate narration for different event types", () => {
    const events: SimEvent[] = [
      { type: "stack-push", frame: "main" },
      { type: "stack-pop", frame: "main" },
      { type: "enqueue-micro", token: { id: "p1", type: "promise", label: "Promise" } },
      { type: "enqueue-macro", token: { id: "t1", type: "timer", label: "setTimeout" } },
      { type: "dequeue-micro", token: { id: "p1", type: "promise", label: "Promise" } },
      { type: "dequeue-macro", token: { id: "t1", type: "timer", label: "setTimeout" } },
      { type: "webapi-add", token: { id: "f1", type: "fetch", label: "fetch()" } },
      { type: "webapi-complete", token: { id: "f1", type: "fetch", label: "fetch()" } },
      { type: "microtask-drain", description: "Draining microtasks" },
      { type: "macrotask-run", description: "Running macrotask" },
      { type: "tick", phase: "run-sync" },
    ];

    const expectedNarrations = [
      '📚 Pushing "main" onto the Call Stack.',
      '📤 Popping "main" from the Call Stack.',
      "🚀 Adding Promise to the microtask VIP lane.",
      "🏭 Adding setTimeout to the macrotask conveyor belt.",
      "⚡ Processing Promise from the microtask queue.",
      "🏃 Processing setTimeout from the macrotask queue.",
      "🌐 fetch() is being handled by Web APIs.",
      "✅ Web API finished processing fetch().",
      "Draining microtasks",
      "Running macrotask",
      "⏰ Event loop is executing synchronous code.",
    ];

    events.forEach((event, index) => {
      bridge.handleSimEvent(event);
      expect(mockNarrationUpdate).toHaveBeenLastCalledWith(expectedNarrations[index]);
    });
  });

  it("should handle unknown event types gracefully", () => {
    const unknownEvent = {
      type: "unknown-event",
      data: "some data",
    } as any;

    bridge.handleSimEvent(unknownEvent);

    expect(mockNarrationUpdate).toHaveBeenCalledWith("Event: unknown-event");
    expect(mockEventProcessed).toHaveBeenCalledWith(unknownEvent);
  });
});
