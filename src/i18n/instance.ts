import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './config';
import type { Locale } from './config';
import { DEFAULT_NAMESPACE, resources } from './resources';

const i18n = createInstance();

export async function initializeI18n(initialLocale: Locale = DEFAULT_LOCALE) {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      defaultNS: DEFAULT_NAMESPACE,
      fallbackLng: DEFAULT_LOCALE,
      interpolation: {
        escapeValue: false,
      },
      lng: initialLocale,
      load: 'currentOnly',
      resources,
      returnNull: false,
      supportedLngs: [...SUPPORTED_LOCALES],
    });
  }

  return i18n;
}

export async function activateLocale(locale: Locale) {
  if (i18n.resolvedLanguage !== locale) {
    await i18n.changeLanguage(locale);
  }

  document.documentElement.lang = locale;
  document.documentElement.dir = i18n.dir(locale);
}

export default i18n;
