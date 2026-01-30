// Scenario helpers for simulation engine
import type { SimEvent, Token } from "./types";

/**
 * Returns a scenario with a timer and a promise to show event loop order.
 */
export function scenarioTimerVsPromise(): SimEvent[] {
  const timer: Token = { id: "t1", type: "timer", label: "⏱️ Wait Task" };
  const promise: Token = { id: "p1", type: "promise", label: "⚡ Quick Task" };
  return [
    { type: "sync", description: "Start sync code" },
    { type: "token-move", token: timer, from: "code", to: "macrotask-queue" },
    { type: "token-move", token: promise, from: "code", to: "microtask-queue" },
    { type: "microtask-drain", description: "Drain microtasks (Quick Task runs first)" },
    { type: "token-move", token: promise, from: "microtask-queue", to: "call-stack" },
    { type: "sync", description: "Quick Task completes!" },
    { type: "token-remove", tokenId: "p1", description: "Quick Task finished!" },
    { type: "macrotask-run", description: "Run macrotask (Wait Task runs after)" },
    { type: "token-move", token: timer, from: "macrotask-queue", to: "call-stack" },
    { type: "sync", description: "Wait Task completes!" },
    { type: "token-remove", tokenId: "t1", description: "Wait Task finished!" },
    { type: "sync", description: "All tasks complete! JavaScript engine is empty." },
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
    { type: "sync", description: "First log completes" },
    { type: "token-remove", tokenId: "l1", description: "First log done!" },
    { type: "sync", description: "Run second log" },
    { type: "token-move", token: log2, from: "code", to: "call-stack" },
    { type: "sync", description: "Second log completes" },
    { type: "token-remove", tokenId: "l2", description: "Second log done!" },
    { type: "sync", description: "All tasks complete! JavaScript engine is empty." },
    { type: "scenario-end" },
  ];
}

/**
 * Returns a scenario with a fetch to show web API and microtask.
 */
export function scenarioFetchRobot(): SimEvent[] {
  const fetch: Token = { id: "f1", type: "fetch", label: "🌐 Fetch Task" };
  const microtask: Token = { id: "m1", type: "microtask", label: "⚡ Quick Task" };
  return [
    { type: "sync", description: "Start fetch" },
    { type: "token-move", token: fetch, from: "code", to: "web-api" },
    { type: "token-move", token: microtask, from: "code", to: "microtask-queue" },
    { type: "microtask-drain", description: "Drain microtasks (Quick Task runs)" },
    { type: "token-move", token: microtask, from: "microtask-queue", to: "call-stack" },
    { type: "sync", description: "Quick Task completes!" },
    { type: "token-remove", tokenId: "m1", description: "Quick Task finished!" },
    { type: "sync", description: "Fetch completes in Magic Cloud" },
    { type: "token-remove", tokenId: "f1", description: "Fetch finished!" },
    { type: "sync", description: "All tasks complete! JavaScript engine is empty." },
    { type: "scenario-end" },
  ];
}

/**
 * Returns a scenario with a microtask chain to demonstrate starvation of macrotasks.
 */
