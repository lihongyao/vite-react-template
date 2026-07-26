export const SUPPORTED_LOCALES = ['en-US', 'zh-CN', 'es', 'pt'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

type LocaleConfig = {
  label: string;
  pathPrefix: string;
};

export const LOCALE_CONFIG = {
  'en-US': {
    label: 'English',
    pathPrefix: '',
  },
  'zh-CN': {
    label: '简体中文',
    pathPrefix: 'zh',
  },
  es: {
    label: 'Español',
    pathPrefix: 'es',
  },
  pt: {
    label: 'Português',
    pathPrefix: 'pt',
  },
} as const satisfies Record<Locale, LocaleConfig>;

export const DEFAULT_LOCALE: Locale = 'en-US';

export function isLocale(value: string): value is Locale {
  return Object.hasOwn(LOCALE_CONFIG, value);
}
