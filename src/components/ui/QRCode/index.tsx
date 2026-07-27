import { forwardRef } from 'react';

import QRCode from 'react-qr-code';
import type { QRCodeProps } from 'react-qr-code';

import { cn } from '@/libs/class-helpers';

export interface QrCodeImgProps extends QRCodeProps {
  value: string;
  className?: string;
}

const QRCodeImg = forwardRef<HTMLDivElement, QrCodeImgProps>(
  ({ value, className, style, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('bg-white p-1.5', className)}>
        <QRCode
          {...props}
          value={value}
          style={{ display: 'block', width: '100%', height: '100%', ...style }}
        />
      </div>
    );
  },
);

QRCodeImg.displayName = 'QRCodeImg';

export { QRCodeImg };
