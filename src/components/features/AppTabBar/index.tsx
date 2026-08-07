import { memo } from 'react';

import { useLocation } from 'react-router';

import { useTabRouteTransition } from '@/components/features/RouteTransition/tab-transition-context';
import Icon, { type IconName } from '@/components/ui/Icon';
import { LocalizedNavLink, useCurrentLocale } from '@/i18n/navigation';
import { localizePathname } from '@/i18n/routing';
import { cn } from '@/libs/class-helpers';
import { ROUTE_PATHS, type TabRoutePath } from '@/routes/paths';

const tabs = [
  {
    path: ROUTE_PATHS.Home,
    text: 'Home',
    icon: 'tabbar_home',
  },
  {
    path: ROUTE_PATHS.Goods,
    text: 'Goods',
    icon: 'goods',
  },
  {
    path: ROUTE_PATHS.PrivilegeBrand,
    text: 'Privilege',
    icon: 'tabbar_casino',
  },
  {
    path: ROUTE_PATHS.Integral,
    text: 'Integral',
    icon: 'tabbar_sport',
  },
  {
    path: ROUTE_PATHS.Menu,
    text: 'Menu',
    icon: 'tabbar_menu',
  },
] satisfies Array<{ path: TabRoutePath; text: string; icon: IconName }>;

export default memo(function TabBar() {
  const locale = useCurrentLocale();
  const location = useLocation();
  const { beginTabTransition } = useTabRouteTransition();

  return (
    <nav
      aria-label="Primary navigation"
      className="relative z-20 flex h-[var(--app-tabbar-height)] w-full shrink-0 border-t border-[#eee] bg-white pb-[env(safe-area-inset-bottom)]"
    >
      {tabs.map(({ icon, path, text }) => (
        <LocalizedNavLink
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#168653] focus-visible:ring-inset ${isActive ? 'text-[#222]' : 'text-[#aaa]'}`
          }
          end
          key={path}
          onClick={(event) => {
            if (
              event.defaultPrevented ||
              event.button !== 0 ||
              event.metaKey ||
              event.altKey ||
              event.ctrlKey ||
              event.shiftKey
            ) {
              return;
            }

            const targetPath = localizePathname(path, locale);
            if (location.pathname === targetPath) {
              event.preventDefault();
              return;
            }

            beginTabTransition(location.pathname, targetPath);
          }}
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
