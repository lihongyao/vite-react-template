import { useMatches } from 'react-router';

import type { RouteTransitionHandle, RouteTransitionMetadata } from './types';

const DEFAULT_METADATA: RouteTransitionMetadata = {
  sceneId: null,
  surface: 'stack',
};

export function useRouteTransitionMetadata() {
  const matches = useMatches();
  return getRouteTransitionMetadata(matches.map((match) => match.handle));
}

export function getRouteTransitionMetadata(handles: unknown[]): RouteTransitionMetadata {
  for (const handle of handles.toReversed()) {
    if (!isRouteTransitionHandle(handle)) continue;

    return handle.transitionSurface === 'tab'
      ? { sceneId: handle.sceneId, surface: 'tab' }
      : { sceneId: null, surface: 'stack' };
  }

  return DEFAULT_METADATA;
}

function isRouteTransitionHandle(value: unknown): value is RouteTransitionHandle {
  if (typeof value !== 'object' || value === null || !('transitionSurface' in value)) {
    return false;
  }

  if (value.transitionSurface === 'stack') return true;
  return (
    value.transitionSurface === 'tab' &&
    'sceneId' in value &&
    typeof value.sceneId === 'string' &&
    value.sceneId.length > 0
  );
}
