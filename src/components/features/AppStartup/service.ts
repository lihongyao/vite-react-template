import type { DeviceEnvironment } from '@/libs/device';

import { initializeApp } from './initialize';
import { authenticateTelegram } from './platforms/telegram';
import { authenticateWeChat } from './platforms/wechat';
import {
  StartupError,
  type StartupResult,
  type StartupSnapshot,
  type StartupStage,
  getInitialStartupStage,
} from './types';

interface EnsureStartupOptions {
  environment: DeviceEnvironment;
  signal: AbortSignal;
}

type StartupListener = () => void;

let activeRun: Promise<StartupResult> | undefined;
let activeRunEnvironment: DeviceEnvironment | undefined;
let completedAuthEnvironment: DeviceEnvironment | undefined;
let readyResult: { environment: DeviceEnvironment; result: StartupResult } | undefined;
let requestedStartStage: StartupStage | undefined;
let snapshot: StartupSnapshot = { status: 'idle' };
const listeners = new Set<StartupListener>();

function publish(nextSnapshot: StartupSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

function createAbortError() {
  return new DOMException('App startup was canceled', 'AbortError');
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw createAbortError();
}

async function authenticatePlatform(environment: DeviceEnvironment, signal: AbortSignal) {
  if (environment === 'telegram') {
    await authenticateTelegram(signal);
    return;
  }

  if (environment === 'wechat') await authenticateWeChat(signal);
}

async function runStartup(
  environment: DeviceEnvironment,
  signal: AbortSignal,
  startStage: StartupStage,
): Promise<StartupResult> {
  let currentStage = startStage;
  publish({ environment, stage: currentStage, status: 'loading' });

  try {
    throwIfAborted(signal);

    if (currentStage === 'platform-auth') {
      await authenticatePlatform(environment, signal);
      throwIfAborted(signal);
      completedAuthEnvironment = environment;

      currentStage = 'initialization';
      publish({ environment, stage: currentStage, status: 'loading' });
    }

    const result = await initializeApp({ environment, signal });
    throwIfAborted(signal);
    if (!result) throw createAbortError();

    readyResult = { environment, result };
    publish({ environment, result, status: 'ready' });
    return result;
  } catch (error) {
    if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
      publish({ status: 'idle' });
      throw error;
    }

    const startupError = new StartupError(currentStage, environment, error);
    publish({ environment, error: startupError, stage: currentStage, status: 'error' });
    throw startupError;
  }
}

function ensureReady({ environment, signal }: EnsureStartupOptions): Promise<StartupResult> {
  if (readyResult?.environment === environment) return Promise.resolve(readyResult.result);

  if (activeRun) {
    if (activeRunEnvironment !== environment) {
      throw new Error('The app environment changed during startup');
    }

    return activeRun;
  }

  const defaultStartStage =
    completedAuthEnvironment === environment
      ? 'initialization'
      : getInitialStartupStage(environment);
  const startStage = requestedStartStage ?? defaultStartStage;
  requestedStartStage = undefined;
  activeRunEnvironment = environment;

  const run = runStartup(environment, signal, startStage).then(
    (result) => {
      if (activeRun === run) {
        activeRun = undefined;
        activeRunEnvironment = undefined;
      }
      return result;
    },
    (error: unknown) => {
      if (activeRun === run) {
        activeRun = undefined;
        activeRunEnvironment = undefined;
      }
      throw error;
    },
  );

  activeRun = run;
  return run;
}

function resetForRetry(stage: StartupStage, environment: DeviceEnvironment) {
  readyResult = undefined;
  requestedStartStage = stage;
  if (stage === 'platform-auth') completedAuthEnvironment = undefined;
  publish({ environment, stage, status: 'loading' });
}

export const appStartup = {
  ensureReady,
  getSnapshot: () => snapshot,
  resetForRetry,
  subscribe: (listener: StartupListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
