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
