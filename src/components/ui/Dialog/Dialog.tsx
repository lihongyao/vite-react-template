'use client';

import React, {
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';

import { type Root, createRoot } from 'react-dom/client';

import { ZIndex } from '@/constants/z-index';
import { cn } from '@/libs/class-helpers';
import { lockDocumentScroll, unlockDocumentScroll } from '@/libs/scroll-lock';

import './animate.css';

/** 进入动画 */
export type DialogEnterAnimation = 'fade-in' | 'zoom-in' | 'slide-up-in' | 'slide-right-in';
/** 退出动画 */
export type DialogExitAnimation = 'fade-out' | 'zoom-out' | 'slide-up-out' | 'slide-right-out';

/** Dialog 内置关闭原因 */
export type DialogBuiltInCloseReason = 'manual' | 'mask' | 'autoDestroy' | 'popstate';
/** Dialog 关闭原因：保留内置值补全，同时允许业务传入自定义字符串 */
export type DialogCloseReason = DialogBuiltInCloseReason | (string & Record<never, never>);
export type DialogCloseOptions = {
  reason?: DialogCloseReason;
};
export type DialogAfterCloseEvent = {
  reason: DialogCloseReason;
  stayDurationMs: number;
};

const createDialogId = () => `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;

/** 锁住 body 滚动 */
/** 对外暴露的 Ref 方法类型 */
export interface DialogRef {
  setIsExiting: (reason?: DialogCloseReason) => void;
}

type StartCloseOptions = {
  viaControlledOnClose?: boolean;
};

// === 全局 Dialog 基础 ===

/** Dialog 组件 props */
export interface DialogProps {
  /** 类名 - 遮罩 */
  maskClassName?: string;
  /** 类名 - 内容 */
  contentClassName?: string;
  /** 弹框是否打开（受控模式，仅作为组件调用时有效） */
  open?: boolean;
  /** 弹框层级，默认4000 */
  zIndex?: number;
  /** 弹框内容 */
  children: ReactNode;
  /** 是否允许点击遮罩关闭，默认true */
  maskClosable?: boolean;
  /** 自动销毁 */
  autoDestroy?: number;
  /** 进入动画，默认zoom-in */
  enterAnimation?: DialogEnterAnimation;
  /** 退出动画，默认zoom-out */
  exitAnimation?: DialogExitAnimation;
  /** 是否允许同一类型 Dialog 同时打开多个实例 */
  multiple?: boolean;
  /** 弹窗标识（useDialog.open 场景建议直接用 type） */
  dialogId?: string;
  /** 兼容旧参数：等价于 dialogId */
  dataName?: string;

  /** 用户意图关闭（仅受控模式触发） */
  onClose?: (open: boolean) => void;
  /** 弹窗完全关闭后触发（任何模式） */
  onAfterClose?: (event: DialogAfterCloseEvent) => void;

  /** 路由前进/后退时是否自动关闭，默认true */
  closeOnPopstate?: boolean;
  /** 内部使用，标记是否由 Provider 管理，避免重复监听 popstate */
  managedByProvider?: boolean;
  /** 内部使用：设置动画结束 promise */
  setAfterClosePromise?: (p: Promise<void>) => void;
}

// === Dialog 组件 ===

/** 支持 forwardRef，以便静态方法或 Provider 控制弹窗关闭 */
const DialogComponent = forwardRef<DialogRef, DialogProps>((props, ref) => {
  const {
    open,
    children,
    zIndex = ZIndex.Dialog,
    maskClosable = true,
    autoDestroy,
    dialogId,
    dataName,
    maskClassName,
    contentClassName,
    enterAnimation = 'zoom-in',
    exitAnimation = 'zoom-out',
    onClose,
    onAfterClose,
    closeOnPopstate = true,
    managedByProvider = false,
    setAfterClosePromise,
  } = props;

  // 是否为受控组件（通过是否显式传入 open 判断）
  const isControlled = open !== undefined;

  // states
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open ?? true);
  const [isExiting, setIsExiting] = useState(false);

  // refs
  const instanceId = useRef(createDialogId());
  const resolvedDialogId = dialogId ?? dataName ?? instanceId.current;
  const autoDestroyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const afterCloseResolveRef = useRef<(() => void) | null>(null);
  const closeReasonRef = useRef<DialogCloseReason>('manual');
  const isAnimatingRef = useRef(false);
  const openStartedAtRef = useRef<number | null>(Date.now());

  const startClose = useCallback(
    (
      reason: DialogCloseReason = 'manual',
      { viaControlledOnClose = false }: StartCloseOptions = {},
    ) => {
      if (isAnimatingRef.current) return false;
      closeReasonRef.current = reason;

      if (isControlled && viaControlledOnClose) {
        onClose?.(false);
        return true;
      }

      isAnimatingRef.current = true;
      setIsExiting(true);
      return true;
    },
    [isControlled, onClose],
  );

  useImperativeHandle(ref, () => ({
    setIsExiting: (reason: DialogCloseReason = 'manual') => {
      startClose(reason);
    },
  }));

  // 初始化挂载；非受控模式下首次展示时也标记为动画中，避免在进入动画期间重复触发
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && visible && !isExiting) {
      isAnimatingRef.current = true;
      if (openStartedAtRef.current === null) {
        openStartedAtRef.current = Date.now();
      }
    }
  }, [isExiting, mounted, visible]);

  // 创建动画结束 promise
  useEffect(() => {
    const p = new Promise<void>((resolve) => {
      afterCloseResolveRef.current = resolve;
    });
    setAfterClosePromise?.(p);
  }, [setAfterClosePromise]);

  // 响应受控组件 open 状态变化（动画中忽略重复的 open/close 切换）
  useEffect(() => {
    if (!isControlled) return;
    if (open) {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      setVisible(true);
      setIsExiting(false);
      closeReasonRef.current = 'manual'; // 重置 reason
    } else if (visible) {
      // 受控模式下，open 变为 false 时，沿用最近一次 close reason
      startClose(closeReasonRef.current);
    }
  }, [isControlled, open, startClose, visible]);

  // 自动销毁逻辑
  useEffect(() => {
    if (!autoDestroy || !visible) return undefined;
    autoDestroyTimer.current = setTimeout(() => {
      startClose('autoDestroy');
    }, autoDestroy * 1000);
    return () => {
      if (autoDestroyTimer.current) clearTimeout(autoDestroyTimer.current);
      autoDestroyTimer.current = null;
    };
  }, [autoDestroy, startClose, visible]);

  // 用户触发关闭意图（遮罩/closeDialog）- 动画中忽略重复触发
  const requestClose = (reason: DialogCloseReason = 'manual') => {
    // 受控模式下，通知父组件改 open；非受控模式直接触发退出动画
    startClose(reason, { viaControlledOnClose: true });
  };

  // 点击遮罩关闭
  const handleMaskClick = () => {
    if (!maskClosable) return;
    requestClose('mask');
  };

  // 动画结束处理（进入/退出动画结束时解除「动画中」锁）
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!isExiting) {
      // 进入动画结束，允许后续交互
      isAnimatingRef.current = false;
      return;
    }

    setVisible(false);
    setIsExiting(false);
    isAnimatingRef.current = false;

    const reason = closeReasonRef.current;
    const endAt = Date.now();
    const stayDurationMs =
      openStartedAtRef.current === null ? 0 : Math.max(0, endAt - openStartedAtRef.current);
    const eventPayload: DialogAfterCloseEvent = { reason, stayDurationMs };
    openStartedAtRef.current = null;
    onAfterClose?.(eventPayload);
    afterCloseResolveRef.current?.();
  };

  // 在可见期间锁定文档滚动，支持多个弹层同时存在
  useEffect(() => {
    if (visible && !isExiting) {
      lockDocumentScroll();
    }
    return () => {
      unlockDocumentScroll();
    };
  }, [visible, isExiting]);

  // popstate 关闭
  useEffect(() => {
    // 如果关闭功能被禁用，或者由 Provider 管理，则跳过
    if (!closeOnPopstate || managedByProvider) return undefined;
    const handlePopstate = () => {
      startClose('popstate');
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [closeOnPopstate, managedByProvider, startClose]);

  if (!mounted || !visible) return null;

  const content = (
    <div
      data-name={resolvedDialogId}
      className="dialog-root app-fixed-frame fixed inset-y-0 flex items-center justify-center"
      style={{ zIndex }}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/70 backdrop-blur-xs',
          isExiting ? 'fade-out' : 'fade-in',
          maskClassName,
        )}
        onAnimationEnd={handleAnimationEnd}
      />
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 h-full w-full cursor-default"
        disabled={!maskClosable}
        onClick={handleMaskClick}
      />
      <div className={cn('relative', isExiting ? exitAnimation : enterAnimation, contentClassName)}>
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
});

// === 导出 Dialog ===
export const Dialog = DialogComponent as typeof DialogComponent & {
  open: (options: DialogStaticOptions) => {
    key: string;
    close: (options?: DialogCloseOptions) => Promise<void>;
  };
  close: (key?: string, options?: DialogCloseOptions) => Promise<void>;
};

// === 静态方法管理 ===

type DialogStaticOptions = Omit<DialogProps, 'open' | 'children' | 'onClose'> & {
  content: ReactNode;
};

type DialogEntry = {
  root: Root;
  container: HTMLDivElement;
  key: string;
  closeDialog: (reason?: DialogCloseReason) => void;
  promise?: Promise<void>;
};

let dialogZIndex = ZIndex.Dialog;
const dialogMap = new Map<string, DialogEntry>();

Dialog.open = (options: DialogStaticOptions) => {
  const key = createDialogId();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  let resolveFn: (() => void) | null = null;
  const promise = new Promise<void>((resolve) => {
    resolveFn = resolve;
  });

  const dialogRef: { current: DialogRef | null } = { current: null };

  const closeDialog = (reason?: DialogCloseReason) => dialogRef.current?.setIsExiting(reason);

  root.render(
    <DialogComponent
      ref={dialogRef}
      maskClosable={options.maskClosable}
      autoDestroy={options.autoDestroy}
      contentClassName={options.contentClassName}
      maskClassName={options.maskClassName}
      zIndex={options.zIndex ?? dialogZIndex++}
      managedByProvider
      dialogId={options.dialogId ?? options.dataName}
      setAfterClosePromise={(p) => p.then(() => resolveFn?.())}
      onAfterClose={(event) => {
        root.unmount();
        container.remove();
        dialogMap.delete(key);
        options.onAfterClose?.(event);
      }}
    >
      {options.content}
    </DialogComponent>,
  );

  dialogMap.set(key, { root, container, key, closeDialog, promise });

  return {
    key,
    close: (closeOptions?: DialogCloseOptions) => {
      const entry = dialogMap.get(key);
      if (entry) {
        entry.closeDialog(closeOptions?.reason);
        return entry.promise ?? Promise.resolve();
      }
      return Promise.resolve();
    },
  };
};

Dialog.close = async (key?: string, closeOptions?: DialogCloseOptions) => {
  if (key) {
    const entry = dialogMap.get(key);
    if (!entry) return;
    entry.closeDialog(closeOptions?.reason);
    return entry.promise;
  }

  const promises: Promise<void>[] = [];
  dialogMap.forEach((entry) => {
    entry.closeDialog(closeOptions?.reason);
    if (entry.promise) promises.push(entry.promise);
  });
  await Promise.all(promises);
};
