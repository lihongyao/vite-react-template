export type RouteTransitionHandle =
  | {
      sceneId: string;
      transitionSurface: 'tab';
    }
  | {
      transitionSurface: 'stack';
    };
