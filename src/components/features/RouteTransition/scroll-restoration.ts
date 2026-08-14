import { useEffect, useLayoutEffect, useRef } from 'react';

import type { RouteTransitionKind } from './transition-state';
import type { RouteTransitionSnapshot, RouteTransitionSurface } from './types';

type ScrollRestorationOptions = {
  currentKey: string;
  currentSceneId: string | null;
  currentSurface: RouteTransitionSurface;
  stackSceneKeys: string[];
  transition: RouteTransitionSnapshot;
  transitionKind: RouteTransitionKind;
};

export function useRouteScrollRestoration({
  currentKey,
  currentSceneId,
  currentSurface,
  stackSceneKeys,
  transition,
  transitionKind,
}: ScrollRestorationOptions) {
  const positionsRef = useRef(new Map<string, number>());
  const recordedTransitionTokenRef = useRef(0);
  const restoredLocationKeyRef = useRef<string | null>(null);
  const stackSceneKeySignature = stackSceneKeys.join('\n');

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const positions = positionsRef.current;

    if (transition.token > recordedTransitionTokenRef.current) {
      positions.set(
        getSceneScrollKey(transition.fromSurface, transition.fromSceneId, transition.fromKey),
        transition.fromScrollY,
      );
      recordedTransitionTokenRef.current = transition.token;
    }

    pruneStackScrollPositions(positions, stackSceneKeySignature);

    if (transitionKind === 'pushing') return;
    if (restoredLocationKeyRef.current === currentKey) return;

    const targetScrollTop = getTargetScrollTop({
      currentKey,
      currentSceneId,
      currentSurface,
      positions,
      transition,
    });
    window.scrollTo({ behavior: 'auto', left: 0, top: targetScrollTop });
    restoredLocationKeyRef.current = currentKey;
  }, [
    currentKey,
    currentSceneId,
    currentSurface,
    stackSceneKeySignature,
    transition,
    transitionKind,
  ]);
}

export function getTargetScrollTop({
  currentKey,
  currentSceneId,
  currentSurface,
  positions,
  transition,
}: {
  currentKey: string;
  currentSceneId: string | null;
  currentSurface: RouteTransitionSurface;
  positions: ReadonlyMap<string, number>;
  transition: RouteTransitionSnapshot;
}) {
  const currentScrollKey = getSceneScrollKey(currentSurface, currentSceneId, currentKey);
  if (currentSurface === 'stack') return positions.get(currentScrollKey) ?? 0;

  const returningFromStack =
    transition.fromSurface === 'stack' &&
    transition.toSurface === 'tab' &&
    transition.navigationIntent !== 'switch-tab' &&
    transition.direction < 0;

  return returningFromStack ? (positions.get(currentScrollKey) ?? 0) : 0;
}

export function getSceneScrollKey(
  surface: RouteTransitionSurface,
  sceneId: string | null,
  locationKey: string,
) {
  return surface === 'tab' ? `tab:${sceneId ?? locationKey}` : `stack:${locationKey}`;
}

function pruneStackScrollPositions(positions: Map<string, number>, stackSceneKeySignature: string) {
  const retainedKeys = new Set(
    stackSceneKeySignature ? stackSceneKeySignature.split('\n').map((key) => `stack:${key}`) : [],
  );

  for (const key of positions.keys()) {
    if (key.startsWith('stack:') && !retainedKeys.has(key)) positions.delete(key);
  }
}
