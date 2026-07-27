import { useEffect } from 'react';

import {
  RouteTransitionProvider,
  StackTransitionOutlet,
} from '@/components/features/RouteTransition';

import type { Locale } from './config';
import { activateLocale } from './instance';

export default function LocaleLayout({ locale }: { locale: Locale }) {
  useEffect(() => {
    void activateLocale(locale);
  }, [locale]);

  return (
    <RouteTransitionProvider>
      <StackTransitionOutlet />
    </RouteTransitionProvider>
  );
}
