import { type PropsWithChildren, ViewTransition } from 'react';

import { useRouteScrollRestoration } from '@/libs/route-scroll-restoration';

import './route-transition.css';

const routeTransitionClasses = {
  default: 'none',
  'route-tab': 'route-tab-transition',
  'route-push': 'route-push-transition',
  'route-pop': 'route-pop-transition',
} as const;

export function RouteTransition({ children }: PropsWithChildren) {
  useRouteScrollRestoration();

  return (
    <ViewTransition
      default="none"
      enter={routeTransitionClasses}
      exit={routeTransitionClasses}
      name="route-content"
      update={routeTransitionClasses}
    >
      {children}
    </ViewTransition>
  );
}
