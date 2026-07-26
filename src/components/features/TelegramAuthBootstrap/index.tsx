import { type PropsWithChildren, useEffect, useState } from 'react';

import { authSession, telegramAuthApi } from '@/api';
import { getDeviceEnvironment } from '@/libs/device';

type AuthStatus = 'error' | 'loading' | 'ready';

export default function TelegramAuthBootstrap({ children }: PropsWithChildren) {
  const isTelegram = getDeviceEnvironment() === 'telegram';
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<AuthStatus>(isTelegram ? 'loading' : 'ready');

  useEffect(() => {
    if (!isTelegram) return undefined;

    const initData = window.Telegram?.WebApp?.initData;

    if (!initData) {
      setStatus('error');
      return undefined;
    }

    let isCurrent = true;

    const authenticate = async () => {
      try {
        console.log('initData >>> ', initData);
        const { token } = await telegramAuthApi.loginOnce({ initData });
        if (isCurrent) {
          authSession.setToken(token);
          setStatus('ready');
        }
      } catch {
        if (isCurrent) setStatus('error');
      }
    };

    void authenticate();

    return () => {
      isCurrent = false;
    };
  }, [attempt, isTelegram]);

  if (status === 'loading') {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#f9f9f9] px-6">
        <span
          aria-hidden="true"
          className="size-8 animate-spin rounded-full border-2 border-[#ddd] border-t-[#222]"
        />
        <output className="text-sm text-[#666]">Signing in...</output>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f9f9f9] px-6">
        <section className="w-full max-w-sm text-center">
          <h1 className="text-lg font-semibold text-[#222]">Unable to sign in</h1>
          <p role="alert" className="mt-2 text-sm leading-6 text-[#666]">
            Telegram authorization failed. Please try again.
          </p>
          <button
            className="mt-6 h-10 rounded-md bg-[#222] px-5 text-sm font-medium text-white active:bg-black"
            type="button"
            onClick={() => {
              setStatus('loading');
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return children;
}