export function scenarioMicrotaskChain(): SimEvent[] {
  const promise1: Token = { id: "p1", type: "promise", label: "⚡ Quick 1" };
  const promise2: Token = { id: "p2", type: "promise", label: "⚡ Quick 2" };
  const promise3: Token = { id: "p3", type: "promise", label: "⚡ Quick 3" };
  const timer: Token = { id: "t1", type: "timer", label: "⏱️ Wait Task" };
  return [
    { type: "sync", description: "Start the quick task party!" },
    { type: "token-move", token: promise1, from: "code", to: "microtask-queue" },
    { type: "token-move", token: promise2, from: "code", to: "microtask-queue" },
    { type: "token-move", token: promise3, from: "code", to: "microtask-queue" },
    { type: "token-move", token: timer, from: "code", to: "macrotask-queue" },
    { type: "microtask-drain", description: "Speedy lane is busy with quick friends!" },
    { type: "token-move", token: promise1, from: "microtask-queue", to: "call-stack" },
    { type: "sync", description: "Quick 1 completes!" },
    { type: "token-remove", tokenId: "p1" },
    { type: "token-move", token: promise2, from: "microtask-queue", to: "call-stack" },
    { type: "sync", description: "Quick 2 completes!" },
    { type: "token-remove", tokenId: "p2" },
    { type: "token-move", token: promise3, from: "microtask-queue", to: "call-stack" },
    { type: "sync", description: "Quick 3 completes!" },
    { type: "token-remove", tokenId: "p3" },
    { type: "macrotask-run", description: "Wait task waits patiently in the waiting line." },
    { type: "token-move", token: timer, from: "macrotask-queue", to: "call-stack" },
    { type: "sync", description: "Wait Task completes!" },
    { type: "token-remove", tokenId: "t1" },
    { type: "sync", description: "All tasks complete! JavaScript engine is empty." },
    { type: "scenario-end" },
  ];
}

/**
 * Returns a scenario with nested timeouts to demonstrate FIFO macrotask order.
 */
export function scenarioNestedTimeouts(): SimEvent[] {
  const timer1: Token = { id: "t1", type: "timer", label: "⏱️ Wait A" };
  const timer2: Token = { id: "t2", type: "timer", label: "⏱️ Wait B" };
  const timer3: Token = { id: "t3", type: "timer", label: "⏱️ Wait C" };
  return [
    { type: "sync", description: "Set up the timer lineup!" },
    { type: "token-move", token: timer1, from: "code", to: "macrotask-queue" },
    { type: "token-move", token: timer2, from: "code", to: "macrotask-queue" },
    { type: "token-move", token: timer3, from: "code", to: "macrotask-queue" },
    { type: "macrotask-run", description: "First wait task in line goes!" },
    { type: "token-move", token: timer1, from: "macrotask-queue", to: "call-stack" },
    { type: "sync", description: "Wait A completes!" },
    { type: "token-remove", tokenId: "t1" },
    { type: "macrotask-run", description: "Next wait task in line goes!" },
    { type: "token-move", token: timer2, from: "macrotask-queue", to: "call-stack" },
    { type: "sync", description: "Wait B completes!" },
    { type: "token-remove", tokenId: "t2" },
    { type: "macrotask-run", description: "Last wait task in line goes!" },
    { type: "token-move", token: timer3, from: "macrotask-queue", to: "call-stack" },
    { type: "sync", description: "Wait C completes!" },
    { type: "token-remove", tokenId: "t3" },
    { type: "sync", description: "All tasks complete! JavaScript engine is empty." },
    { type: "scenario-end" },
  ];
}

/**
 * Returns a scenario showing async/await desugaring to microtasks.
 */
export function scenarioAsyncAwait(): SimEvent[] {
  const asyncStart: Token = { id: "a1", type: "async", label: "🔄 Async Start" };
  const awaitResume: Token = { id: "a2", type: "async", label: "⚡ Resume" };
  return [
    { type: "sync", description: "Async function begins!" },
    { type: "token-move", token: asyncStart, from: "code", to: "call-stack" },
    { type: "sync", description: "Log before await." },
    { type: "token-remove", tokenId: "a1", description: "Pausing at await..." },
    { type: "token-move", token: awaitResume, from: "code", to: "microtask-queue" },
    { type: "microtask-drain", description: "Await resumes in Speedy Lane!" },
    { type: "token-move", token: awaitResume, from: "microtask-queue", to: "call-stack" },
    { type: "sync", description: "Async function completes!" },
    { type: "token-remove", tokenId: "a2" },
    { type: "sync", description: "All tasks complete! JavaScript engine is empty." },
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
    { type: "token-move", token: clickHandler, from: "macrotask-queue", to: "call-stack" },
    { type: "sync", description: "Click handler completes!" },
    { type: "token-remove", tokenId: "c1" },
    { type: "sync", description: "All tasks complete! JavaScript engine is empty." },
    { type: "scenario-end" },
  ];
}
