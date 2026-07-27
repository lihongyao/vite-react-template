import { forwardRef, useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@/libs/class-helpers';

const buttonVariants = cva(
  'relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[#1f2937] text-white hover:bg-[#111827] active:bg-[#030712]',
        secondary: 'bg-[#0f766e] text-white hover:bg-[#0d665f] active:bg-[#115e59]',
        outline:
          'border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f3f4f6] active:bg-[#e5e7eb]',
        danger: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] active:bg-[#991b1b]',
        ghost: 'bg-transparent text-[#374151] hover:bg-[#f3f4f6] active:bg-[#e5e7eb]',
      },
      size: {
        small: 'h-9 px-3 text-sm',
        medium: 'h-11 px-4 text-sm',
        large: 'h-12 px-5 text-base',
      },
      block: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
      block: false,
    },
  },
);

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'prefix'>;

export interface ButtonProps extends NativeButtonProps, VariantProps<typeof buttonVariants> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  loading?: boolean;
  loadingIcon?: ReactNode;
  loadingText?: ReactNode;
  autoLoading?: boolean;
  cooldownMs?: number;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown;
}

const spinnerSizeClasses = {
  small: 'size-4',
  medium: 'size-5',
  large: 'size-6',
} as const;

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
    variant,
    size = 'medium',
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
    <span
      className={cn(
        'animate-spin rounded-full border-2 border-[#ddd] border-t-current',
        spinnerSizeClasses[size ?? 'medium'],
      )}
    />
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
      className={cn(buttonVariants({ variant, size, block }), className)}
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
