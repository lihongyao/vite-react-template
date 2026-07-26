import type { ComponentProps } from 'react';

import { cn } from '@/libs/class-helpers';

export default function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn('animate-pulse rounded bg-[#E9EBEE] motion-reduce:animate-none', className)}
    />
  );
}
