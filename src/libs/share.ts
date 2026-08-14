import copy from 'copy-to-clipboard';

import { getDeviceEnvironment } from './device';

export type SharePlatform =
  'facebook' | 'instagram' | 'more' | 'telegram' | 'threads' | 'tiktok' | 'twitter' | 'whatsapp';

export type ShareLinkResult = 'cancelled' | 'copied' | 'opened' | 'shared';

const INSTAGRAM_URL = 'https://www.instagram.com/';
const TIKTOK_URL = 'https://www.tiktok.com/';

function buildFacebookShareUrl(url: string) {
  const shareUrl = new URL('https://www.facebook.com/sharer/sharer.php');
  shareUrl.searchParams.set('u', url);
  return shareUrl.toString();
}

function buildTelegramShareUrl(url: string) {
  const shareUrl = new URL('https://t.me/share/url');
  shareUrl.searchParams.set('url', url);
  return shareUrl.toString();
}

function buildThreadsShareUrl(url: string) {
  const shareUrl = new URL('https://www.threads.com/intent/post');
  shareUrl.searchParams.set('text', url);
  return shareUrl.toString();
}

function buildTwitterShareUrl(url: string) {
  const shareUrl = new URL('https://x.com/intent/tweet');
  shareUrl.searchParams.set('url', url);
  return shareUrl.toString();
}

function buildWhatsAppShareUrl(url: string) {
  const shareUrl = new URL('https://wa.me/');
  shareUrl.searchParams.set('text', url);
  return shareUrl.toString();
}

function openShareUrl(url: string, telegramLink = false) {
  const isTelegramEnvironment = getDeviceEnvironment() === 'telegram';
  const telegramWebApp = isTelegramEnvironment ? window.Telegram?.WebApp : undefined;

  if (telegramWebApp) {
    if (telegramLink) {
      telegramWebApp.openTelegramLink(url);
    } else {
      telegramWebApp.openLink(url);
    }
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

function canUseSystemShare(shareData: ShareData) {
  return (
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' || navigator.canShare(shareData))
  );
}

async function shareWithSystem(shareData: ShareData): Promise<ShareLinkResult> {
  try {
    await navigator.share(shareData);
    return 'shared';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled';
    }
    throw error;
  }
}

function copyShareUrl(url: string): ShareLinkResult {
  if (!copy(url)) {
    throw new Error('Failed to copy share URL');
  }
  return 'copied';
}

/**
 * 将链接分享到指定平台。More 在 Telegram 环境中打开 Telegram 会话选择器，
 * 在普通浏览器中调用系统分享面板；不支持系统分享时会复制链接作为回退。
 */
export async function shareLink(url: string, platform: SharePlatform): Promise<ShareLinkResult> {
  const shareData: ShareData = { url };
  const isTelegramEnvironment = getDeviceEnvironment() === 'telegram';
  switch (platform) {
    case 'facebook':
      openShareUrl(buildFacebookShareUrl(url));
      return 'opened';
    case 'telegram':
      openShareUrl(buildTelegramShareUrl(url), true);
      return 'opened';
    case 'whatsapp':
      openShareUrl(buildWhatsAppShareUrl(url));
      return 'opened';
    case 'twitter':
      openShareUrl(buildTwitterShareUrl(url));
      return 'opened';
    case 'threads':
      openShareUrl(buildThreadsShareUrl(url));
      return 'opened';
    case 'instagram':
    case 'tiktok':
      if (canUseSystemShare(shareData)) {
        return shareWithSystem(shareData);
      }
      copyShareUrl(url);
      openShareUrl(platform === 'instagram' ? INSTAGRAM_URL : TIKTOK_URL);
      return 'copied';
    case 'more':
      if (isTelegramEnvironment) {
        openShareUrl(buildTelegramShareUrl(url), true);
        return 'opened';
      }
      if (canUseSystemShare(shareData)) {
        return shareWithSystem(shareData);
      }
      return copyShareUrl(url);
  }
}
