import { Activity, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useLocation, useOutlet } from 'react-router';

import { cn } from '@/libs/class-helpers';

import { StackSceneFrame, TabSceneFrame } from './SceneFrame';
import { useRouteNavigationSnapshot } from './navigation-snapshot';
import { useRouteTransitionMetadata } from './route-metadata';
import { createRouteSceneCache, reconcileRouteSceneCache } from './scene-cache';
import { useRouteScrollRestoration } from './scroll-restoration';
import { getRouteTransitionKind, getStackSceneMode, getTabActivityMode } from './transition-state';

import './route-transition.css';

const TRANSITION_FALLBACK_MS = 600;

export function RouteTransitionOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const metadata = useRouteTransitionMetadata();
  const { currentHistoryIndex, transition } = useRouteNavigationSnapshot(metadata);
  const currentSceneId = metadata.sceneId ?? location.key;
  const sceneCacheRef = useRef(createRouteSceneCache<ReactNode>());
  const sceneCache = reconcileRouteSceneCache(sceneCacheRef.current, {
    current: {
      historyIndex: currentHistoryIndex,
      key: currentSceneId,
      node: outlet,
      pathname: location.pathname,
      surface: metadata.surface,
    },
    fromSurface: transition.fromSurface,
    navigationIntent: transition.navigationIntent,
    navigationType: transition.navigationType,
  });
  const [settledTransitionToken, setSettledTransitionToken] = useState(0);
  const transitionKind = getRouteTransitionKind(transition, settledTransitionToken);
  const stackSceneKeys = sceneCache.stackScenes.map((scene) => scene.key);

  useLayoutEffect(() => {
    sceneCacheRef.current = sceneCache;
  }, [sceneCache]);

  useEffect(() => {
    if (transitionKind === 'idle') return undefined;

    const fallbackTimer = window.setTimeout(() => {
      setSettledTransitionToken((current) => Math.max(current, transition.token));
    }, TRANSITION_FALLBACK_MS);

    return () => window.clearTimeout(fallbackTimer);
  }, [transition.token, transitionKind]);

  useRouteScrollRestoration({
    currentKey: location.key,
    currentSceneId: metadata.sceneId,
    currentSurface: metadata.surface,
    stackSceneKeys,
    transition,
    transitionKind,
  });

  const completeTransition = (token: number) => {
    setSettledTransitionToken((current) => Math.max(current, token));
  };
  const tabHostUnderlay = transitionKind === 'pushing' && transition.fromSurface === 'tab';
  const tabHostVisible = metadata.surface === 'tab' || tabHostUnderlay;

  return (
    <>
      <div
        aria-hidden={tabHostVisible ? undefined : true}
        className={cn(
          'route-tab-host',
          tabHostUnderlay && 'route-tab-host-underlay',
          !tabHostVisible && 'route-scene-hidden',
        )}
        data-route-transition="tab"
        data-tab-cache-size={sceneCache.tabScenes.length}
        inert={tabHostVisible ? undefined : true}
        style={
          tabHostUnderlay
            ? { transform: `translate3d(0, -${transition.fromScrollY}px, 0)` }
            : undefined
        }
      >
        {sceneCache.tabScenes.map((scene) => {
          const activityMode = getTabActivityMode({
            activeTabId: sceneCache.activeTabId,
            currentSurface: metadata.surface,
            sceneId: scene.key,
            transition,
            transitionKind,
          });
          const animate = transitionKind === 'switching-tab' && scene.key === transition.toSceneId;
          const present =
            activityMode === 'visible' &&
            metadata.surface === 'tab' &&
            transitionKind !== 'popping';

          return (
            <Activity key={scene.key} mode={activityMode} name={`route-tab:${scene.key}`}>
              <TabSceneFrame
                animate={animate}
                onTransitionEnd={completeTransition}
                pathname={scene.pathname}
                present={present}
                sceneId={scene.key}
                transitionToken={transition.token}
              >
                {scene.node}
              </TabSceneFrame>
            </Activity>
          );
        })}
      </div>

      <div
        data-route-transition="stack"
        data-route-transition-kind={transitionKind}
        data-stack-cache-size={sceneCache.stackScenes.length}
      >
        {sceneCache.stackScenes.map((scene) => {
          const mode = getStackSceneMode({
            currentKey: location.key,
            currentSurface: metadata.surface,
            sceneKey: scene.key,
            transition,
            transitionKind,
          });

          return (
            <Activity
              key={scene.key}
              mode={mode === 'hidden' ? 'hidden' : 'visible'}
              name={`route-stack:${scene.key}`}
            >
              <StackSceneFrame
                frozenScrollTop={mode === 'exit' ? transition.fromScrollY : 0}
                mode={mode}
                onTransitionEnd={completeTransition}
                pathname={scene.pathname}
                sceneKey={scene.key}
                transitionToken={transition.token}
              >
                {scene.node}
              </StackSceneFrame>
            </Activity>
          );
        })}
      </div>
    </>
  );
}
