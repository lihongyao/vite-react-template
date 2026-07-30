// import { authSession, telegramAuthApi } from '@/api';

/** 执行 Telegram 登录，只负责授权数据，不渲染启动页面。 */
export async function authenticateTelegram(signal: AbortSignal) {
  // React 启动画面已经可用，通知 Telegram 客户端结束其原生加载占位。
  window.Telegram?.WebApp?.ready?.();

  const initData = window.Telegram?.WebApp?.initData;
  if (!initData) throw new Error('Telegram initData is missing');

  console.log('initData >>> ', initData);

  // 临时模拟登录耗时，接入真实 Telegram 登录接口后删除。
  await wait(2000, signal);
  if (signal.aborted) return;

  // const { token } = await telegramAuthApi.loginOnce({ initData });
  // authSession.setToken(token);
}

function wait(duration: number, signal: AbortSignal) {
  if (signal.aborted) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const finish = () => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    };
    const timer = window.setTimeout(finish, duration);
    const handleAbort = () => {
      window.clearTimeout(timer);
      finish();
    };

    signal.addEventListener('abort', handleAbort, { once: true });
  });
}
