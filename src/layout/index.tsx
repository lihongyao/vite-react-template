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
  '/profile': { title: 'Profile', description: 'Account and activity overview' },
};

export default function RootLayout() {
  const { pathname } = useLocation();
  const header = tabHeaders[pathname] ?? tabHeaders['/'];

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[var(--tab-page-background)]">
      <AppHeader title={header.title} description={header.description} />
      <RouteTransitionOutlet />
      <TabBar />
    </div>
  );
}
