/* oxlint-disable react/only-export-components -- The route component and loader form one locale boundary. */
import { useEffect } from 'react';

import { Outlet } from 'react-router';

import { RouteTransitionProvider } from '@/components/features/RouteTransition';

import type { Locale } from './config';
import { activateLocale } from './instance';

export default function LocaleLayout({ locale }: { locale: Locale }) {
  useEffect(() => {
    void activateLocale(locale);
  }, [locale]);

  return (
    <RouteTransitionProvider>
      <Outlet />
    </RouteTransitionProvider>
  );
}

export function createLocaleLoader(locale: Locale) {
  return async () => {
    await activateLocale(locale);
    return null;
  };
}
