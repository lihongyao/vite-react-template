import { type ReactNode, useId, useState } from 'react';

import Button from '@/components/ui/Button';
import { useDialog } from '@/components/ui/Dialog';
import Icon, { type IconName } from '@/components/ui/Icon';

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
    icon: IconName;
    iconClassName: string;
    iconColor: string;
  }
> = {
  success: {
    icon: 'tips_correct',
    iconClassName: 'bg-[#e9fff3]',
    iconColor: '#31ED87',
  },
  info: {
    icon: 'tips_system',
    iconClassName: 'bg-[#e9fff3]',
    iconColor: '#31ED87',
  },
  warning: {
    icon: 'tips_warning',
    iconClassName: 'bg-[#fffbe5]',
    iconColor: '#F3DF00',
  },
  error: {
    icon: 'tips_error',
    iconClassName: 'bg-[#fff0f4]',
    iconColor: '#FC0048',
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
  const { icon, iconClassName, iconColor } = TYPE_META[type];

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
          <Icon name={icon} className="size-7" color={iconColor} />
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
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </section>
  );
}
