import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AnimationEvent, ReactNode } from 'react';

import {
  NavigationType,
  useLocation,
  useMatches,
  useNavigationType,
  useOutlet,
} from 'react-router';

import { cn } from '@/libs/class-helpers';
import { clearAppHistoryTraversal, isAppHistoryTraversal } from '@/libs/history-navigation';

import { RouteScenePresentContext } from './route-scene-context';
import type { RouteTransitionHandle, RouteTransitionSurface } from './types';

import './route-transition.css';

type NavigationDirection = -1 | 0 | 1;
type StackSceneMode = 'active' | 'enter' | 'exit' | 'hidden' | 'source';

type RouteTransitionContextValue = {
  browserHistoryTraversal: boolean;
  direction: NavigationDirection;
  fromKey: string;
  fromPathname: string;
  fromScrollY: number;
  fromSurface: RouteTransitionSurface;
  navigationType: NavigationType;
  toKey: string;
  toSurface: RouteTransitionSurface;
  token: number;
};

type CommittedLocation = {
  historyIndex: number | null;
  key: string;
  pathname: string;
  surface: RouteTransitionSurface;
};

type StackSceneEntry = {
  historyIndex: number | null;
  node: ReactNode;
  pathname: string;
  scrollTop: number;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue>({
  browserHistoryTraversal: false,
  direction: 0,
  fromKey: 'default',
  fromPathname: '/',
  fromScrollY: 0,
  fromSurface: 'stack',
  navigationType: NavigationType.Pop,
  toKey: 'default',
  toSurface: 'stack',
  token: 0,
});

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const currentHistoryIndex = readHistoryIndex();
  const surface = useRouteTransitionSurface();
  const committedLocationRef = useRef<CommittedLocation>({
    historyIndex: currentHistoryIndex,
    key: location.key,
    pathname: location.pathname,
    surface,
  });
  const lastTransitionRef = useRef<RouteTransitionContextValue>({
    browserHistoryTraversal: false,
    direction: 0,
    fromKey: location.key,
    fromPathname: location.pathname,
    fromScrollY: 0,
    fromSurface: surface,
    navigationType,
    toKey: location.key,
    toSurface: surface,
    token: 0,
  });
  const committedLocation = committedLocationRef.current;

  let transition = lastTransitionRef.current;
  if (committedLocation.key !== location.key) {
    const nextDirection = getNavigationDirection(
      navigationType,
      committedLocation.historyIndex,
      currentHistoryIndex,
    );

    transition = {
      browserHistoryTraversal:
        navigationType === NavigationType.Pop && !isAppHistoryTraversal(currentHistoryIndex),
      direction: nextDirection,
      fromKey: committedLocation.key,
      fromPathname: committedLocation.pathname,
      fromScrollY: readDocumentScrollTop(),
      fromSurface: committedLocation.surface,
      navigationType,
      toKey: location.key,
      toSurface: surface,
      token: lastTransitionRef.current.token + 1,
    };
  }

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const locationChanged = committedLocationRef.current.key !== location.key;
    committedLocationRef.current = {
      historyIndex: currentHistoryIndex,
      key: location.key,
      pathname: location.pathname,
      surface,
    };
    lastTransitionRef.current = transition;
    if (locationChanged) clearAppHistoryTraversal();
  }, [currentHistoryIndex, location.key, location.pathname, surface, transition]);

  return (
    <RouteTransitionContext.Provider value={transition}>{children}</RouteTransitionContext.Provider>
  );
}

