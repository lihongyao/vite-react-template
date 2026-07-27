import { memo } from 'react';

import { cn } from '@/libs/class-helpers';

export interface LoadingWithLogoProps {
  className?: string;
  showTips?: boolean;
  tips?: string;
  icon?: string;
  logoClassName?: string;
  spinnerClassName?: string;
  tipsClassName?: string;
}

export default memo(function LoadingWithLogo({
  className,
  tips = '数据加载中',
  showTips = true,
  icon,
  logoClassName,
  spinnerClassName,
  tipsClassName,
}: LoadingWithLogoProps) {
  return (
    <div className={cn('pt-[100px] text-center', className)}>
      <div className="relative mx-auto flex size-16 items-center justify-center">
        <img
          src={icon ? icon : new URL('./images/logo_1.png', import.meta.url).href}
          alt=""
          className={cn('size-[22px]', logoClassName)}
        />
        <img
          aria-hidden
          alt=""
          className={cn('absolute inset-0 size-full animate-spin', spinnerClassName)}
          src={new URL('./images/border.png', import.meta.url).href}
        />
      </div>
      {showTips && (
        <div className={cn('mt-3 text-xs tracking-[2px] text-[#999999]', tipsClassName)}>
          {tips}
        </div>
      )}
    </div>
  );
});
