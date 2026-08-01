import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { Variants } from 'motion/react';
import { AnimatePresence, LazyMotion, m, useIsPresent, useReducedMotion } from 'motion/react';
import {
  NavigationType,
  useLocation,
  useMatches,
  useNavigationType,
  useOutlet,
} from 'react-router';

import { cn } from '@/libs/class-helpers';

import type { RouteTransitionHandle, RouteTransitionSurface } from './types';

type NavigationDirection = -1 | 0 | 1;

type MotionContext = {
  direction: NavigationDirection;
  reducedMotion: boolean;
};

type RouteTransitionContextValue = {
  direction: NavigationDirection;
  fromSurface: RouteTransitionSurface;
  toSurface: RouteTransitionSurface;
};

type CommittedLocation = {
  historyIndex: number | null;
  key: string;
  surface: RouteTransitionSurface;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue>({
  direction: 0,
  fromSurface: 'stack',
  toSurface: 'stack',
});
const stackScrollPositions = new Map<string, number>();
const tabScrollPositions = new Map<string, number>();

const loadMotionFeatures = () => import('./motion-features').then((module) => module.default);

const stackTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const;

const reducedMotionTransition = { duration: 0.01 } as const;

// Stack scenes keep the background page mounted while the foreground scene transitions.
const stackVariants = {
  initial: ({ direction, reducedMotion }: MotionContext) => ({
    opacity: reducedMotion || direction === 0 ? 0 : 1,
    x: reducedMotion || direction <= 0 ? 0 : '100%',
    transition: reducedMotion ? reducedMotionTransition : stackTransition,
  }),
  animate: ({ reducedMotion }: MotionContext) => ({
    opacity: 1,
    x: 0,
    transition: reducedMotion ? reducedMotionTransition : stackTransition,
  }),
  exit: ({ direction, reducedMotion }: MotionContext) => ({
    opacity: reducedMotion || direction === 0 ? 0 : direction > 0 ? 0.999 : 1,
    x: reducedMotion || direction >= 0 ? 0 : '100%',
    transition: reducedMotion ? reducedMotionTransition : stackTransition,
  }),
} satisfies Variants;

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
    direction: 0,
    fromSurface: surface,
    toSurface: surface,
  });
  const committedLocation = committedLocationRef.current;

  const transition =
    committedLocation.key === location.key
      ? lastTransitionRef.current
      : {
          direction: getNavigationDirection(
            navigationType,
            committedLocation.historyIndex,
            currentHistoryIndex,
          ),
          fromSurface: committedLocation.surface,
          toSurface: surface,
        };
  const { direction, fromSurface, toSurface } = transition;

  useLayoutEffect(() => {
    committedLocationRef.current = {
      historyIndex: currentHistoryIndex,
      key: location.key,
      surface,
    };
    lastTransitionRef.current = { direction, fromSurface, toSurface };
  }, [currentHistoryIndex, direction, fromSurface, location.key, surface, toSurface]);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <RouteTransitionContext.Provider value={transition}>
        {children}
      </RouteTransitionContext.Provider>
    </LazyMotion>
  );
}

