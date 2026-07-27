import { createContext, useContext, useLayoutEffect, useRef } from 'react';
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

type CommittedLocation = {
  historyIndex: number | null;
  key: string;
};

const RouteTransitionContext = createContext<NavigationDirection>(0);
const routeScrollPositions = new Map<string, number>();

const loadMotionFeatures = () => import('./motion-features').then((module) => module.default);

const stackTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const;

const tabEnterTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
} as const;

const tabExitTransition = {
  duration: 0.12,
  ease: [0.4, 0, 1, 1],
} as const;

const reducedMotionTransition = { duration: 0.01 } as const;

// Keep the background scene mounted for the full forward transition without visibly moving it.
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

const tabVariants = {
  initial: ({ reducedMotion }: MotionContext) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.96,
    transition: reducedMotion ? reducedMotionTransition : tabEnterTransition,
  }),
  animate: ({ reducedMotion }: MotionContext) => ({
    opacity: 1,
    scale: 1,
    transition: reducedMotion ? reducedMotionTransition : tabEnterTransition,
  }),
  exit: ({ reducedMotion }: MotionContext) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.985,
    transition: reducedMotion ? reducedMotionTransition : tabExitTransition,
  }),
} satisfies Variants;

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const currentHistoryIndex = readHistoryIndex();
  const committedLocationRef = useRef<CommittedLocation>({
    historyIndex: currentHistoryIndex,
    key: location.key,
  });
  const lastDirectionRef = useRef<NavigationDirection>(0);
  const committedLocation = committedLocationRef.current;

  const direction =
    committedLocation.key === location.key
      ? lastDirectionRef.current
      : getNavigationDirection(navigationType, committedLocation.historyIndex, currentHistoryIndex);

  useLayoutEffect(() => {
    committedLocationRef.current = {
      historyIndex: currentHistoryIndex,
      key: location.key,
    };
    lastDirectionRef.current = direction;
  }, [currentHistoryIndex, direction, location.key]);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <RouteTransitionContext.Provider value={direction}>
        {children}
      </RouteTransitionContext.Provider>
    </LazyMotion>
  );
}

export function StackTransitionOutlet() {
  const direction = useContext(RouteTransitionContext);
  const location = useLocation();
  const outlet = useOutlet();
  const reducedMotion = Boolean(useReducedMotion());
  const surface = useRouteTransitionSurface();
  const sceneKey = surface === 'tab' ? 'tab-shell' : location.key;
  const motionContext = { direction, reducedMotion } satisfies MotionContext;

  return (
    <div
      className="grid h-dvh w-full grid-cols-1 overflow-hidden bg-[#f9f9f9]"
      data-route-transition="stack"
    >
      <AnimatePresence custom={motionContext} initial={false} mode="sync">
        <StackScene
          key={sceneKey}
          motionContext={motionContext}
          scrollKey={location.pathname}
          surface={surface}
        >
          {outlet}
        </StackScene>
      </AnimatePresence>
    </div>
  );
}

export function TabTransitionOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const reducedMotion = Boolean(useReducedMotion());
  const surface = useRouteTransitionSurface();
  // Exiting tab shells still observe the new stack URL, so retain their last tab identity.
  const activeTabPathRef = useRef(location.pathname);
  const sceneKey = surface === 'tab' ? location.pathname : activeTabPathRef.current;
  const motionContext = {
    direction: 0,
    reducedMotion,
  } satisfies MotionContext;

  useLayoutEffect(() => {
    if (surface === 'tab') activeTabPathRef.current = location.pathname;
  }, [location.pathname, surface]);

  return (
    <div
      className="grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-x-clip"
      data-route-transition="tab"
    >
      <AnimatePresence custom={motionContext} initial={false} mode="sync">
        <TabScene key={sceneKey} motionContext={motionContext}>
          {outlet}
        </TabScene>
      </AnimatePresence>
    </div>
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
  const direction = useContext(RouteTransitionContext);
  const sceneRef = useRef<HTMLDivElement>(null);
  const zIndex = isPresent ? (direction >= 0 ? 2 : 0) : direction < 0 ? 2 : 0;

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    // Each stack scene needs its own viewport so a foreground page cannot move its background.
    scene.scrollTop = routeScrollPositions.get(scrollKey) ?? 0;

    return () => {
      routeScrollPositions.set(scrollKey, scene.scrollTop);
    };
  }, [scrollKey]);

  return (
    <m.div
      animate="animate"
      aria-hidden={isPresent ? undefined : true}
      className={cn(
        'relative col-start-1 row-start-1 h-dvh min-w-0 overflow-y-auto overscroll-y-contain bg-[#f9f9f9]',
        !isPresent && 'pointer-events-none',
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
  children,
  motionContext,
}: {
  children: ReactNode;
  motionContext: MotionContext;
}) {
  const isPresent = useIsPresent();

  return (
    <m.div
      animate="animate"
      aria-hidden={isPresent ? undefined : true}
      className={cn(
        'col-start-1 row-start-1 flex min-h-0 min-w-0 flex-col [&>*]:flex-1',
        !isPresent && 'pointer-events-none',
      )}
      custom={motionContext}
      data-route-present={isPresent ? 'true' : 'false'}
      exit="exit"
      inert={isPresent ? undefined : true}
      initial="initial"
      style={{ transformOrigin: '50% 50%', zIndex: isPresent ? 1 : 0 }}
      variants={tabVariants}
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
