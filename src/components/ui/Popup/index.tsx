import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, TransitionEvent } from 'react';

import { createPortal } from 'react-dom';

import Icon from '@/components/ui/Icon';
import { cn } from '@/libs/class-helpers';
import { lockDocumentScroll, unlockDocumentScroll } from '@/libs/scroll-lock';

interface IProps {
  visible: boolean;
  title?: string;
  closeable?: boolean;
  closeOnClickOverlay?: boolean;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
  onClose: (visible: boolean) => void;
}

const POPUP_TRANSITION_DURATION = 250;
const POPUP_UNMOUNT_DELAY = POPUP_TRANSITION_DURATION + 50;

export default memo(function Popup({
  visible,
  children,
  title,
  closeable,
  className,
  contentClassName,
  closeOnClickOverlay = true,
  onClose,
}: IProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const didMountRef = useRef(false);
  const [mounted, setMounted] = useState(visible);
  const [entered, setEntered] = useState(visible);

  // Keep the portal only while it is opening or finishing its exit animation.
  useLayoutEffect(() => {
    if (visible) {
      setMounted(true);
      if (didMountRef.current) setEntered(false);
    } else {
      setEntered(false);
    }

    didMountRef.current = true;
  }, [visible]);

  useEffect(() => {
    if (!visible || !mounted || entered) return undefined;

    const animationFrame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(animationFrame);
  }, [entered, mounted, visible]);

  useEffect(() => {
    if (visible || !mounted) return undefined;

    const unmountTimer = window.setTimeout(() => setMounted(false), POPUP_UNMOUNT_DELAY);
    return () => window.clearTimeout(unmountTimer);
  }, [mounted, visible]);

  /** 阻止显示时页面可拖拽 */
  useEffect(() => {
    if (!visible) return undefined;

    lockDocumentScroll();

    return () => {
      unlockDocumentScroll();
    };
  }, [visible]);

  useLayoutEffect(() => {
    if (visible) {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && !popupRef.current?.contains(activeElement)) {
        returnFocusRef.current = activeElement;
      }
      return;
    }

    const returnFocusElement = returnFocusRef.current;
    returnFocusRef.current = null;

    if (returnFocusElement?.isConnected) {
      returnFocusElement.focus({ preventScroll: true });
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && popupRef.current?.contains(activeElement)) {
      activeElement.blur();
    }
  }, [visible]);

  const close = () => onClose(false);
  const active = visible && entered;
  const handlePanelTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target || event.propertyName !== 'transform' || visible) {
      return;
    }

    setMounted(false);
  };

  if (!mounted) return null;

  const content = (
    <div
      ref={popupRef}
      className={cn(
        'ui-popup app-fixed-frame fixed inset-y-0 z-[-1] touch-none overscroll-none bg-black/0 transition-all duration-[250ms] ease-linear',
        visible && 'z-[1700]',
        active && 'bg-black/75',
        className,
      )}
      inert={active ? undefined : true}
    >
      <button
        type="button"
        className="absolute inset-0 size-full cursor-default"
        aria-label="Close popup"
        disabled={!active || !closeOnClickOverlay}
        onClick={close}
      />
      <div
        className={cn(
          'absolute bottom-0 box-border min-h-40 w-full translate-y-full overflow-hidden rounded-t-[20px] bg-white transition-transform duration-[250ms] ease-linear',
          active && 'translate-y-0',
          contentClassName,
        )}
        onTransitionEnd={handlePanelTransitionEnd}
      >
        {title && (
          <div className="text-center text-base leading-[50px] font-semibold tracking-[1px]">
            {title}
          </div>
        )}
        {closeable && (
          <button
            type="button"
            className="absolute top-4 right-4 flex size-[26px] items-center justify-center text-[#B3B8C1]"
            aria-label="Close popup"
            disabled={!active}
            onClick={close}
          >
            <Icon name="close" className="size-[26px]" />
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
});
