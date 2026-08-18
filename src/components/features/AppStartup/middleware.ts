import { type MiddlewareFunction, createContext } from 'react-router';

import type { DeviceEnvironment } from '@/libs/device';

import { resolveAppEnvironment } from './environment';
import { appStartup } from './service';
import type { StartupResult } from './types';

export const appEnvironmentRouteContext = createContext<DeviceEnvironment>();
export const appStartupRouteContext = createContext<StartupResult>();

/** Block matched route loaders until platform auth and common initialization are ready. */
export const appStartupMiddleware: MiddlewareFunction = async ({ context, request }, next) => {
  const environment = resolveAppEnvironment();
  context.set(appEnvironmentRouteContext, environment);

  const result = await appStartup.ensureReady({ environment, signal: request.signal });
  context.set(appStartupRouteContext, result);

  await next();
};
