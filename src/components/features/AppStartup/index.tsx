import { type PropsWithChildren, useEffect, useState } from 'react';

import { useAppEnvironment } from '@/components/features/AppEnvGuard/environment-context';
import { getLocaleFromPathname, localizePathname, stripLocalePrefix } from '@/i18n/routing';
import type { DeviceEnvironment } from '@/libs/device';
import type { createAppRouter } from '@/routes';
import { ROUTE_PATHS } from '@/routes/paths';

import StartupErrorScreen, { type StartupStage } from './components/StartupErrorScreen';
import StartupLoadingScreen from './components/StartupLoadingScreen';
import { initializeApp } from './initialize';
import { authenticateTelegram } from './platforms/telegram';
import { authenticateWeChat } from './platforms/wechat';

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
