import { memo } from 'react';

import { cn } from '@/libs/class-helpers';

const dotDelayClassNames = [
  '[animation-delay:0s]',
  '[animation-delay:0.25s]',
  '[animation-delay:0.5s]',
] as const;

export interface LoadingProps {
  className?: string;
  tips?: string;
  tipsClassName?: string;
  dotClassName?: string;
  direction?: 'vertical' | 'horizontal';
}

export default memo(function Loading({
  className,
  tips,
  tipsClassName,
  dotClassName,
  direction = 'horizontal',
}: LoadingProps) {
  const vertical = direction === 'vertical';

  return (
    <div
      className={cn(
        'flex items-center justify-center pt-[50px]',
        vertical && 'flex-col',
        className,
      )}
    >
      {tips && (
        <div
          className={cn('text-sm text-[#999999]', vertical ? 'mb-[18px]' : 'mr-1.5', tipsClassName)}
        >
          {tips}
        </div>
      )}
      <div className="flex items-center justify-center">
        {dotDelayClassNames.map((delayClassName) => (
          <div
            className={cn(
              'mx-[5px] size-1 shrink-0 animate-[loading-dot_2.5s_linear_infinite] rounded-[1px] bg-[#999999]',
              dotClassName,
              delayClassName,
            )}
            key={delayClassName}
          />
        ))}
      </div>
    </div>
  );
});
