/* oxlint-disable react/only-export-components -- Localized navigation helpers share one public module. */
import { addTransitionType, startTransition, useCallback, useLayoutEffect, useRef } from 'react';

import type { LinkProps, NavLinkProps, NavigateOptions, To } from 'react-router';
import { Link, NavLink, createPath, parsePath, useLocation, useNavigate } from 'react-router';

import { recordRouteScrollPosition } from '@/libs/route-scroll-restoration';
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

function useNavigationTargetGuard() {
  const location = useLocation();
  const pendingTargetRef = useRef<string | null>(null);

  // A navigation promise may settle before the next screen commits.
  useLayoutEffect(() => {
    pendingTargetRef.current = null;
  }, [location.key]);

  const start = useCallback((to: To) => {
    const targetKey = createPath(typeof to === 'string' ? parsePath(to) : to);
    if (pendingTargetRef.current === targetKey) return null;

    pendingTargetRef.current = targetKey;
    return targetKey;
  }, []);

  const cancel = useCallback((targetKey: string) => {
    if (pendingTargetRef.current === targetKey) pendingTargetRef.current = null;
  }, []);

  return { cancel, start };
}

export function useAppNavigation(): AppNavigation {
  const locale = useCurrentLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const { cancel: cancelNavigation, start: startNavigation } = useNavigationTargetGuard();

  const navigateTo = useCallback<AppNavigation['navigateTo']>(
    async (to, options) => {
      const localizedTo = localizeTo(to, locale);
      const targetKey = startNavigation(localizedTo);
      if (targetKey === null) return;

      try {
        await navigateWithTransition('route-push', location.key, () =>
          navigate(localizedTo, options),
        );
      } catch (error) {
        cancelNavigation(targetKey);
        throw error;
      }
    },
    [cancelNavigation, locale, location.key, navigate, startNavigation],
  );

  const switchTab = useCallback<AppNavigation['switchTab']>(
    async (to) => {
      const targetPath = localizePathname(to, locale);
      if (location.pathname === targetPath) return;

      await navigateWithTransition('route-tab', location.key, () =>
        navigate(targetPath, { replace: true }),
      );
    },
    [locale, location.key, location.pathname, navigate],
  );

  const navigateBack = useCallback<AppNavigation['navigateBack']>(
    async ({ fallback = ROUTE_PATHS.Home } = {}) => {
      const currentHistoryIndex = readHistoryIndex();
      if (currentHistoryIndex === null || currentHistoryIndex <= 0) {
        await switchTab(fallback);
        return;
      }

      await navigateWithTransition('route-pop', location.key, () => navigate(-1));
    },
    [location.key, navigate, switchTab],
  );

  return {
    navigateBack,
    navigateTo,
    switchTab,
  };
}

type SwitchTabLinkProps = Omit<NavLinkProps, 'replace' | 'to' | 'viewTransition'> & {
  to: TabRoutePath;
};

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

type NavigateToLinkProps = Omit<LinkProps, 'replace' | 'viewTransition'> & { replace?: never };

export function NavigateToLink({ onClick, to, ...props }: NavigateToLinkProps) {
  const locale = useCurrentLocale();
  const { navigateTo } = useAppNavigation();
  const localizedTo = localizeTo(to, locale);

  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (props.reloadDocument || !shouldHandleNavigationClick(event)) return;

        event.preventDefault();
        void navigateTo(to, {
          preventScrollReset: props.preventScrollReset,
          relative: props.relative,
          state: props.state,
        });
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

async function navigateWithTransition(
  type: 'route-pop' | 'route-push' | 'route-tab',
  locationKey: string,
  navigate: () => void | Promise<void>,
) {
  recordRouteScrollPosition(locationKey);
  let navigation = Promise.resolve();
  startTransition(() => {
    addTransitionType(type);
    navigation = Promise.resolve(navigate());
    return navigation;
  });
  await navigation;
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

function readHistoryIndex() {
  const state: unknown = window.history.state;
  return typeof state === 'object' &&
    state !== null &&
    'idx' in state &&
    typeof state.idx === 'number'
    ? state.idx
    : null;
}
