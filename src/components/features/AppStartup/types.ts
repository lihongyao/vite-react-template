import type { DeviceEnvironment } from '@/libs/device';

export type StartupStage = 'initialization' | 'platform-auth';

export interface StartupResult {
  isAgent: boolean;
}

export type StartupSnapshot =
  | { status: 'idle' }
  | {
      environment: DeviceEnvironment;
      stage: StartupStage;
      status: 'loading';
    }
  | {
      environment: DeviceEnvironment;
      result: StartupResult;
      status: 'ready';
    }
  | {
      environment: DeviceEnvironment;
      error: StartupError;
      stage: StartupStage;
      status: 'error';
    };

export class StartupError extends Error {
  readonly environment: DeviceEnvironment;
  readonly stage: StartupStage;

  constructor(stage: StartupStage, environment: DeviceEnvironment, cause: unknown) {
    super(`App startup failed during ${stage}`, { cause });
    this.name = 'StartupError';
    this.environment = environment;
    this.stage = stage;
  }
}

export function getInitialStartupStage(environment: DeviceEnvironment): StartupStage {
  return environment === 'telegram' || environment === 'wechat'
    ? 'platform-auth'
    : 'initialization';
}
