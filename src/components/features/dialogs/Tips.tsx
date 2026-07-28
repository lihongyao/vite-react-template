import { type ComponentType, type ReactNode, type SVGProps, useId, useState } from 'react';

import TipsCorrectIcon from '@/assets/icon/tips_correct.svg?react';
import TipsErrorIcon from '@/assets/icon/tips_error.svg?react';
import TipsSystemIcon from '@/assets/icon/tips_system.svg?react';
import TipsWarningIcon from '@/assets/icon/tips_warning.svg?react';
import Button from '@/components/ui/Button';
import { useDialog } from '@/components/ui/Dialog';

export type TipsType = 'success' | 'info' | 'warning' | 'error';

export interface TipsProps {
  title: ReactNode;
  description?: ReactNode;
  type?: TipsType;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

const TYPE_META: Record<
  TipsType,
  {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    iconClassName: string;
  }
> = {
  success: {
    icon: TipsCorrectIcon,
    iconClassName: 'bg-[#e9fff3]',
  },
  info: {
    icon: TipsSystemIcon,
    iconClassName: 'bg-[#e9fff3]',
  },
  warning: {
    icon: TipsWarningIcon,
    iconClassName: 'bg-[#fffbe5]',
  },
  error: {
    icon: TipsErrorIcon,
    iconClassName: 'bg-[#fff0f4]',
  },
};

export default function Tips({
  title,
  description,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: TipsProps) {
  const dialog = useDialog();
  const titleId = useId();
  const descriptionId = useId();
  const [pendingAction, setPendingAction] = useState<'confirm' | 'cancel' | null>(null);
  const { icon: StatusIcon, iconClassName } = TYPE_META[type];

  const close = (reason: 'confirmed' | 'cancelled') => dialog.close('Tips', { reason });

  const handleConfirm = async () => {
    if (pendingAction) return;
    setPendingAction('confirm');

    try {
      await onConfirm?.();
      void close('confirmed');
    } catch (error) {
      setPendingAction(null);
      throw error;
    }
  };

  const handleCancel = async () => {
    if (pendingAction) return;
    setPendingAction('cancel');

    try {
      await onCancel?.();
      void close('cancelled');
    } catch (error) {
      setPendingAction(null);
      throw error;
    }
  };

  return (
    <section
      role="alertdialog"
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className="w-[calc(100vw-32px)] max-w-[360px] overflow-hidden rounded-lg bg-white text-center text-[#1f2937] shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
    >
      <div className="px-6 pt-7 pb-6">
        <span
          className={`mx-auto flex size-12 items-center justify-center rounded-full ${iconClassName}`}
        >
          <StatusIcon aria-hidden className="size-7" focusable={false} />
        </span>

        <h2 id={titleId} className="mt-4 text-lg leading-6 font-semibold break-words">
          {title}
        </h2>

        {description ? (
          <div
            id={descriptionId}
            className="mt-2 text-sm leading-5 font-normal break-words text-[#6b7280]"
          >
            {description}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-[#e5e7eb] bg-[#f9fafb] px-5 py-4">
        {cancelText !== null ? (
          <Button
            block
            disabled={pendingAction !== null}
            loading={pendingAction === 'cancel'}
            variant="outline"
            onClick={handleCancel}
          >
            {cancelText}
          </Button>
        ) : null}
        <Button
          block
          className={cancelText === null ? 'col-span-2' : undefined}
          disabled={pendingAction !== null}
          loading={pendingAction === 'confirm'}
          loadingText={confirmText}
          variant={type === 'error' ? 'danger' : 'primary'}
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </section>
  );
}
