import { useCallback } from 'react';

import type { NavigateOptions, To } from 'react-router';
import { createPath, parsePath, useLocation, useNavigate } from 'react-router';

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

export function useLocalizedNavigate() {
  const locale = useCurrentLocale();
  const navigate = useNavigate();

  return useCallback(
    (to: To, options?: NavigateOptions) => navigate(localizeTo(to, locale), options),
    [locale, navigate],
  );
}

export function useSwitchLocale() {
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback(
    (locale: Locale, options?: NavigateOptions) =>
      navigate(
        {
          pathname: localizePathname(location.pathname, locale),
          search: location.search,
          hash: location.hash,
        },
        options,
      ),
    [location.hash, location.pathname, location.search, navigate],
  );
}
