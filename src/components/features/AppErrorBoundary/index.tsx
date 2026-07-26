import type { PropsWithChildren } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

export function AppErrorFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f7f7f7] px-6 text-[#222]">
      <section className="w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold">页面暂时无法显示</h1>
        <p className="mt-2 text-sm leading-6 text-[#666]">应用遇到异常，请重新加载后再试。</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            className="h-10 rounded-md border border-[#ddd] bg-white px-5 text-sm font-medium text-[#333] active:bg-[#eee]"
            type="button"
            onClick={() => window.location.assign(import.meta.env.BASE_URL)}
          >
            返回首页
          </button>
          <button
            className="h-10 rounded-md bg-[#222] px-5 text-sm font-medium text-white active:bg-black"
            type="button"
            onClick={() => window.location.reload()}
          >
            重新加载
          </button>
        </div>
      </section>
    </main>
  );
}

export default function AppErrorBoundary({ children }: PropsWithChildren) {
  return <ErrorBoundary FallbackComponent={AppErrorFallback}>{children}</ErrorBoundary>;
}
