import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';

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

  const content = (
    <div
      ref={popupRef}
      className={cn(
        'ui-popup app-fixed-frame fixed inset-y-0 z-[-1] touch-none overscroll-none bg-black/0 transition-all duration-[250ms] ease-linear',
        visible && 'z-[1700] bg-black/75',
        className,
      )}
      inert={!visible ? true : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 size-full cursor-default"
        aria-label="Close popup"
        disabled={!visible || !closeOnClickOverlay}
        onClick={close}
      />
      <div
        className={cn(
          'absolute bottom-0 box-border min-h-40 w-full translate-y-full overflow-hidden rounded-t-[20px] bg-white transition-transform duration-[250ms] ease-linear',
          visible && 'translate-y-0',
          contentClassName,
        )}
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
            disabled={!visible}
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
