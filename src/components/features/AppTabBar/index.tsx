import { memo } from 'react';

import Icon, { type IconName } from '@/components/ui/Icon';
import { LocalizedNavLink } from '@/i18n/links';
import { cn } from '@/libs/class-helpers';

const paths: Array<{ path: string; text: string; icon: IconName }> = [
  {
    path: '/',
    text: 'Home',
    icon: 'tabbar_home',
  },
  {
    path: '/goods',
    text: 'Goods',
    icon: 'goods',
  },
  {
    path: '/privilege-brand',
    text: 'Privilege',
    icon: 'tabbar_casino',
  },
  {
    path: '/integral',
    text: 'Integral',
    icon: 'tabbar_sport',
  },
  {
    path: '/profile',
    text: 'Profile',
    icon: 'tabbar_profile',
  },
];
export default memo(function TabBar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="sticky bottom-0 z-20 flex h-[calc(50px+env(safe-area-inset-bottom))] w-full shrink-0 border-t border-[#eee] bg-white pb-[env(safe-area-inset-bottom)]"
    >
      {paths.map(({ icon, path, text }) => (
        <LocalizedNavLink
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#168653] focus-visible:ring-inset ${isActive ? 'text-[#222]' : 'text-[#aaa]'}`
          }
          end
          key={path}
          replace
          to={path}
        >
          {({ isActive }) => (
            <>
              <Icon
                name={icon}
                className={cn('size-[22px]', isActive ? 'text-[#222]' : 'text-[#aaa]')}
              />
              <span className="mt-px text-[10px] leading-[14px]">{text}</span>
            </>
          )}
        </LocalizedNavLink>
      ))}
    </nav>
  );
});
