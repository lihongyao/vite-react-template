import type { AppNavigationIntent } from '@/libs/history-navigation';

export type RouteTransitionSurface = 'stack' | 'tab';

export type RouteNavigationIntent = AppNavigationIntent;
export type RouteNavigationDirection = -1 | 0 | 1;
export type RouteNavigationType = 'POP' | 'PUSH' | 'REPLACE';

export type RouteTransitionHandle =
  | {
      sceneId: string;
      transitionSurface: 'tab';
    }
  | {
      transitionSurface: 'stack';
    };

export type RouteTransitionMetadata = {
  sceneId: string | null;
  surface: RouteTransitionSurface;
};

export type RouteTransitionSnapshot = {
  browserHistoryTraversal: boolean;
  direction: RouteNavigationDirection;
  fromKey: string;
  fromPathname: string;
  fromSceneId: string | null;
  fromScrollY: number;
  fromSurface: RouteTransitionSurface;
  navigationIntent: RouteNavigationIntent | null;
  navigationIntentId: number | null;
  navigationType: RouteNavigationType;
  toKey: string;
  toSceneId: string | null;
  toSurface: RouteTransitionSurface;
  token: number;
};