export function RouteTransitionOutlet() {
  const transition = useContext(RouteTransitionContext);
  const location = useLocation();
  const outlet = useOutlet();
  const surface = useRouteTransitionSurface();
  const currentHistoryIndex = readHistoryIndex();
  const tabScenesRef = useRef(new Map<string, ReactNode>());
  const tabScrollPositionsRef = useRef(new Map<string, number>());
  const stackScenesRef = useRef(new Map<string, StackSceneEntry>());
  const activeTabPathRef = useRef(location.pathname);
  const handledTransitionTokenRef = useRef(0);
  const [settledTransitionToken, setSettledTransitionToken] = useState(0);

  if (transition.token > handledTransitionTokenRef.current) {
    if (transition.fromSurface === 'tab') {
      tabScrollPositionsRef.current.set(transition.fromPathname, transition.fromScrollY);
    } else {
      const sourceEntry = stackScenesRef.current.get(transition.fromKey);
      if (sourceEntry) sourceEntry.scrollTop = transition.fromScrollY;
    }
    handledTransitionTokenRef.current = transition.token;
  }

  if (surface === 'tab') {
    if (!tabScenesRef.current.has(location.pathname)) {
      tabScenesRef.current.set(location.pathname, outlet);
    }
    activeTabPathRef.current = location.pathname;
  } else if (!stackScenesRef.current.has(location.key)) {
    if (transition.navigationType === NavigationType.Push && currentHistoryIndex !== null) {
      for (const [key, entry] of stackScenesRef.current) {
        if (entry.historyIndex !== null && entry.historyIndex >= currentHistoryIndex) {
          stackScenesRef.current.delete(key);
        }
      }
    }

    stackScenesRef.current.set(location.key, {
      historyIndex: currentHistoryIndex,
      node: outlet,
      pathname: location.pathname,
      scrollTop: 0,
    });
  }

  const transitionPending = transition.token > 0 && settledTransitionToken !== transition.token;
  const pushTransition =
    transitionPending &&
    !transition.browserHistoryTraversal &&
    transition.direction > 0 &&
    transition.toSurface === 'stack';
  const popTransition =
    transitionPending &&
    !transition.browserHistoryTraversal &&
    transition.direction < 0 &&
    transition.fromSurface === 'stack';
  const tabTransition =
    transitionPending && transition.fromSurface === 'tab' && transition.toSurface === 'tab';
  const tabHostVisible = surface === 'tab' || (pushTransition && transition.fromSurface === 'tab');
  const tabHostUnderlay = surface === 'stack' && tabScenesRef.current.size > 0;
  const tabUnderlayScrollTop = tabScrollPositionsRef.current.get(activeTabPathRef.current) ?? 0;
  const targetScrollTop = getTargetDocumentScrollTop({
    locationKey: location.key,
    pathname: location.pathname,
    stackScenes: stackScenesRef.current,
    surface,
    tabScrollPositions: tabScrollPositionsRef.current,
    transition,
  });

  useEffect(() => {
    if (!pushTransition && !popTransition && !tabTransition) return undefined;

    const fallbackTimer = window.setTimeout(() => {
      setSettledTransitionToken(transition.token);
    }, 400);

    return () => window.clearTimeout(fallbackTimer);
  }, [popTransition, pushTransition, tabTransition, transition.token]);

  useLayoutEffect(() => {
    if (pushTransition) return;
    window.scrollTo({ behavior: 'auto', left: 0, top: targetScrollTop });
  }, [location.key, pushTransition, settledTransitionToken, targetScrollTop]);

  const completeTransition = () => {
    setSettledTransitionToken(transition.token);
  };

  return (
    <>
      <div
        aria-hidden={tabHostVisible ? undefined : true}
        className={cn(
          'route-tab-host',
          tabHostUnderlay && 'route-tab-host-underlay',
          !tabHostVisible && !tabHostUnderlay && 'route-scene-hidden',
        )}
        data-route-transition="tab"
        inert={tabHostVisible ? undefined : true}
        style={
          tabHostUnderlay
            ? { transform: `translate3d(0, -${tabUnderlayScrollTop}px, 0)` }
            : undefined
        }
      >
        {Array.from(tabScenesRef.current, ([path, cachedOutlet]) => {
          const selected = path === activeTabPathRef.current;
          const present = selected && surface === 'tab' && !popTransition;

          return (
            <TabScene
              key={path}
              animate={selected && tabTransition}
              onTransitionEnd={completeTransition}
              present={present}
              selected={selected}
              scrollKey={path}
            >
              {cachedOutlet}
            </TabScene>
          );
        })}
      </div>

      <div data-route-transition="stack">
        {Array.from(stackScenesRef.current, ([key, entry]) => {
          const mode = getStackSceneMode({
            currentKey: location.key,
            currentSurface: surface,
            key,
            popTransition,
            pushTransition,
            transition,
          });

          return (
            <StackScene
              frozenScrollTop={mode === 'exit' ? entry.scrollTop : 0}
              key={key}
              mode={mode}
              onTransitionEnd={completeTransition}
              pathname={entry.pathname}
              sceneKey={key}
            >
              {entry.node}
            </StackScene>
          );
        })}
      </div>
    </>
  );
}

function TabScene({
  animate,
  children,
  onTransitionEnd,
  present,
  selected,
  scrollKey,
}: {
  animate: boolean;
  children: ReactNode;
  onTransitionEnd: () => void;
  present: boolean;
  selected: boolean;
  scrollKey: string;
}) {
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target || !animate) return;
    onTransitionEnd();
  };

  return (
    <div
      aria-hidden={present ? undefined : true}
      className={cn(
        'route-tab-scene',
        selected ? 'route-scene-visible' : 'route-scene-hidden',
        animate && 'route-tab-enter',
      )}
      data-route-path={scrollKey}
      data-route-present={present ? 'true' : 'false'}
      inert={present ? undefined : true}
      onAnimationEnd={handleAnimationEnd}
    >
      <RouteScenePresentContext.Provider value={present}>
        {children}
      </RouteScenePresentContext.Provider>
    </div>
  );
}

