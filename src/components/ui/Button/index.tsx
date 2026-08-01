import { forwardRef, useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

import { cn } from '@/libs/class-helpers';

const buttonClassName =
  'relative animate-pressable inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#168653] px-4 text-sm font-medium text-white transition-colors outline-none hover:bg-[#0f7044] focus-visible:ring-2 focus-visible:ring-[#16a34a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'prefix'>;

export interface ButtonProps extends NativeButtonProps {
  block?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  loading?: boolean;
  loadingIcon?: ReactNode;
  loadingText?: ReactNode;
  autoLoading?: boolean;
  cooldownMs?: number;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    prefix,
    suffix,
    loading = false,
    loadingIcon,
    loadingText,
    autoLoading = true,
    cooldownMs = 0,
    block,
    type = 'button',
    disabled,
    className,
    onClick,
    ...buttonProps
  },
  ref,
) {
  const [internalLoading, setInternalLoading] = useState(false);
  const clickLockedRef = useRef(false);
  const mountedRef = useRef(true);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = loading || internalLoading;
  const spinner = loadingIcon ?? (
    <span className="size-5 animate-spin rounded-full border-2 border-[#ddd] border-t-current" />
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const releaseClickLock = () => {
    const delay = Math.max(0, cooldownMs);
    if (delay === 0) {
      clickLockedRef.current = false;
      return;
    }

    cooldownTimerRef.current = setTimeout(() => {
      clickLockedRef.current = false;
      cooldownTimerRef.current = undefined;
    }, delay);
  };

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || pending || clickLockedRef.current) {
      event.preventDefault();
      return;
    }

    clickLockedRef.current = true;

    try {
      const result = onClick?.(event);
      if (result instanceof Promise) {
        if (autoLoading) setInternalLoading(true);
        await result;
      }
    } finally {
      if (mountedRef.current) setInternalLoading(false);
      releaseClickLock();
    }
  };

  return (
    <button
      ref={ref}
      {...buttonProps}
      type={type}
      aria-busy={pending || undefined}
      className={cn(buttonClassName, block && 'w-full', className)}
      disabled={disabled || pending}
      onClick={handleClick}
    >
      <span className="grid items-center justify-items-center">
        <span
          className={cn(
            'col-start-1 row-start-1 inline-flex items-center justify-center gap-2',
            pending && 'opacity-0',
          )}
        >
          {prefix !== undefined && prefix !== null ? (
            <span className="flex shrink-0 items-center">{prefix}</span>
          ) : null}
          {children !== undefined && children !== null ? <span>{children}</span> : null}
          {suffix !== undefined && suffix !== null ? (
            <span className="flex shrink-0 items-center">{suffix}</span>
          ) : null}
        </span>

        <span
          aria-hidden
          className={cn(
            'col-start-1 row-start-1 inline-flex items-center justify-center gap-2',
            !pending && 'opacity-0',
          )}
        >
          {spinner}
          {loadingText !== undefined && loadingText !== null ? <span>{loadingText}</span> : null}
        </span>
      </span>
    </button>
  );
});

export default Button;
