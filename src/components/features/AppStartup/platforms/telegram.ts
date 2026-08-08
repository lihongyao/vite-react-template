// import { authSession, telegramAuthApi } from '@/api';

/** 执行 Telegram 登录，只负责授权数据，不渲染启动页面。 */
export async function authenticateTelegram(signal: AbortSignal): Promise<void> {
  // React 启动画面已经可用，通知 Telegram 客户端结束其原生加载占位。
  window.Telegram?.WebApp?.ready?.();

  const initData = window.Telegram?.WebApp?.initData;
  if (!initData) throw new Error('Telegram initData is missing');

  console.log('initData >>> ', initData);

  // const { token } = await telegramAuthApi.loginOnce({ initData });
  // authSession.setToken(token);

  // 临时模拟登录耗时，接入真实 Telegram 登录接口后删除。
  await new Promise<void>((resolve) => window.setTimeout(resolve, 2000));
  if (signal.aborted) return;
}
