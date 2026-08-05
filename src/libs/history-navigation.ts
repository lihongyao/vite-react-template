type PendingAppHistoryTraversal = {
  expectedHistoryIndex: number | null;
  requestedAt: number;
};

const FALLBACK_INTENT_LIFETIME_MS = 10_000;

let pendingAppHistoryTraversal: PendingAppHistoryTraversal | null = null;

export function markAppHistoryTraversal(delta: number) {
  const historyIndex = readHistoryIndex();

  pendingAppHistoryTraversal = {
    expectedHistoryIndex: historyIndex === null ? null : historyIndex + delta,
    requestedAt: Date.now(),
  };
}

export function isAppHistoryTraversal(historyIndex: number | null) {
  if (!pendingAppHistoryTraversal) return false;

  if (pendingAppHistoryTraversal.expectedHistoryIndex !== null) {
    return pendingAppHistoryTraversal.expectedHistoryIndex === historyIndex;
  }

  return Date.now() - pendingAppHistoryTraversal.requestedAt <= FALLBACK_INTENT_LIFETIME_MS;
}

export function clearAppHistoryTraversal() {
  pendingAppHistoryTraversal = null;
}

function readHistoryIndex() {
  if (typeof window === 'undefined') return null;

  const state: unknown = window.history.state;
  if (typeof state !== 'object' || state === null || !('idx' in state)) return null;

  return typeof state.idx === 'number' ? state.idx : null;
}
