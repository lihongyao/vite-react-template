import { StrictMode } from 'react';

import '@fontsource-variable/albert-sans/wght.css';
import '@fontsource-variable/inter/wght.css';
import './index.css';

import Schemes from '@likg/schemes';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import VConsole from 'vconsole';

import { setApiRequestContextProvider } from './api';
import SpriteSvgSource from './assets/svg/generated/sprite-svg';
import ApiErrorReporter from './components/features/ApiErrorReporter';
import AppEnvGuard from './components/features/AppEnvGuard';
import AppErrorBoundary from './components/features/AppErrorBoundary';
import AppStartup from './components/features/AppStartup';
import { DialogProvider } from './components/ui/Dialog';
import { MessageProvider } from './components/ui/Message';
import { NotificationProvider } from './components/ui/Notification';
import { DEFAULT_LOCALE, LOCALE_CONFIG, isLocale } from './i18n/config';
import i18n, { initializeI18n } from './i18n/instance';
import AppRoutes, { createAppRouter } from './routes';

// 1. 创建 vConsole 对象
if (import.meta.env.VITE_APP_ENV !== 'production') {
  const debugConsole = new VConsole();

  if (import.meta.hot) {
    import.meta.hot.dispose(() => debugConsole.destroy());
  }
}

// 2. 记录出入进入程序时的url地址（用于配置iOS js-sdk）
window.CONFIG_URL_FOR_IOS = window.location.href;

// 3. Schemes地址（APP嵌套H5模式）
Schemes.config('xxx://www.xxx.com');

// 4. 国际化
await initializeI18n();
setApiRequestContextProvider(() => {
  const resolvedLanguage = i18n.resolvedLanguage;
  const locale = resolvedLanguage && isLocale(resolvedLanguage) ? resolvedLanguage : DEFAULT_LOCALE;

  return {
    params: {
      ch: 1001,
      lang: LOCALE_CONFIG[locale].apiLang,
    },
  };
});
const router = createAppRouter();

// 5. 渲染
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpriteSvgSource />
    <AppErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <NotificationProvider>
          <MessageProvider>
            <DialogProvider>
              <ApiErrorReporter />
              <AppEnvGuard>
                <AppStartup>
                  <AppRoutes router={router} />
                </AppStartup>
              </AppEnvGuard>
            </DialogProvider>
          </MessageProvider>
        </NotificationProvider>
      </I18nextProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
