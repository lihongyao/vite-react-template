export type DeviceEnvironment = 'wechat' | 'alipay' | 'telegram' | 'browser';

export function getDeviceEnvironment(): DeviceEnvironment {
  const userAgent = navigator.userAgent.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const telegramWebApp = window.Telegram?.WebApp;
  const hasTelegramSdkContext =
    Boolean(telegramWebApp?.initData) ||
    (Boolean(telegramWebApp?.platform) && telegramWebApp?.platform !== 'unknown');
  const isTelegram =
    hasTelegramSdkContext ||
    searchParams.has('tgWebAppPlatform') ||
    hashParams.has('tgWebAppPlatform') ||
    userAgent.includes('telegram');

  if (isTelegram) {
    return 'telegram';
  }

  if (userAgent.includes('micromessenger')) {
    return 'wechat';
  }

  if (userAgent.includes('alipayclient')) {
    return 'alipay';
  }

  return 'browser';
}
