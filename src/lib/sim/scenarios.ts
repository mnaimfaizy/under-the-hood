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
    { type: "webapi-add", token: timeout },
    { type: "enqueue-micro", token: promiseThen },
    { type: "sync", description: "console.log('End!')" },
    { type: "webapi-complete", token: timeout },
    { type: "enqueue-macro", token: timeout },
    { type: "tick", phase: "drain-micro" },
    { type: "dequeue-micro", token: promiseThen },
    { type: "sync", description: "console.log('Promise!')" },
    { type: "tick", phase: "run-macro" },
    { type: "dequeue-macro", token: timeout },
    { type: "sync", description: "console.log('Timeout!')" },
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

/**
 * Returns a scenario with a microtask chain to demonstrate starvation of macrotasks.
 */
export function scenarioMicrotaskChain(): SimEvent[] {
  const promise1: Token = { id: "p1", type: "promise", label: "Promise 1" };
  const promise2: Token = { id: "p2", type: "promise", label: "Promise 2" };
  const promise3: Token = { id: "p3", type: "promise", label: "Promise 3" };
  const timer: Token = { id: "t1", type: "timer", label: "setTimeout" };
  return [
    { type: "sync", description: "Start the promise party!" },
    { type: "token-move", token: promise1, from: "code", to: "microtask-queue" },
    { type: "token-move", token: promise2, from: "code", to: "microtask-queue" },
    { type: "token-move", token: promise3, from: "code", to: "microtask-queue" },
    { type: "token-move", token: timer, from: "code", to: "macrotask-queue" },
    { type: "microtask-drain", description: "VIP lane is busy with promise friends!" },
    { type: "macrotask-run", description: "Timer waits patiently in the big line." },
    { type: "scenario-end" },
  ];
}

/**
 * Returns a scenario with nested timeouts to demonstrate FIFO macrotask order.
 */
export function scenarioNestedTimeouts(): SimEvent[] {
  const timer1: Token = { id: "t1", type: "timer", label: "Timer A" };
  const timer2: Token = { id: "t2", type: "timer", label: "Timer B" };
  const timer3: Token = { id: "t3", type: "timer", label: "Timer C" };
  return [
    { type: "sync", description: "Set up the timer lineup!" },
    { type: "token-move", token: timer1, from: "code", to: "macrotask-queue" },
    { type: "token-move", token: timer2, from: "code", to: "macrotask-queue" },
    { type: "token-move", token: timer3, from: "code", to: "macrotask-queue" },
    { type: "macrotask-run", description: "First timer in line goes!" },
    { type: "macrotask-run", description: "Next timer in line goes!" },
    { type: "macrotask-run", description: "Last timer in line goes!" },
    { type: "scenario-end" },
  ];
}

/**
 * Returns a scenario showing async/await desugaring to microtasks.
 */
export function scenarioAsyncAwait(): SimEvent[] {
  const asyncStart: Token = { id: "a1", type: "async", label: "Async Start" };
  const awaitResume: Token = { id: "a2", type: "async", label: "Await Resume" };
  return [
    { type: "sync", description: "Async function begins!" },
    { type: "token-move", token: asyncStart, from: "code", to: "call-stack" },
    { type: "sync", description: "Log before await." },
    { type: "token-move", token: awaitResume, from: "code", to: "microtask-queue" },
    { type: "microtask-drain", description: "Await resumes in VIP lane!" },
    { type: "scenario-end" },
  ];
}

/**
 * Returns a scenario simulating DOM click event enqueuing a handler.
 */
export function scenarioDomClick(): SimEvent[] {
  const clickHandler: Token = { id: "c1", type: "macrotask", label: "Click Handler" };
  return [
    { type: "sync", description: "Page loads and sets up click listener." },
    { type: "token-move", token: clickHandler, from: "code", to: "macrotask-queue" },
    { type: "macrotask-run", description: "Click handler runs when stack is free!" },
    { type: "scenario-end" },
  ];
}
