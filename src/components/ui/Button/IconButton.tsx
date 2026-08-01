import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/libs/class-helpers';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, type = 'button', className, ...buttonProps },
  ref,
) {
  return (
    <button
      ref={ref}
      {...buttonProps}
      type={type}
      className={cn(
        'animate-pressable relative inline-flex shrink-0 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
        className,
      )}
    >
      {icon}
    </button>
  );
});

export default IconButton;
