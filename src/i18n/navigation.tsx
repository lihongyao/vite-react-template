/* oxlint-disable react/only-export-components -- Localized navigation helpers share one public module. */
import { useCallback } from 'react';

import type { LinkProps, NavLinkProps, NavigateOptions, To } from 'react-router';
import {
  Link,
  NavLink,
  createPath,
  parsePath,
  useLocation,
  useMatches,
  useNavigate,
} from 'react-router';

import { useTabRouteTransition } from '@/components/features/RouteTransition/tab-transition-context';
import type { RouteTransitionHandle } from '@/components/features/RouteTransition/types';
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
  const matches = useMatches();
  const navigate = useNavigate();
  const { beginTabTransition, tabHistoryIndex } = useTabRouteTransition();
  const surface = getRouteTransitionSurface(matches.map((match) => match.handle));

  const navigateTo = useCallback<AppNavigation['navigateTo']>(
    async (to, options) => {
      const localizedTo = localizeTo(to, locale);
      markAppNavigation('navigate-to', { pathname: getAbsolutePathname(localizedTo) });
      await navigate(localizedTo, options);
    },
    [locale, navigate],
  );

  const switchTab = useCallback<AppNavigation['switchTab']>(
    async (to) => {
      const targetPath = localizePathname(to, locale);
      if (surface === 'tab' && location.pathname === targetPath) return;

      const currentHistoryIndex = readHistoryIndex();
      const canCollapseStack =
        surface === 'stack' &&
        currentHistoryIndex !== null &&
        tabHistoryIndex !== null &&
        currentHistoryIndex > tabHistoryIndex;

      if (canCollapseStack) {
        markAppNavigation('reset-stack', { historyIndex: tabHistoryIndex });
        await navigate(tabHistoryIndex - currentHistoryIndex);

        markAppNavigation('switch-tab', { pathname: targetPath });
        await navigate(targetPath, { replace: true });

        // A same-URL round trip truncates the discarded Stack entries from the forward branch.
        markAppNavigation('reset-stack', { pathname: targetPath });
        await navigate(targetPath);
        markAppNavigation('reset-stack', { historyIndex: tabHistoryIndex });
        await navigate(-1);
        return;
      }

      if (surface === 'tab') beginTabTransition(location.pathname, targetPath);
      markAppNavigation('switch-tab', { pathname: targetPath });
      await navigate(targetPath, { replace: true });
    },
    [beginTabTransition, locale, location.pathname, navigate, surface, tabHistoryIndex],
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
  const localizedTo = localizeTo(to, locale);

  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!shouldHandleNavigationClick(event)) return;

        markAppNavigation('navigate-to', { pathname: getAbsolutePathname(localizedTo) });
      }}
      to={localizedTo}
    />
  );
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

function getAbsolutePathname(to: To) {
  const path = typeof to === 'string' ? parsePath(to) : to;
  return path.pathname?.startsWith('/') ? path.pathname : undefined;
}

function getRouteTransitionSurface(handles: unknown[]) {
  for (const handle of handles.toReversed()) {
    if (isRouteTransitionHandle(handle)) return handle.transitionSurface;
  }

  return 'stack';
}

function isRouteTransitionHandle(value: unknown): value is RouteTransitionHandle {
  if (typeof value !== 'object' || value === null || !('transitionSurface' in value)) {
    return false;
  }

  return value.transitionSurface === 'stack' || value.transitionSurface === 'tab';
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