export function RouteTransitionOutlet() {
  const transition = useContext(RouteTransitionContext);
  const { direction } = transition;
  const location = useLocation();
  const outlet = useOutlet();
  const reducedMotion = Boolean(useReducedMotion());
  const surface = useRouteTransitionSurface();
  const tabOutletsRef = useRef(new Map<string, ReactNode>());
  const activeTabPathRef = useRef(location.pathname);
  const activeTabPath = surface === 'tab' ? location.pathname : activeTabPathRef.current;
  const motionContext = {
    direction: 0,
    reducedMotion,
  } satisfies MotionContext;
  if (surface === 'tab') {
    tabOutletsRef.current.set(activeTabPath, outlet);
    activeTabPathRef.current = activeTabPath;
  }

  const stackMotionContext = { direction, reducedMotion } satisfies MotionContext;

  return (
    <>
      <div
        className="grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden"
        data-route-transition="tab"
      >
        {Array.from(tabOutletsRef.current, ([path, cachedOutlet]) => (
          <TabScene
            key={path}
            active={path === activeTabPath}
            motionContext={motionContext}
            resetScrollOnActivate={
              path === activeTabPath &&
              transition.fromSurface === 'tab' &&
              transition.toSurface === 'tab'
            }
            scrollKey={path}
          >
            {cachedOutlet}
          </TabScene>
        ))}
      </div>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-20 grid grid-cols-1 overflow-hidden',
          surface === 'stack' ? 'bg-[#f9f9f9]' : 'bg-transparent',
        )}
        data-route-transition="stack"
      >
        <AnimatePresence custom={stackMotionContext} initial={false} mode="sync">
          {surface === 'stack' ? (
            <StackScene
              key={location.key}
              motionContext={stackMotionContext}
              scrollKey={location.key}
              surface={surface}
            >
              {outlet}
            </StackScene>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}

function StackScene({
  children,
  motionContext,
  scrollKey,
  surface,
}: {
  children: ReactNode;
  motionContext: MotionContext;
  scrollKey: string;
  surface: RouteTransitionSurface;
}) {
  const isPresent = useIsPresent();
  const { direction } = useContext(RouteTransitionContext);
  const sceneRef = useRef<HTMLDivElement>(null);
  const zIndex = isPresent ? (direction >= 0 ? 2 : 0) : direction < 0 ? 2 : 0;

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    // Each stack scene needs its own viewport so a foreground page cannot move its background.
    scene.scrollTop = stackScrollPositions.get(scrollKey) ?? 0;

    return () => {
      stackScrollPositions.set(scrollKey, scene.scrollTop);
    };
  }, [scrollKey]);

  return (
    <m.div
      animate="animate"
      aria-hidden={isPresent ? undefined : true}
      className={cn(
        'scrollbar-hidden relative col-start-1 row-start-1 h-dvh min-w-0 overflow-y-auto overscroll-y-contain bg-[#f9f9f9]',
        isPresent ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      custom={motionContext}
      data-route-direction={getDirectionLabel(direction)}
      data-route-present={isPresent ? 'true' : 'false'}
      data-route-surface={surface}
      exit="exit"
      inert={isPresent ? undefined : true}
      initial="initial"
      ref={sceneRef}
      style={{
        boxShadow: direction === 0 ? undefined : '-12px 0 28px rgb(0 0 0 / 12%)',
        zIndex,
      }}
      variants={stackVariants}
    >
      {children}
    </m.div>
  );
}

function TabScene({
  active,
  children,
  motionContext,
  resetScrollOnActivate,
  scrollKey,
}: {
  active: boolean;
  children: ReactNode;
  motionContext: MotionContext;
  resetScrollOnActivate: boolean;
  scrollKey: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [animatedActive, setAnimatedActive] = useState(false);

  useLayoutEffect(() => {
    if (!active) {
      setAnimatedActive(false);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setAnimatedActive(true));
    return () => cancelAnimationFrame(frame);
  }, [active]);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    // Initialize a tab scene only once for its key. The tab shell can be
    // re-rendered while a stack transition is in flight; resetting here based
    // on that transient state would wipe the tab's saved scroll position.
    scene.scrollTop = resetScrollOnActivate ? 0 : (tabScrollPositions.get(scrollKey) ?? 0);

    return () => {
      tabScrollPositions.set(scrollKey, scene.scrollTop);
    };
  }, [resetScrollOnActivate, scrollKey]);

  return (
    <m.div
      aria-hidden={active ? undefined : true}
      className={cn(
        'scrollbar-hidden col-start-1 row-start-1 flex min-h-0 min-w-0 flex-col overflow-y-auto overscroll-y-contain [&>*]:flex-1',
        !active && 'pointer-events-none',
      )}
      data-route-present={active ? 'true' : 'false'}
      inert={active ? undefined : true}
      initial={false}
      onScroll={(event) => {
        tabScrollPositions.set(scrollKey, event.currentTarget.scrollTop);
      }}
      ref={sceneRef}
      style={{
        opacity: animatedActive ? 1 : 0,
        transform: animatedActive ? 'scale(1)' : active ? 'scale(0.96)' : 'scale(0.985)',
        transformOrigin: '50% 50%',
        transition: motionContext.reducedMotion
          ? 'none'
          : active
            ? 'opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms cubic-bezier(0.22, 1, 0.36, 1)'
            : 'opacity 120ms cubic-bezier(0.4, 0, 1, 1), transform 120ms cubic-bezier(0.4, 0, 1, 1)',
        zIndex: active ? 1 : 0,
      }}
    >
      {children}
    </m.div>
  );
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

function getDirectionLabel(direction: NavigationDirection) {
  if (direction > 0) return 'forward';
  if (direction < 0) return 'back';
  return 'none';
}
