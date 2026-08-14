import type { RouteNavigationIntent, RouteNavigationType, RouteTransitionSurface } from './types';

export type CachedRouteScene<TNode> = {
  historyIndex: number | null;
  key: string;
  node: TNode;
  pathname: string;
};

export type RouteSceneCache<TNode> = {
  activeTabId: string | null;
  stackScenes: CachedRouteScene<TNode>[];
  tabScenes: CachedRouteScene<TNode>[];
};

export type CurrentRouteScene<TNode> = CachedRouteScene<TNode> & {
  surface: RouteTransitionSurface;
};

export type ReconcileRouteSceneCacheInput<TNode> = {
  current: CurrentRouteScene<TNode>;
  fromSurface: RouteTransitionSurface;
  navigationIntent: RouteNavigationIntent | null;
  navigationType: RouteNavigationType;
};

export function createRouteSceneCache<TNode>(): RouteSceneCache<TNode> {
  return {
    activeTabId: null,
    stackScenes: [],
    tabScenes: [],
  };
}

export function reconcileRouteSceneCache<TNode>(
  cache: RouteSceneCache<TNode>,
  input: ReconcileRouteSceneCacheInput<TNode>,
): RouteSceneCache<TNode> {
  const { current } = input;

  if (current.surface === 'tab') {
    return {
      activeTabId: current.key,
      stackScenes:
        input.fromSurface === 'stack' && input.navigationIntent === 'switch-tab'
          ? []
          : cache.stackScenes,
      tabScenes: upsertScene(cache.tabScenes, current),
    };
  }

  const sceneExists = cache.stackScenes.some((scene) => scene.key === current.key);
  const currentHistoryIndex = current.historyIndex;
  const stackScenes =
    !sceneExists && input.navigationType === 'PUSH' && currentHistoryIndex !== null
      ? cache.stackScenes.filter(
          (scene) => scene.historyIndex === null || scene.historyIndex < currentHistoryIndex,
        )
      : cache.stackScenes;

  return {
    activeTabId: cache.activeTabId,
    stackScenes: upsertScene(stackScenes, current),
    tabScenes: cache.tabScenes,
  };
}

function upsertScene<TNode>(scenes: CachedRouteScene<TNode>[], current: CachedRouteScene<TNode>) {
  const index = scenes.findIndex((scene) => scene.key === current.key);
  if (index === -1) return [...scenes, current];

  const nextScenes = scenes.slice();
  nextScenes[index] = current;
  return nextScenes;
}
