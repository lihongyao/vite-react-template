/* oxlint-disable react/only-export-components -- Localized navigation helpers share one public module. */
import { useCallback } from 'react';

import type { LinkProps, NavLinkProps, NavigateOptions, To } from 'react-router';
import { Link, NavLink, createPath, parsePath, useLocation, useNavigate } from 'react-router';

import { markAppNavigation, readHistoryIndex } from '@/libs/history-navigation';
import { ROUTE_PATHS } from '@/routes/paths';
import type { TabRoutePath } from '@/routes/paths';

import type { Locale } from './config';
import { getLocaleFromPathname, localizePathname } from './routing';

export function localizeTo(to: To, locale: Locale): To {
  const path = typeof to === 'string' ? parsePath(to) : to;

  if (!path.pathname?.startsWith('/')) return to;

  const localizedPath = {
    ...path,
    pathname: localizePathname(path.pathname, locale),
  };

  return typeof to === 'string' ? createPath(localizedPath) : localizedPath;
}

export function useCurrentLocale() {
  const { pathname } = useLocation();
  return getLocaleFromPathname(pathname);
}

export type NavigateToOptions = Omit<NavigateOptions, 'replace'> & { replace?: never };

export type NavigateBackOptions = {
  fallback?: TabRoutePath;
};

export type AppNavigation = {
  navigateBack: (options?: NavigateBackOptions) => Promise<void>;
  navigateTo: (to: To, options?: NavigateToOptions) => Promise<void>;
  switchTab: (to: TabRoutePath) => Promise<void>;
};

export function useAppNavigation(): AppNavigation {
  const locale = useCurrentLocale();
  const location = useLocation();
  const navigate = useNavigate();

  const navigateTo = useCallback<AppNavigation['navigateTo']>(
    async (to, options) => {
      const localizedTo = localizeTo(to, locale);
      await navigate(localizedTo, options);
    },
    [locale, navigate],
  );

  const switchTab = useCallback<AppNavigation['switchTab']>(
    async (to) => {
      const targetPath = localizePathname(to, locale);
      if (location.pathname === targetPath) return;

      markAppNavigation('switch-tab', { pathname: targetPath });
      await navigate(targetPath, { replace: true });
    },
    [locale, location.pathname, navigate],
  );

  const navigateBack = useCallback<AppNavigation['navigateBack']>(
    async ({ fallback = ROUTE_PATHS.Home } = {}) => {
      const currentHistoryIndex = readHistoryIndex();
      if (currentHistoryIndex === null || currentHistoryIndex <= 0) {
        await switchTab(fallback);
        return;
      }

      markAppNavigation('navigate-back', { historyIndex: currentHistoryIndex - 1 });
      await navigate(-1);
    },
    [navigate, switchTab],
  );

  return {
    navigateBack,
    navigateTo,
    switchTab,
  };
}

type SwitchTabLinkProps = Omit<NavLinkProps, 'replace' | 'to'> & { to: TabRoutePath };

export function SwitchTabLink({ onClick, to, ...props }: SwitchTabLinkProps) {
  const locale = useCurrentLocale();
  const { switchTab } = useAppNavigation();

  return (
    <NavLink
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!shouldHandleNavigationClick(event)) return;

        event.preventDefault();
        void switchTab(to);
      }}
      replace
      to={localizeTo(to, locale)}
    />
  );
}

type NavigateToLinkProps = Omit<LinkProps, 'replace'> & { replace?: never };

export function NavigateToLink({ onClick, to, ...props }: NavigateToLinkProps) {
  const locale = useCurrentLocale();

  return <Link {...props} onClick={onClick} to={localizeTo(to, locale)} />;
}

export function useSwitchLocale(to?: To) {
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback(
    (locale: Locale, options?: NavigateOptions) =>
      navigate(
        localizeTo(
          to ??
            ({
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
            } satisfies To),
          locale,
        ),
        options,
      ),
    [location.hash, location.pathname, location.search, navigate, to],
  );
}

function shouldHandleNavigationClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    (!event.currentTarget.target || event.currentTarget.target === '_self')
  );
}
