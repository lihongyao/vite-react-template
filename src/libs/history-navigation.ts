export type AppNavigationIntent = 'navigate-back' | 'switch-tab';

type PendingAppNavigation = {
  expectedHistoryIndex?: number;
  expectedPathname?: string;
  fromHistoryKey: string | null;
  id: number;
  intent: AppNavigationIntent;
  requestedAt: number;
};

const FALLBACK_INTENT_LIFETIME_MS = 10_000;
let pendingAppNavigation: PendingAppNavigation | null = null;
let nextAppNavigationId = 0;

export function markAppNavigation(
  intent: AppNavigationIntent,
  expected?: { historyIndex?: number; pathname?: string },
) {
  nextAppNavigationId += 1;
  pendingAppNavigation = {
    expectedHistoryIndex: expected?.historyIndex,
    expectedPathname: expected?.pathname,
    fromHistoryKey: readHistoryKey(),
    id: nextAppNavigationId,
    intent,
    requestedAt: Date.now(),
  };
}

export function readPendingAppNavigation({
  fromHistoryKey,
  historyIndex,
  pathname,
}: {
  fromHistoryKey: string;
  historyIndex: number | null;
  pathname: string;
}): { id: number; intent: AppNavigationIntent } | null {
  if (!pendingAppNavigation) return null;
  if (Date.now() - pendingAppNavigation.requestedAt > FALLBACK_INTENT_LIFETIME_MS) return null;
  if (
    pendingAppNavigation.fromHistoryKey !== null &&
    pendingAppNavigation.fromHistoryKey !== fromHistoryKey
  ) {
    return null;
  }
  if (
    pendingAppNavigation.expectedHistoryIndex !== undefined &&
    pendingAppNavigation.expectedHistoryIndex !== historyIndex
  ) {
    return null;
  }
  if (
    pendingAppNavigation.expectedPathname !== undefined &&
    pendingAppNavigation.expectedPathname !== pathname
  ) {
    return null;
  }

  return { id: pendingAppNavigation.id, intent: pendingAppNavigation.intent };
}

export function clearAppNavigation(id?: number) {
  if (id !== undefined && pendingAppNavigation?.id !== id) return;
  pendingAppNavigation = null;
}

export function readHistoryIndex() {
  const state = readHistoryState();
  return state && typeof state.idx === 'number' ? state.idx : null;
}

function readHistoryKey() {
  const state = readHistoryState();
  return state && typeof state.key === 'string' ? state.key : null;
}

function readHistoryState(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;

  const state: unknown = window.history.state;
  return typeof state === 'object' && state !== null ? (state as Record<string, unknown>) : null;
}
