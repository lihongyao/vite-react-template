import { memo } from 'react';

import GoodsIcon from '@/assets/icon/goods.svg?react';
import CasinoIcon from '@/assets/icon/tabbar_casino.svg?react';
import HomeIcon from '@/assets/icon/tabbar_home.svg?react';
import ProfileIcon from '@/assets/icon/tabbar_profile.svg?react';
import SportIcon from '@/assets/icon/tabbar_sport.svg?react';
import { LocalizedNavLink } from '@/i18n/links';
import { cn } from '@/libs/class-helpers';

const paths = [
  {
    path: '/',
    text: 'Home',
    icon: HomeIcon,
  },
  {
    path: '/goods',
    text: 'Goods',
    icon: GoodsIcon,
  },
  {
    path: '/privilege-brand',
    text: 'Privilege',
    icon: CasinoIcon,
  },
  {
    path: '/integral',
    text: 'Integral',
    icon: SportIcon,
  },
  {
    path: '/profile',
    text: 'Profile',
    icon: ProfileIcon,
  },
];
export default memo(function TabBar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="sticky bottom-0 z-20 flex h-[calc(50px+env(safe-area-inset-bottom))] w-full shrink-0 border-t border-[#eee] bg-white pb-[env(safe-area-inset-bottom)]"
    >
      {paths.map(({ icon: Icon, path, text }) => (
        <LocalizedNavLink
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center ${isActive ? 'text-[#222]' : 'text-[#aaa]'}`
          }
          end
          key={path}
          replace
          to={path}
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('size-[22px]', isActive ? 'text-[#222]' : 'text-[#aaa]')} />
              <span className="mt-px text-[10px] leading-[14px]">{text}</span>
            </>
          )}
        </LocalizedNavLink>
      ))}
    </nav>
  );
});
