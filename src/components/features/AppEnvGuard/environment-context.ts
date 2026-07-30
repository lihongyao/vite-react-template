import { createContext, useContext } from 'react';

import type { DeviceEnvironment } from '@/libs/device';

export const AppEnvironmentContext = createContext<DeviceEnvironment | undefined>(undefined);

/** 读取 AppEnvGuard 已确认的运行环境，避免下游组件重复检测。 */
export function useAppEnvironment() {
  const environment = useContext(AppEnvironmentContext);

  if (!environment) {
    throw new Error('useAppEnvironment must be used within AppEnvGuard');
  }

  return environment;
}
