import { Outlet, useMatches } from 'react-router';

import AppHeader from '@/components/features/AppHeader';
import TabBar from '@/components/features/AppTabBar';
import { RouteTransition } from '@/components/features/RouteTransition';
import type { RouteTransitionHandle } from '@/components/features/RouteTransition/types';
import { cn } from '@/libs/class-helpers';

type AppHeaderConfig = { title: string; description: string };

type AppRouteHandle = RouteTransitionHandle & {
  header?: AppHeaderConfig;
};

export default function RootLayout() {
  const matches = useMatches();
  const routeHandle = matches
    .toReversed()
    .map((match) => match.handle as AppRouteHandle | undefined)
    .find(Boolean);
  const isStackPage = routeHandle?.transitionSurface === 'stack';
  const header = routeHandle?.header;
  const showPrimaryChrome = !isStackPage && header !== undefined;

  return (
    <RouteTransition>
      <div
        className={cn(
          'route-transition-shell relative min-h-svh w-full',
          showPrimaryChrome
            ? 'bg-[var(--tab-page-background)]'
            : 'bg-[var(--secondary-page-background)]',
        )}
        data-route-surface={isStackPage ? 'stack' : 'tab'}
      >
        {showPrimaryChrome ? (
          <>
            <div className="sticky top-0 z-20" data-primary-chrome="header">
              <AppHeader title={header.title} description={header.description} />
            </div>
            <div aria-hidden className="app-header-lock-spacer" />
          </>
        ) : null}
        <main className="route-transition-page">
          <Outlet />
        </main>
        {showPrimaryChrome ? (
          <div className="app-fixed-frame fixed bottom-0 z-20" data-primary-chrome="tabbar">
            <TabBar />
          </div>
        ) : null}
      </div>
    </RouteTransition>
  );
}
