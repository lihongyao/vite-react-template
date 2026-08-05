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
type StackSceneMode = 'active' | 'enter' | 'exit' | 'hidden' | 'underlay';

type RouteTransitionContextValue = {
  browserHistoryTraversal: boolean;
  direction: NavigationDirection;
  fromKey: string;
  fromSurface: RouteTransitionSurface;
  navigationType: NavigationType;
  toKey: string;
  toSurface: RouteTransitionSurface;
  token: number;
};

type CommittedLocation = {
  historyIndex: number | null;
  key: string;
  surface: RouteTransitionSurface;
};

type StackSceneEntry = {
  historyIndex: number | null;
  node: ReactNode;
  pathname: string;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue>({
  browserHistoryTraversal: false,
  direction: 0,
  fromKey: 'default',
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
    surface,
  });
  const lastTransitionRef = useRef<RouteTransitionContextValue>({
    browserHistoryTraversal: false,
    direction: 0,
    fromKey: location.key,
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
      fromSurface: committedLocation.surface,
      navigationType,
      toKey: location.key,
      toSurface: surface,
      token: lastTransitionRef.current.token + 1,
    };
  }

  useLayoutEffect(() => {
    const locationChanged = committedLocationRef.current.key !== location.key;
    committedLocationRef.current = {
      historyIndex: currentHistoryIndex,
      key: location.key,
      surface,
    };
    lastTransitionRef.current = transition;
    if (locationChanged) clearAppHistoryTraversal();
  }, [currentHistoryIndex, location.key, surface, transition]);

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
  const stackScenesRef = useRef(new Map<string, StackSceneEntry>());
  const activeTabPathRef = useRef(location.pathname);
  const [settledTransitionToken, setSettledTransitionToken] = useState(0);

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

  useEffect(() => {
    if (!pushTransition && !popTransition && !tabTransition) return undefined;

    const fallbackTimer = window.setTimeout(() => {
      setSettledTransitionToken(transition.token);
    }, 400);

    return () => window.clearTimeout(fallbackTimer);
  }, [popTransition, pushTransition, tabTransition, transition.token]);

  const completeStackTransition = () => {
    setSettledTransitionToken(transition.token);
  };

  return (
    <>
      <div
        className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[var(--tab-page-background)]"
        data-route-transition="tab"
      >
        {Array.from(tabScenesRef.current, ([path, cachedOutlet]) => {
          const selected = path === activeTabPathRef.current;
          const present = selected && surface === 'tab' && !popTransition;

          return (
            <TabScene
              key={path}
              animate={selected && tabTransition}
              onTransitionEnd={completeStackTransition}
              present={present}
              resetScrollToken={selected && tabTransition ? transition.token : 0}
              selected={selected}
              scrollKey={path}
            >
              {cachedOutlet}
            </TabScene>
          );
        })}
      </div>

      <div
        className="app-fixed-frame pointer-events-none fixed inset-y-0 z-30 overflow-hidden"
        data-route-transition="stack"
      >
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
              key={key}
              mode={mode}
              onTransitionEnd={completeStackTransition}
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
  resetScrollToken,
  selected,
  scrollKey,
}: {
  animate: boolean;
  children: ReactNode;
  onTransitionEnd: () => void;
  present: boolean;
  resetScrollToken: number;
  selected: boolean;
  scrollKey: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (resetScrollToken > 0 && selected && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [resetScrollToken, selected]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target || !animate) return;
    onTransitionEnd();
  };

  return (
    <div
      ref={scrollRef}
      aria-hidden={present ? undefined : true}
      className={cn(
        'route-scroll-container route-tab-scene',
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
  mode,
  onTransitionEnd,
  pathname,
  sceneKey,
}: {
  children: ReactNode;
  mode: StackSceneMode;
  onTransitionEnd: () => void;
  pathname: string;
  sceneKey: string;
}) {
  const present = mode === 'active' || mode === 'enter' || mode === 'exit';

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target || (mode !== 'enter' && mode !== 'exit')) return;
    onTransitionEnd();
  };

  return (
    <div
      aria-hidden={present ? undefined : true}
      className={cn(
        'route-scroll-container route-stack-scene',
        mode === 'active' && 'route-stack-active',
        mode === 'enter' && 'route-stack-enter',
        mode === 'exit' && 'route-stack-exit',
        mode === 'underlay' && 'route-stack-underlay',
        mode === 'hidden' && 'route-scene-hidden',
      )}
      data-route-mode={mode}
      data-route-path={pathname}
      data-route-present={present ? 'true' : 'false'}
      data-route-scene-key={sceneKey}
      data-route-surface="stack"
      inert={present ? undefined : true}
      onAnimationEnd={handleAnimationEnd}
    >
      <RouteScenePresentContext.Provider value={present}>
        {children}
      </RouteScenePresentContext.Provider>
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
    if (transition.fromSurface === 'stack' && key === transition.fromKey) return 'underlay';
  }

  if (popTransition) {
    if (key === transition.fromKey) return 'exit';
    if (transition.toSurface === 'stack' && key === transition.toKey) return 'underlay';
  }

  if (currentSurface === 'stack' && key === currentKey) return 'active';
  return 'hidden';
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
