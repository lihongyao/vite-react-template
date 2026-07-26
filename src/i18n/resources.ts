import enUS from './locales/en-US.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import zhCN from './locales/zh-CN.json';

export const DEFAULT_NAMESPACE = 'translation';

export const resources = {
  'en-US': { [DEFAULT_NAMESPACE]: enUS },
  'zh-CN': { [DEFAULT_NAMESPACE]: zhCN },
  es: { [DEFAULT_NAMESPACE]: es },
  pt: { [DEFAULT_NAMESPACE]: pt },
} as const;
