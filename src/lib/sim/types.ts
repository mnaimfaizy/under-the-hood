// Simulation token and event types for the engine
/**
 * Represents a visual token in the simulation (e.g., a log, timer, promise).
 */
export type Token = {
  id: string;
  type: 'log' | 'timer' | 'promise' | 'fetch' | 'microtask' | 'macrotask';
  label: string;
  color?: string;
  icon?: string;
};

/**
 * Simulation event types for the event loop.
 */
export type SimEvent =
  | { type: 'sync'; description: string }
  | { type: 'microtask-drain'; description: string }
  | { type: 'macrotask-run'; description: string }
  | { type: 'token-move'; token: Token; from: string; to: string }
  | { type: 'scenario-end' };

/**
 * Simulation runner API options.
 */
export type RunnerOptions = {
  onEvent: (event: SimEvent) => void;
  speed?: number;
};
