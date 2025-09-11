export type TokenHistoryEntry = { t: number; id: string; label: string; kind: string };

export function pushTokenHistory(
  history: TokenHistoryEntry[],
  entry: TokenHistoryEntry,
  max = 120
): TokenHistoryEntry[] {
  return [...history, entry].slice(-max);
}

export function pushNarrationHistory(
  history: { t: number; line: string }[],
  line: string,
  max = 20
) {
  return [...history, { t: Date.now(), line }].slice(-max);
}
