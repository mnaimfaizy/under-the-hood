// Simulation token and event types for the engine
/**
 * Represents a visual token in the simulation (e.g., a log, timer, promise).
 */
export type Token = {
  id: string;
  type: "log" | "timer" | "promise" | "fetch" | "microtask" | "macrotask" | "async";
  label: string;
  color?: string;
  icon?: string;
};

/**
 * Simulation event types for the event loop.
 */
export type SimEvent =
  | { type: "sync"; description: string }
  | { type: "microtask-drain"; description: string }
  | { type: "macrotask-run"; description: string }
  | { type: "token-move"; token: Token; from: string; to: string }
  | { type: "token-remove"; tokenId: string; description?: string }
  | { type: "stack-push"; frame: string }
  | { type: "stack-pop"; frame: string }
  | { type: "enqueue-micro"; token: Token }
  | { type: "enqueue-macro"; token: Token }
  | { type: "dequeue-micro"; token: Token }
  | { type: "dequeue-macro"; token: Token }
  | { type: "webapi-add"; token: Token }
  | { type: "webapi-complete"; token: Token }
  | { type: "tick"; phase: "run-sync" | "drain-micro" | "run-macro" }
  | { type: "scenario-end" };

/**
 * Simulation runner API options.
 */
export type RunnerOptions = {
  onEvent: (event: SimEvent) => void;
  speed?: number;
};
