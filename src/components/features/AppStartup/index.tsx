import { type PropsWithChildren, useEffect, useState } from 'react';

import { useAppEnvironment } from '@/components/features/AppEnvGuard/environment-context';
import { getLocaleFromPathname, localizePathname, stripLocalePrefix } from '@/i18n/routing';
import type { DeviceEnvironment } from '@/libs/device';
import type { createAppRouter } from '@/routes';
import { ROUTE_PATHS } from '@/routes/paths';

import StartupLoadingScreen from './StartupLoadingScreen';
import { initializeApp } from './initialize';
import { authenticateTelegram } from './platforms/telegram';
import { authenticateWeChat } from './platforms/wechat';

type StartupStage = 'initialization' | 'platform-auth';

type StartupState =
  | { status: 'error'; stage: StartupStage }
  | { status: 'loading'; stage: StartupStage }
  | { status: 'ready' };

interface StartupRun {
  id: number;
  startStage: StartupStage;
}

type AppRouter = ReturnType<typeof createAppRouter>;
type Props = PropsWithChildren<{ router: AppRouter }>;

/**
 * 应用启动总入口：按运行平台完成授权，再执行公共初始化，全部成功后才渲染业务路由。
 */
export default function AppStartup({ children, router }: Props) {
  const environment = useAppEnvironment();
  const initialStage = getInitialStage(environment);
  const [run, setRun] = useState<StartupRun>({ id: 0, startStage: initialStage });
  const [state, setState] = useState<StartupState>({ status: 'loading', stage: initialStage });

  useEffect(() => {
    const abortController = new AbortController();

    const start = async () => {
      let currentStage = run.startStage;

      try {
        if (currentStage === 'platform-auth') {
          await authenticatePlatform(environment, abortController.signal);
          if (abortController.signal.aborted) return;

          currentStage = 'initialization';
          setState({ status: 'loading', stage: currentStage });
        }

        const result = await initializeApp({ environment, signal: abortController.signal });
        if (abortController.signal.aborted || !result) return;

        const currentPathname = router.state.location.pathname;
        if (stripLocalePrefix(currentPathname) === ROUTE_PATHS.Home) {
          const locale = getLocaleFromPathname(currentPathname);
          const targetPath = result.isAgent ? ROUTE_PATHS.Home : ROUTE_PATHS.Apply;
          await router.navigate(localizePathname(targetPath, locale), { replace: true });
        }

        if (!abortController.signal.aborted) setState({ status: 'ready' });
      } catch {
        if (!abortController.signal.aborted) {
          setState({ status: 'error', stage: currentStage });
        }
      }
    };

    void start();

    return () => abortController.abort();
  }, [environment, router, run]);

  if (state.status === 'loading') {
    return <StartupLoadingScreen message={getLoadingMessage(environment, state.stage)} />;
  }

  if (state.status === 'error') {
    return (
      <StartupErrorScreen
        environment={environment}
        stage={state.stage}
        onRetry={() => {
          setState({ status: 'loading', stage: state.stage });
          setRun((current) => ({ id: current.id + 1, startStage: state.stage }));
        }}
      />
    );
  }

  return children;
}

function getInitialStage(environment: DeviceEnvironment): StartupStage {
  return environment === 'telegram' || environment === 'wechat'
    ? 'platform-auth'
    : 'initialization';
}

async function authenticatePlatform(environment: DeviceEnvironment, signal: AbortSignal) {
  if (environment === 'telegram') {
    await authenticateTelegram(signal);
    return;
  }

  if (environment === 'wechat') {
    await authenticateWeChat(signal);
  }
}

function getLoadingMessage(environment: DeviceEnvironment, stage: StartupStage) {
  if (stage === 'platform-auth') {
    return environment === 'telegram' ? '正在通过 Telegram 登录' : '正在通过微信授权';
  }

  return '正在初始化应用';
}

interface StartupErrorScreenProps {
  environment: DeviceEnvironment;
  onRetry: () => void;
  stage: StartupStage;
}

function StartupErrorScreen({ environment, onRetry, stage }: StartupErrorScreenProps) {
  const isTelegramAuthError = stage === 'platform-auth' && environment === 'telegram';
  const errorMessage =
    stage === 'initialization'
      ? 'Application initialization failed. Please try again.'
      : environment === 'telegram'
        ? 'Telegram authorization failed. Please try again.'
        : 'WeChat authorization failed. Please try again.';

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f9f9f9] px-6">
      <section className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold text-[#222]">
          {stage === 'platform-auth' ? 'Unable to sign in' : 'Unable to start'}
        </h1>
        <p role="alert" className="mt-2 text-sm leading-6 text-[#666]">
          {errorMessage}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            className="h-10 min-w-0 flex-1 rounded-md bg-[#222] px-4 text-sm font-medium text-white active:bg-black"
            type="button"
            onClick={onRetry}
          >
            Try again
          </button>
          {isTelegramAuthError && (
            <button
              className="h-10 min-w-0 flex-1 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] active:bg-[#f3f4f6]"
              type="button"
              onClick={() => window.Telegram?.WebApp?.close?.()}
            >
              Close and Reopen
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
