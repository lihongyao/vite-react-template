import { useLayoutEffect, useRef } from 'react';

import { useLocation, useNavigationType } from 'react-router';

import {
  clearAppNavigation,
  readHistoryIndex,
  readPendingAppNavigation,
} from '@/libs/history-navigation';

import type {
  RouteNavigationDirection,
  RouteNavigationIntent,
  RouteNavigationType,
  RouteTransitionMetadata,
  RouteTransitionSnapshot,
} from './types';

type CommittedLocation = RouteTransitionMetadata & {
  historyIndex: number | null;
  key: string;
  pathname: string;
};

export function useRouteNavigationSnapshot(metadata: RouteTransitionMetadata) {
  const location = useLocation();
  const navigationType = useNavigationType() as RouteNavigationType;
  const currentHistoryIndex = readHistoryIndex();
  const committedLocationRef = useRef<CommittedLocation>({
    historyIndex: currentHistoryIndex,
    key: location.key,
    pathname: location.pathname,
    ...metadata,
  });
  const lastTransitionRef = useRef<RouteTransitionSnapshot>({
    browserHistoryTraversal: false,
    direction: 0,
    fromKey: location.key,
    fromPathname: location.pathname,
    fromSceneId: metadata.sceneId,
    fromScrollY: 0,
    fromSurface: metadata.surface,
    navigationIntent: null,
    navigationIntentId: null,
    navigationType,
    toKey: location.key,
    toSceneId: metadata.sceneId,
    toSurface: metadata.surface,
    token: 0,
  });
  const committedLocation = committedLocationRef.current;

  let transition = lastTransitionRef.current;
  if (committedLocation.key !== location.key) {
    const pendingNavigation = readPendingAppNavigation({
      fromHistoryKey: committedLocation.key,
      historyIndex: currentHistoryIndex,
      pathname: location.pathname,
    });
    const navigationIntent = pendingNavigation?.intent ?? null;

    transition = {
      browserHistoryTraversal: navigationType === 'POP' && navigationIntent !== 'navigate-back',
      direction: getNavigationDirection({
        currentHistoryIndex,
        navigationIntent,
        navigationType,
        previousHistoryIndex: committedLocation.historyIndex,
      }),
      fromKey: committedLocation.key,
      fromPathname: committedLocation.pathname,
      fromSceneId: committedLocation.sceneId,
      fromScrollY: readDocumentScrollTop(),
      fromSurface: committedLocation.surface,
      navigationIntent,
      navigationIntentId: pendingNavigation?.id ?? null,
      navigationType,
      toKey: location.key,
      toSceneId: metadata.sceneId,
      toSurface: metadata.surface,
      token: lastTransitionRef.current.token + 1,
    };
  }

  useLayoutEffect(() => {
    const locationChanged = committedLocationRef.current.key !== location.key;
    committedLocationRef.current = {
      historyIndex: currentHistoryIndex,
      key: location.key,
      pathname: location.pathname,
      ...metadata,
    };
    lastTransitionRef.current = transition;

    if (locationChanged && transition.navigationIntentId !== null) {
      clearAppNavigation(transition.navigationIntentId);
    }
  }, [currentHistoryIndex, location.key, location.pathname, metadata, transition]);

  return {
    currentHistoryIndex,
    transition,
  };
}

export function getNavigationDirection({
  currentHistoryIndex,
  navigationIntent,
  navigationType,
  previousHistoryIndex,
}: {
  currentHistoryIndex: number | null;
  navigationIntent: RouteNavigationIntent | null;
  navigationType: RouteNavigationType;
  previousHistoryIndex: number | null;
}): RouteNavigationDirection {
  if (navigationIntent === 'navigate-back') return -1;
  if (navigationIntent === 'switch-tab') return 0;
  if (navigationType === 'PUSH') return 1;
  if (navigationType === 'REPLACE') return 0;

  if (
    previousHistoryIndex !== null &&
    currentHistoryIndex !== null &&
    previousHistoryIndex !== currentHistoryIndex
  ) {
    return currentHistoryIndex > previousHistoryIndex ? 1 : -1;
  }

  return -1;
}

function readDocumentScrollTop() {
  if (typeof window === 'undefined') return 0;
  return window.scrollY;
}
