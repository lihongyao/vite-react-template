import type { RouteTransitionSnapshot, RouteTransitionSurface } from './types';

export type RouteTransitionKind = 'idle' | 'popping' | 'pushing' | 'switching-tab';
export type StackSceneMode = 'active' | 'enter' | 'exit' | 'hidden' | 'source';

export function getRouteTransitionKind(
  transition: RouteTransitionSnapshot,
  settledToken: number,
): RouteTransitionKind {
  if (transition.token === 0 || transition.token <= settledToken) return 'idle';
  if (transition.browserHistoryTraversal) return 'idle';

  if (
    transition.navigationIntent === 'switch-tab' &&
    transition.fromSurface === 'tab' &&
    transition.toSurface === 'tab'
  ) {
    return 'switching-tab';
  }

  if (transition.direction > 0 && transition.toSurface === 'stack') return 'pushing';
  if (transition.direction < 0 && transition.fromSurface === 'stack') return 'popping';
  return 'idle';
}

export function getStackSceneMode({
  currentKey,
  currentSurface,
  sceneKey,
  transition,
  transitionKind,
}: {
  currentKey: string;
  currentSurface: RouteTransitionSurface;
  sceneKey: string;
  transition: RouteTransitionSnapshot;
  transitionKind: RouteTransitionKind;
}): StackSceneMode {
  if (transitionKind === 'pushing') {
    if (sceneKey === transition.toKey) return 'enter';
    if (transition.fromSurface === 'stack' && sceneKey === transition.fromKey) return 'source';
  }

  if (transitionKind === 'popping' && sceneKey === transition.fromKey) return 'exit';
  if (currentSurface === 'stack' && sceneKey === currentKey) return 'active';
  return 'hidden';
}

export function getTabActivityMode({
  activeTabId,
  currentSurface,
  sceneId,
  transition,
  transitionKind,
}: {
  activeTabId: string | null;
  currentSurface: RouteTransitionSurface;
  sceneId: string;
  transition: RouteTransitionSnapshot;
  transitionKind: RouteTransitionKind;
}): 'hidden' | 'visible' {
  if (sceneId !== activeTabId) return 'hidden';
  if (currentSurface === 'tab') return 'visible';

  return transitionKind === 'pushing' && transition.fromSurface === 'tab' ? 'visible' : 'hidden';
}
