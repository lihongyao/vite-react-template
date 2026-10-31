import { useEffect, useLayoutEffect, useRef } from 'react';

import { NavigationType, useLocation, useNavigationType } from 'react-router';

const scrollPositions = new Map<string, number>();
const lockedScrollPositionKeys = new Set<string>();

export function recordRouteScrollPosition(locationKey: string) {
  scrollPositions.set(locationKey, window.scrollY);
  lockedScrollPositionKeys.add(locationKey);
}

export function useRouteScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const cancelPendingRestoreRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    cancelPendingRestoreRef.current?.();
    const targetScrollTop =
      navigationType === NavigationType.Pop ? (scrollPositions.get(location.key) ?? 0) : 0;
    cancelPendingRestoreRef.current = restoreScrollPosition(targetScrollTop);
  }, [location.key, navigationType]);

  useEffect(() => {
    lockedScrollPositionKeys.delete(location.key);
    const record = () => {
      if (!lockedScrollPositionKeys.has(location.key)) {
        scrollPositions.set(location.key, window.scrollY);
      }
    };
    window.addEventListener('scroll', record, { passive: true });

    return () => {
      window.removeEventListener('scroll', record);
    };
  }, [location.key]);

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      cancelPendingRestoreRef.current?.();
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);
}

function restoreScrollPosition(targetScrollTop: number) {
  let animationFrame = 0;
  let disposed = false;
  let observer: ResizeObserver | undefined;

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    window.cancelAnimationFrame(animationFrame);
    window.clearTimeout(timeout);
    observer?.disconnect();
    window.removeEventListener('pointerdown', cleanup);
    window.removeEventListener('touchstart', cleanup);
    window.removeEventListener('wheel', cleanup);
  };

  const restore = () => {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(() => {
      if (disposed) return;
      window.scrollTo({ behavior: 'auto', left: 0, top: targetScrollTop });

      const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (maxScrollTop >= targetScrollTop || Math.abs(window.scrollY - targetScrollTop) < 1)
        cleanup();
    });
  };

  const timeout = window.setTimeout(cleanup, 5_000);
  observer = new ResizeObserver(restore);
  observer.observe(document.documentElement);
  observer.observe(document.body);
  window.addEventListener('pointerdown', cleanup, { passive: true });
  window.addEventListener('touchstart', cleanup, { passive: true });
  window.addEventListener('wheel', cleanup, { passive: true });
  restore();

  return cleanup;
}
