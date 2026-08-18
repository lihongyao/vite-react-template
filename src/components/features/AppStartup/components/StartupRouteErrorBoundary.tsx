import { useSyncExternalStore } from 'react';

import { useRevalidator, useRouteError } from 'react-router';

import { AppErrorFallback } from '@/components/features/AppErrorBoundary';

import { EnvironmentMismatchError } from '../environment';
import { appStartup } from '../service';
import { StartupError } from '../types';
import EnvironmentErrorScreen from './EnvironmentErrorScreen';
import StartupErrorScreen from './StartupErrorScreen';
import StartupHydrateFallback from './StartupHydrateFallback';

export default function StartupRouteErrorBoundary() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const snapshot = useSyncExternalStore(
    appStartup.subscribe,
    appStartup.getSnapshot,
    appStartup.getSnapshot,
  );

  if (error instanceof EnvironmentMismatchError) {
    return <EnvironmentErrorScreen requirement={error.requirement} />;
  }

  if (!(error instanceof StartupError)) return <AppErrorFallback />;
  if (snapshot.status === 'loading') return <StartupHydrateFallback />;

  return (
    <StartupErrorScreen
      environment={error.environment}
      stage={error.stage}
      onRetry={() => {
        appStartup.resetForRetry(error.stage, error.environment);
        void revalidator.revalidate();
      }}
    />
  );
}
