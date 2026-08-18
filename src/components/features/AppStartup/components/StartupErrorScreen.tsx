import type { DeviceEnvironment } from '@/libs/device';

import type { StartupStage } from '../types';

interface StartupErrorScreenProps {
  environment: DeviceEnvironment;
  onRetry: () => void;
  stage: StartupStage;
}

export default function StartupErrorScreen({
  environment,
  onRetry,
  stage,
}: StartupErrorScreenProps) {
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
