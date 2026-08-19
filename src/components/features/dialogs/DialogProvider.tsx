import React, {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Dialog, type DialogCloseOptions, type DialogRef } from '@/components/ui/Dialog';
import { ZIndex } from '@/constants/z-index';

import { DialogContext, setGlobalDialog } from './context';
import { dialogRegistry } from './index';
import type {
  DialogContextValue,
  DialogInstance,
  DialogPropsUpdater,
  DialogType,
  OpenDialogTypeOptions,
  PropsOf,
} from './types';

const createDialogId = () => `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;

type StoredDialogInstance = Omit<DialogInstance, 'props' | 'updateProps'> & {
  props: unknown;
  updateProps: (updater: unknown) => void;
};

const createRegisteredDialogElement = (
  RegisteredDialog: React.ComponentType<Record<string, unknown>>,
  componentProps: unknown,
) => {
  const resolvedProps = (componentProps ?? {}) as Record<string, unknown>;

  return <RegisteredDialog {...resolvedProps} />;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogs, setDialogs] = useState<StoredDialogInstance[]>([]);
  const dialogsRef = useRef<StoredDialogInstance[]>([]);
  const zIndexBaseRef = useRef(ZIndex.Dialog);

  const updateDialogs = useCallback(
    (updater: (prev: StoredDialogInstance[]) => StoredDialogInstance[]) => {
      setDialogs((prev) => {
        const next = updater(prev);
        dialogsRef.current = next;
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const handlePopstate = () => {
      dialogsRef.current.forEach((dialog) => {
        if (dialog.closeOnPopstate) {
          dialog.dialogRef?.current?.setIsExiting('popstate');
        }
      });
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  const open = <K extends DialogType>(
    type: K,
    options?: OpenDialogTypeOptions & {
      props?: DialogPropsUpdater<K>;
    },
  ): DialogInstance<K> => {
    const { props, onAfterClose, closeOnPopstate = true, ...dialogProps } = options ?? {};
    const initialProps = typeof props === 'function' ? props(null) : props;
    const existing = dialogsRef.current.find((dialog) => dialog.type === type);

    if (!dialogProps.multiple && existing) {
      if (props !== undefined) existing.updateProps(props);
      existing.onAfterClose = onAfterClose;
      return existing as unknown as DialogInstance<K>;
    }

    const RegisteredDialog = dialogRegistry[type] as React.ComponentType<Record<string, unknown>>;
    if (!RegisteredDialog) throw new Error(`Dialog "${type}" is not registered`);

    const dialogKey = createDialogId();
    const instance: StoredDialogInstance = {
      key: dialogKey,
      type,
      props: initialProps,
      zIndex: Math.min(zIndexBaseRef.current++, 9999),
      closeOnPopstate,
      content: null,
      requestClose: () => {},
      updateProps: () => {},
      onAfterClose,
    };
    const dialogRef = React.createRef<DialogRef | null>();

    instance.dialogRef = dialogRef;
    instance.requestClose = (closeOptions?: DialogCloseOptions) => {
      dialogRef.current?.setIsExiting(closeOptions?.reason);
    };
    instance.content = (
      <Dialog
        ref={dialogRef}
        key={dialogKey}
        {...dialogProps}
        dialogId={dialogProps.dialogId ?? dialogProps.dataName ?? type}
        closeOnPopstate={closeOnPopstate}
        managedByProvider
        setAfterClosePromise={(promise) => {
          instance.afterClosePromise = promise;
        }}
        onAfterClose={(event) => {
          updateDialogs((prev) => prev.filter((dialog) => dialog.key !== dialogKey));
          instance.onAfterClose?.(event);
        }}
      >
        {createRegisteredDialogElement(RegisteredDialog, instance.props)}
      </Dialog>
    );

    instance.updateProps = (updater) => {
      const typedUpdater = updater as DialogPropsUpdater<K>;

      updateDialogs((prev) =>
        prev.map<StoredDialogInstance>((dialog) => {
          if (dialog.key !== dialogKey) return dialog;

          const prevProps = dialog.props as PropsOf<typeof type>;
          const nextProps =
            typeof typedUpdater === 'function'
              ? typedUpdater(prevProps)
              : Object.assign({}, prevProps, typedUpdater);

          if (!React.isValidElement(dialog.content)) {
            return { ...dialog, props: nextProps };
          }

          const parent = dialog.content as ReactElement<{ children?: ReactNode }>;

          return {
            ...dialog,
            props: nextProps,
            content: React.cloneElement(
              parent,
              {},
              createRegisteredDialogElement(RegisteredDialog, nextProps),
            ),
          };
        }),
      );
    };

    updateDialogs((prev) => [...prev, instance]);
    return instance as unknown as DialogInstance<K>;
  };

  const queue = async <K extends DialogType>(
    type: K,
    options?: OpenDialogTypeOptions & {
      props?: DialogPropsUpdater<K>;
    },
  ) => {
    return new Promise<void>((resolve) => {
      open(type, {
        ...options,
        onAfterClose(event) {
          options?.onAfterClose?.(event);
          resolve();
        },
      });
    });
  };

  const closeTop = (closeOptions?: DialogCloseOptions) =>
    dialogsRef.current.at(-1)?.requestClose(closeOptions);

  const close = async (type?: DialogType, closeOptions?: DialogCloseOptions) => {
    const promises: Promise<void>[] = [];
    dialogsRef.current
      .filter((dialog) => !type || dialog.type === type)
      .forEach((dialog) => {
        dialog.requestClose(closeOptions);
        if (dialog.afterClosePromise) promises.push(dialog.afterClosePromise);
      });
    await Promise.all(promises);
  };

  const updateProps = <K extends DialogType>(type: K, updater: DialogPropsUpdater<K>) => {
    const dialog = dialogsRef.current.find((item) => item.type === type);
    dialog?.updateProps(updater);
  };

  const dialogValue: DialogContextValue = { open, queue, closeTop, close, updateProps };
  const dialogContent = useMemo(() => dialogs.map((dialog) => dialog.content), [dialogs]);

  useEffect(() => {
    setGlobalDialog(dialogValue);
  });

  useEffect(() => () => setGlobalDialog(null), []);

  return (
    <DialogContext.Provider value={dialogValue}>
      {children}
      {dialogContent}
    </DialogContext.Provider>
  );
};
