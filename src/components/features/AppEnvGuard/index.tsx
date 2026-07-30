import { type PropsWithChildren, useState } from 'react';

import { type DeviceEnvironment, getDeviceEnvironment } from '@/libs/device';

import { AppEnvironmentContext } from './environment-context';

type EnvironmentRequirement = {
  environment: DeviceEnvironment;
  icon: string;
  name: string;
};

const SOURCE_REQUIREMENTS = {
  universal: null,
  wechat: {
    environment: 'wechat',
    icon: '/weixin.png',
    name: 'WeChat',
  },
  telegram: {
    environment: 'telegram',
    icon: '/telegram.png',
    name: 'Telegram',
  },
} satisfies Record<ImportMetaEnv['VITE_APP_SOURCE'], EnvironmentRequirement | null>;

/**
 * 校验当前运行环境是否满足构建来源限制，并向后续启动流程提供统一的环境结果。
 */
export default function AppEnvGuard({ children }: PropsWithChildren) {
  const [environment] = useState(getDeviceEnvironment);
  const requirement = SOURCE_REQUIREMENTS[import.meta.env.VITE_APP_SOURCE];

  if (requirement === undefined) {
    throw new Error(`Unsupported VITE_APP_SOURCE: ${import.meta.env.VITE_APP_SOURCE}`);
  }

  if (requirement && environment !== requirement.environment) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f9f9f9] px-6">
        <img src={requirement.icon} alt="" className="size-[52px]" />
        <p role="alert" className="text-center text-sm leading-6 text-[#666]">
          Please open this app within {requirement.name}.
        </p>
      </main>
    );
  }

  return (
    <AppEnvironmentContext.Provider value={environment}>{children}</AppEnvironmentContext.Provider>
  );
}