function StackScene({
  children,
  frozenScrollTop,
  mode,
  onTransitionEnd,
  pathname,
  sceneKey,
}: {
  children: ReactNode;
  frozenScrollTop: number;
  mode: StackSceneMode;
  onTransitionEnd: () => void;
  pathname: string;
  sceneKey: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const fixed = mode === 'enter' || mode === 'exit';
  const present = mode === 'active' || mode === 'enter';

  useLayoutEffect(() => {
    if (fixed && sceneRef.current) sceneRef.current.scrollTop = frozenScrollTop;
  }, [fixed, frozenScrollTop, mode]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target || !fixed) return;
    onTransitionEnd();
  };

  return (
    <div
      ref={sceneRef}
      aria-hidden={present ? undefined : true}
      className={cn(
        'route-stack-scene',
        (mode === 'active' || mode === 'source') && 'route-stack-flow',
        mode === 'active' && 'route-stack-active',
        mode === 'source' && 'route-stack-source',
        fixed && 'app-fixed-frame route-stack-fixed',
        mode === 'hidden' && 'route-scene-hidden',
      )}
      data-route-mode={mode}
      data-route-path={pathname}
      data-route-present={present ? 'true' : 'false'}
      data-route-scene-key={sceneKey}
      data-route-surface="stack"
      inert={present ? undefined : true}
    >
      <div
        className={cn(
          'route-stack-panel',
          mode === 'enter' && 'route-stack-enter',
          mode === 'exit' && 'route-stack-exit',
        )}
        onAnimationEnd={handleAnimationEnd}
      >
        <RouteScenePresentContext.Provider value={present}>
          {children}
        </RouteScenePresentContext.Provider>
      </div>
    </div>
  );
}

function getStackSceneMode({
  currentKey,
  currentSurface,
  key,
  popTransition,
  pushTransition,
  transition,
}: {
  currentKey: string;
  currentSurface: RouteTransitionSurface;
  key: string;
  popTransition: boolean;
  pushTransition: boolean;
  transition: RouteTransitionContextValue;
}): StackSceneMode {
  if (pushTransition) {
    if (key === transition.toKey) return 'enter';
    if (transition.fromSurface === 'stack' && key === transition.fromKey) return 'source';
  }

  if (popTransition && key === transition.fromKey) return 'exit';
  if (currentSurface === 'stack' && key === currentKey) return 'active';
  return 'hidden';
}

function getTargetDocumentScrollTop({
  locationKey,
  pathname,
  stackScenes,
  surface,
  tabScrollPositions,
  transition,
}: {
  locationKey: string;
  pathname: string;
  stackScenes: Map<string, StackSceneEntry>;
  surface: RouteTransitionSurface;
  tabScrollPositions: Map<string, number>;
  transition: RouteTransitionContextValue;
}) {
  if (surface === 'stack') return stackScenes.get(locationKey)?.scrollTop ?? 0;

  const returningFromStack = transition.fromSurface === 'stack' && transition.direction < 0;
  return returningFromStack ? (tabScrollPositions.get(pathname) ?? 0) : 0;
}

function useRouteTransitionSurface(): RouteTransitionSurface {
  const matches = useMatches();

  for (const match of matches.toReversed()) {
    if (isRouteTransitionHandle(match.handle)) return match.handle.transitionSurface;
  }

  return 'stack';
}

function isRouteTransitionHandle(value: unknown): value is RouteTransitionHandle {
  if (typeof value !== 'object' || value === null || !('transitionSurface' in value)) {
    return false;
  }

  return value.transitionSurface === 'stack' || value.transitionSurface === 'tab';
}

function readHistoryIndex() {
  if (typeof window === 'undefined') return null;

  const state: unknown = window.history.state;
  if (typeof state !== 'object' || state === null || !('idx' in state)) return null;

  return typeof state.idx === 'number' ? state.idx : null;
}

function readDocumentScrollTop() {
  if (typeof window === 'undefined') return 0;
  return window.scrollY;
}

function getNavigationDirection(
  navigationType: ReturnType<typeof useNavigationType>,
  previousHistoryIndex: number | null,
  currentHistoryIndex: number | null,
): NavigationDirection {
  if (navigationType === NavigationType.Push) return 1;
  if (navigationType === NavigationType.Replace) return 0;

  if (
    previousHistoryIndex !== null &&
    currentHistoryIndex !== null &&
    previousHistoryIndex !== currentHistoryIndex
  ) {
    return currentHistoryIndex > previousHistoryIndex ? 1 : -1;
  }

  return -1;
}
