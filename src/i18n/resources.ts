import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import zh from './locales/zh.json';

export const DEFAULT_NAMESPACE = 'translation';

export const resources = {
  en: { [DEFAULT_NAMESPACE]: en },
  zh: { [DEFAULT_NAMESPACE]: zh },
  es: { [DEFAULT_NAMESPACE]: es },
  pt: { [DEFAULT_NAMESPACE]: pt },
} as const;
