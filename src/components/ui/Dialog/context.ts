import { createContext, useContext } from 'react';

import type { DialogContextValue } from './Dialog';

/** Provider 与 useDialog 之间共享的上下文 */
export const DialogContext = createContext<DialogContextValue | null>(null);

/** Hook 使用 */
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within DialogProvider');

  return context;
};

// 全局 dialog 实例，供 React 组件树之外的模块使用
let globalDialogInstance: DialogContextValue | null = null;

/** 由 DialogProvider 在渲染时同步最新实例 */
export const setGlobalDialog = (dialog: DialogContextValue) => {
  globalDialogInstance = dialog;
};

/** 获取已经初始化的全局 dialog 实例 */
export const getGlobalDialog = () => {
  if (!globalDialogInstance) {
    throw new Error('DialogProvider 尚未初始化，无法使用全局 dialog');
  }

  return globalDialogInstance;
};
