import type { ComponentType, ReactNode, RefObject } from 'react';

import type {
  DialogAfterCloseEvent,
  DialogCloseOptions,
  DialogProps,
  DialogRef,
} from '@/components/ui/Dialog';

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

export interface X1DialogProps {
  message?: string;
  count: number;
}

export interface DialogPropsMap {
  Tips: TipsProps;
  X1Dialog: X1DialogProps;
  X2Dialog: Record<string, never>;
  X3Dialog: Record<string, never>;
}

export type DialogType = keyof DialogPropsMap;
export type DialogRegistry = {
  [K in DialogType]: ComponentType<DialogPropsMap[K]>;
};
export type PropsOf<K extends DialogType> = DialogPropsMap[K];
export type DialogPropsUpdater<K extends DialogType> =
  PropsOf<K> | ((prev: PropsOf<K> | null) => PropsOf<K>);

type OpenDialogOmitProps =
  'open' | 'children' | 'onClose' | 'managedByProvider' | 'setAfterClosePromise';
export type OpenDialogTypeOptions = Omit<DialogProps, OpenDialogOmitProps>;

export type DialogInstance<K extends DialogType = DialogType> = {
  key: string;
  type: K;
  zIndex: number;
  closeOnPopstate: boolean;
  props: PropsOf<K>;
  content: ReactNode;
  requestClose: (options?: DialogCloseOptions) => void;
  updateProps: (updater: DialogPropsUpdater<K>) => void;
  onAfterClose?: (event: DialogAfterCloseEvent) => void;
  afterClosePromise?: Promise<void>;
  dialogRef?: RefObject<DialogRef | null>;
};

export type DialogContextValue = {
  open: <K extends DialogType>(
    type: K,
    options?: OpenDialogTypeOptions & {
      props?: DialogPropsUpdater<K>;
    },
  ) => DialogInstance<K>;
  queue: <K extends DialogType>(
    type: K,
    options?: OpenDialogTypeOptions & {
      props?: DialogPropsUpdater<K>;
    },
  ) => Promise<void>;
  updateProps: <K extends DialogType>(type: K, updater: DialogPropsUpdater<K>) => void;
  closeTop: (options?: DialogCloseOptions) => void;
  close: (type?: DialogType, options?: DialogCloseOptions) => Promise<void>;
};
