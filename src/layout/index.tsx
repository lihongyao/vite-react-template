import { useRef } from 'react';

import { useMatches } from 'react-router';

import AppHeader from '@/components/features/AppHeader';
import TabBar from '@/components/features/AppTabBar';
import { RouteTransitionOutlet } from '@/components/features/RouteTransition';
import type { RouteTransitionHandle } from '@/components/features/RouteTransition/types';

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
  const tabHeaderRef = useRef<AppHeaderConfig | undefined>(header);

  if (!isStackPage && header) tabHeaderRef.current = header;

  const tabHeader = isStackPage ? tabHeaderRef.current : header;

  return (
    <div className="relative flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-[var(--tab-page-background)]">
      {tabHeader ? (
        <div
          aria-hidden={isStackPage || undefined}
          className="shrink-0"
          data-primary-chrome="header"
          data-route-present={isStackPage ? 'false' : 'true'}
          inert={isStackPage ? true : undefined}
        >
          <AppHeader title={tabHeader.title} description={tabHeader.description} />
        </div>
      ) : null}
      <RouteTransitionOutlet />
      <div
        aria-hidden={isStackPage || undefined}
        className="shrink-0"
        data-primary-chrome="tabbar"
        data-route-present={isStackPage ? 'false' : 'true'}
        inert={isStackPage ? true : undefined}
      >
        <TabBar />
      </div>
    </div>
  );
}
