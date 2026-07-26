import type { Locale } from './config';
import { activateLocale } from './instance';

export function createLocaleLoader(locale: Locale) {
  return async () => {
    await activateLocale(locale);
    return null;
  };
}
