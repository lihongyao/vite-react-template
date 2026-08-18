import { useSyncExternalStore } from 'react';

import { appStartup } from '../service';
import type { StartupStage } from '../types';
import StartupLoadingScreen from './StartupLoadingScreen';

export default function StartupHydrateFallback() {
  const snapshot = useSyncExternalStore(
    appStartup.subscribe,
    appStartup.getSnapshot,
    appStartup.getSnapshot,
  );
  const message =
    snapshot.status === 'loading'
      ? getLoadingMessage(snapshot.environment, snapshot.stage)
      : '正在初始化应用';

  return <StartupLoadingScreen message={message} />;
}

function getLoadingMessage(
  environment: 'alipay' | 'browser' | 'telegram' | 'wechat',
  stage: StartupStage,
) {
  if (stage === 'platform-auth') {
    return environment === 'telegram' ? '正在通过 Telegram 登录' : '正在通过微信授权';
  }

  return '正在初始化应用';
}
