import { memo, useEffect } from 'react';
import type { ReactNode } from 'react';

import { createPortal } from 'react-dom';

import Icon from '@/components/ui/Icon';
import { cn } from '@/libs/class-helpers';

interface IProps {
  visible: boolean;
  title?: string;
  closeable?: boolean;
  closeOnClickOverlay?: boolean;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
  onClose: () => void;
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
  /** 阻止显示时页面可拖拽 */
  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const content = (
    <div
      className={cn(
        'ui-popup app-fixed-frame fixed inset-y-0 z-[-1] bg-black/0 transition-all duration-[250ms] ease-linear',
        visible && 'z-[1700] bg-black/75',
        className,
      )}
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 size-full cursor-default"
        aria-label="Close popup"
        disabled={!visible || !closeOnClickOverlay}
        onClick={onClose}
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
            onClick={onClose}
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
