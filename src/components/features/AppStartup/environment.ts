import { type DeviceEnvironment, getDeviceEnvironment } from '@/libs/device';

export interface EnvironmentRequirement {
  environment: DeviceEnvironment;
  icon: string;
  name: string;
}

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

export class EnvironmentMismatchError extends Error {
  readonly actualEnvironment: DeviceEnvironment;
  readonly requirement: EnvironmentRequirement;

  constructor(actualEnvironment: DeviceEnvironment, requirement: EnvironmentRequirement) {
    super(`This build must run within ${requirement.name}`);
    this.name = 'EnvironmentMismatchError';
    this.actualEnvironment = actualEnvironment;
    this.requirement = requirement;
  }
}

let cachedEnvironment: DeviceEnvironment | undefined;
let cachedEnvironmentError: Error | undefined;

/** Resolve and validate the runtime environment once for the lifetime of the app. */
export function resolveAppEnvironment(): DeviceEnvironment {
  if (cachedEnvironmentError) throw cachedEnvironmentError;
  if (cachedEnvironment) return cachedEnvironment;

  const environment = getDeviceEnvironment();
  const requirement = SOURCE_REQUIREMENTS[import.meta.env.VITE_APP_SOURCE];

  if (requirement === undefined) {
    cachedEnvironmentError = new Error(
      `Unsupported VITE_APP_SOURCE: ${import.meta.env.VITE_APP_SOURCE}`,
    );
    throw cachedEnvironmentError;
  }

  if (requirement && environment !== requirement.environment) {
    cachedEnvironmentError = new EnvironmentMismatchError(environment, requirement);
    throw cachedEnvironmentError;
  }

  cachedEnvironment = environment;
  return environment;
}
