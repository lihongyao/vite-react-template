import TabBar from '@/components/features/AppTabBar';
import { TabTransitionOutlet } from '@/components/features/RouteTransition';

export default function RootLayout() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#f9f9f9]">
      <TabTransitionOutlet />
      <TabBar />
    </div>
  );
}
