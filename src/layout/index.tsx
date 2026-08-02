import { useMatches } from 'react-router';

import AppHeader from '@/components/features/AppHeader';
import TabBar from '@/components/features/AppTabBar';
import { RouteTransitionOutlet } from '@/components/features/RouteTransition';
import type { RouteTransitionHandle } from '@/components/features/RouteTransition/types';

type AppRouteHandle = RouteTransitionHandle & {
  header?: { title: string; description: string };
};

export default function RootLayout() {
  const matches = useMatches();
  const routeHandle = matches
    .toReversed()
    .map((match) => match.handle as AppRouteHandle | undefined)
    .find(Boolean);
  const isStackPage = routeHandle?.transitionSurface === 'stack';
  const header = routeHandle?.header;

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-clip bg-[var(--tab-page-background)]">
      {!isStackPage && header ? (
        <AppHeader title={header.title} description={header.description} />
      ) : null}
      <RouteTransitionOutlet />
      {!isStackPage ? <TabBar /> : null}
    </div>
  );
}
