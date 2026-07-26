import { DEFAULT_LOCALE, LOCALE_CONFIG, SUPPORTED_LOCALES } from './config';
import type { Locale } from './config';

const PREFIX_TO_LOCALE: ReadonlyMap<string, Locale> = new Map(
  SUPPORTED_LOCALES.flatMap((locale) => {
    const prefix = LOCALE_CONFIG[locale].pathPrefix;
    return prefix ? [[prefix, locale] as const] : [];
  }),
);

function normalizePathname(pathname: string) {
  if (!pathname) return '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function getLocaleFromPathname(pathname: string): Locale {
  const firstSegment = normalizePathname(pathname).split('/')[1];
  return PREFIX_TO_LOCALE.get(firstSegment) ?? DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);
  const firstSegment = normalizedPathname.split('/')[1];

  if (!PREFIX_TO_LOCALE.has(firstSegment)) return normalizedPathname;

  const pathnameWithoutLocale = normalizedPathname.slice(firstSegment.length + 1);
  return pathnameWithoutLocale || '/';
}

export function localizePathname(pathname: string, locale: Locale) {
  const businessPathname = stripLocalePrefix(pathname);
  const prefix = LOCALE_CONFIG[locale].pathPrefix;

  if (!prefix) return businessPathname;
  if (businessPathname === '/') return `/${prefix}`;
  return `/${prefix}${businessPathname}`;
}
