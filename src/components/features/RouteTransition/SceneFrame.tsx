import { useLayoutEffect, useRef } from 'react';
import type { AnimationEvent, ReactNode } from 'react';

import { cn } from '@/libs/class-helpers';

import { RouteScenePresentContext } from './route-scene-context';
import type { StackSceneMode } from './transition-state';

export function TabSceneFrame({
  animate,
  children,
  onTransitionEnd,
  pathname,
  present,
  sceneId,
  transitionToken,
}: {
  animate: boolean;
  children: ReactNode;
  onTransitionEnd: (token: number) => void;
  pathname: string;
  present: boolean;
  sceneId: string;
  transitionToken: number;
}) {
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target || !animate) return;
    onTransitionEnd(transitionToken);
  };

  return (
    <div
      aria-hidden={present ? undefined : true}
      className={cn('route-tab-scene', animate && 'route-tab-enter')}
      data-route-path={pathname}
      data-route-present={present ? 'true' : 'false'}
      data-route-scene-key={sceneId}
      data-route-surface="tab"
      inert={present ? undefined : true}
      onAnimationEnd={handleAnimationEnd}
    >
      <RouteScenePresentContext.Provider value={present}>
        {children}
      </RouteScenePresentContext.Provider>
    </div>
  );
}

export function StackSceneFrame({
  children,
  frozenScrollTop,
  mode,
  onTransitionEnd,
  pathname,
  sceneKey,
  transitionToken,
}: {
  children: ReactNode;
  frozenScrollTop: number;
  mode: StackSceneMode;
  onTransitionEnd: (token: number) => void;
  pathname: string;
  sceneKey: string;
  transitionToken: number;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const fixed = mode === 'enter' || mode === 'exit';
  const present = mode === 'active' || mode === 'enter';

  useLayoutEffect(() => {
    if (fixed && sceneRef.current) sceneRef.current.scrollTop = frozenScrollTop;
  }, [fixed, frozenScrollTop]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target || !fixed) return;
    onTransitionEnd(transitionToken);
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
