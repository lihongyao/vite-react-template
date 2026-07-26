import { Outlet } from 'react-router';

import TabBar from '@/components/features/AppTabBar';

export default function RootLayout() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#f9f9f9]">
      <div className="flex min-h-0 flex-1 flex-col [&>*]:flex-1">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
