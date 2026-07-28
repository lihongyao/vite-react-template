export const SUPPORTED_LOCALES = ['en-US', 'zh-CN', 'es', 'pt'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

type LocaleConfig = {
  label: string;
  pathPrefix: string;
  apiLang: number;
};

export const LOCALE_CONFIG = {
  'en-US': {
    label: 'English',
    pathPrefix: '',
    apiLang: 1,
  },
  'zh-CN': {
    label: '简体中文',
    pathPrefix: 'zh',
    apiLang: 4,
  },
  es: {
    label: 'Español',
    pathPrefix: 'es',
    apiLang: 12,
  },
  pt: {
    label: 'Português',
    pathPrefix: 'pt',
    apiLang: 11,
  },
} as const satisfies Record<Locale, LocaleConfig>;

export const DEFAULT_LOCALE: Locale = 'en-US';

export function isLocale(value: string): value is Locale {
  return Object.hasOwn(LOCALE_CONFIG, value);
}
