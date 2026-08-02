import { useLocation } from 'react-router';

import AppHeader from '@/components/features/AppHeader';
import TabBar from '@/components/features/AppTabBar';
import { RouteTransitionOutlet } from '@/components/features/RouteTransition';

const tabHeaders: Record<string, { title: string; description: string }> = {
  '/': { title: 'Agent Center', description: 'Your monthly commission and referral data' },
  '/goods': { title: 'Goods', description: 'Discover products worth adding to your list' },
  '/privilege-brand': {
    title: 'Agent Center',
    description: 'Your monthly commission and referral data',
  },
  '/integral': { title: 'Agent Center', description: 'Your monthly commission and referral data' },
  '/menu': { title: 'Menu', description: 'Explore services and account options' },
};

export default function RootLayout() {
  const { pathname } = useLocation();
  const header = tabHeaders[pathname] ?? tabHeaders['/'];
  const isStackPage =
    pathname.endsWith('/profile') ||
    pathname.endsWith('/apply') ||
    /\/goods\/[^/]+$/.test(pathname);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[var(--tab-page-background)]">
      {!isStackPage ? <AppHeader title={header.title} description={header.description} /> : null}
      <RouteTransitionOutlet />
      {!isStackPage ? <TabBar /> : null}
    </div>
  );
}
