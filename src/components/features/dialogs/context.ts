import { createContext, useContext } from 'react';

import type { DialogContextValue } from './types';

export type { DialogContextValue } from './types';

export const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within DialogProvider');

  return context;
};

let globalDialogInstance: DialogContextValue | null = null;

export const setGlobalDialog = (dialog: DialogContextValue | null) => {
  globalDialogInstance = dialog;
};

export const getGlobalDialog = () => {
  if (!globalDialogInstance) {
    throw new Error('DialogProvider 尚未初始化，无法使用全局 dialog');
  }

  return globalDialogInstance;
};
