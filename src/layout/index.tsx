import TabBar from '@/components/features/AppTabBar';
import { TabTransitionOutlet } from '@/components/features/RouteTransition';

export default function RootLayout() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#f9f9f9]">
      <TabTransitionOutlet />
      <TabBar />
    </div>
  );
}
