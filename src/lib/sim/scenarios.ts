// Scenario helpers for simulation engine
import type { SimEvent, Token } from "./types";

/**
 * Returns a scenario with a timer and a promise to show event loop order.
 */
export function scenarioTimerVsPromise(): SimEvent[] {
  const timer: Token = { id: "t1", type: "timer", label: "setTimeout" };
  const promise: Token = { id: "p1", type: "promise", label: "Promise" };
  return [
    { type: "sync", description: "Start sync code" },
    { type: "token-move", token: timer, from: "code", to: "macrotask-queue" },
    { type: "token-move", token: promise, from: "code", to: "microtask-queue" },
    { type: "microtask-drain", description: "Drain microtasks (Promise runs first)" },
    { type: "macrotask-run", description: "Run macrotask (Timer runs after microtasks)" },
    { type: "scenario-end" },
  ];
}

// High fidelity scenario mapping code sample to granular events
export function scenarioHiFiBasic(): SimEvent[] {
  const timeout: Token = { id: "timeout1", type: "timer", label: "setTimeout cb" };
  const promiseThen: Token = { id: "promise1", type: "promise", label: "then(res)" };
  return [
    { type: "stack-push", frame: "global" },
    { type: "sync", description: "console.log('Start!')" },
    { type: "enqueue-macro", token: timeout },
    { type: "enqueue-micro", token: promiseThen },
    { type: "sync", description: "console.log('End!')" },
    { type: "tick", phase: "drain-micro" },
    { type: "dequeue-micro", token: promiseThen },
    { type: "tick", phase: "run-macro" },
    { type: "dequeue-macro", token: timeout },
    { type: "stack-pop", frame: "global" },
    { type: "scenario-end" },
  ];
}

/**
 * Returns a scenario with two logs to show sync execution.
 */
export function scenarioTwoLogs(): SimEvent[] {
  const log1: Token = { id: "l1", type: "log", label: "console.log 1" };
  const log2: Token = { id: "l2", type: "log", label: "console.log 2" };
  return [
    { type: "sync", description: "Run first log" },
    { type: "token-move", token: log1, from: "code", to: "call-stack" },
    { type: "sync", description: "Run second log" },
    { type: "token-move", token: log2, from: "code", to: "call-stack" },
    { type: "scenario-end" },
  ];
}

/**
 * Returns a scenario with a fetch to show web API and microtask.
 */
export function scenarioFetchRobot(): SimEvent[] {
  const fetch: Token = { id: "f1", type: "fetch", label: "fetch()" };
  const microtask: Token = { id: "m1", type: "microtask", label: "Promise.resolve" };
  return [
    { type: "sync", description: "Start fetch" },
    { type: "token-move", token: fetch, from: "code", to: "web-api" },
    { type: "token-move", token: microtask, from: "code", to: "microtask-queue" },
    { type: "microtask-drain", description: "Drain microtasks (Promise runs)" },
    { type: "macrotask-run", description: "Run macrotask (fetch callback runs)" },
    { type: "scenario-end" },
  ];
}
