'use client';

import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Icon, { type IconName } from '@/components/ui/Icon';
import { ZIndex } from '@/constants/z-index';
import { cn } from '@/libs/class-helpers';

type MessageType = 'success' | 'info' | 'warning' | 'error';

interface MessageConfig {
  content: ReactNode;
  type?: MessageType;
  duration?: number | null;
}

interface MessageItem {
  id: number;
  content: ReactNode;
  type: MessageType;
  duration: number | null;
  leaving: boolean;
}

interface MessageApi {
  open: (config: MessageConfig) => void;
  success: (content: ReactNode, duration?: number | null) => void;
  info: (content: ReactNode, duration?: number | null) => void;
  warning: (content: ReactNode, duration?: number | null) => void;
  error: (content: ReactNode, duration?: number | null) => void;
  destroy: () => void;
}

const DEFAULT_DURATION = 1.5;

const TYPE_META: Record<
  MessageType,
  {
    icon: IconName;
    color: string;
  }
> = {
  success: {
    icon: 'tips_correct',
    color: '#31ED87',
  },
  info: {
    icon: 'tips_system',
    color: '#31ED87',
  },
  warning: {
    icon: 'tips_warning',
    color: '#FFB24B',
  },
  error: {
    icon: 'tips_error',
    color: '#FC0048',
  },
};

const MessageApiContext = createContext<[MessageApi] | null>(null);

function MessageProvider({ children }: PropsWithChildren) {
  const nextIdRef = useRef(0);
  const [item, setItem] = useState<MessageItem | null>(null);

  const remove = useCallback((id: number) => {
    setItem((current) => (current?.id === id ? null : current));
  }, []);

  const close = useCallback(() => {
    setItem((current) => (current && !current.leaving ? { ...current, leaving: true } : current));
  }, []);

  const open = useCallback((config: MessageConfig) => {
    nextIdRef.current += 1;
    setItem({
      id: nextIdRef.current,
      content: config.content,
      type: config.type ?? 'info',
      duration: config.duration === undefined ? DEFAULT_DURATION : config.duration,
      leaving: false,
    });
  }, []);

  const api = useMemo<MessageApi>(
    () => ({
      open,
      success: (content, duration) => open({ content, duration, type: 'success' }),
      info: (content, duration) => open({ content, duration, type: 'info' }),
      warning: (content, duration) => open({ content, duration, type: 'warning' }),
      error: (content, duration) => open({ content, duration, type: 'error' }),
      destroy: close,
    }),
    [close, open],
  );

  const apiValue = useMemo<[MessageApi]>(() => [api], [api]);

  return (
    <MessageApiContext.Provider value={apiValue}>
      {children}
      <MessageViewport item={item} close={close} remove={remove} />
    </MessageApiContext.Provider>
  );
}

function MessageToast({
  item,
  onClose,
  onExited,
}: {
  item: MessageItem;
  onClose: () => void;
  onExited: (id: number) => void;
}) {
  const { icon, color } = TYPE_META[item.type];
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  useEffect(() => {
    clearTimer();

    if (item.leaving || item.duration === null || item.duration <= 0) return undefined;

    timeoutRef.current = setTimeout(() => {
      onClose();
    }, item.duration * 1000);

    return clearTimer;
  }, [item.id, item.duration, item.leaving, onClose]);

  useEffect(
    () => () => {
      clearTimer();
    },
    [],
  );

  return (
    <output
      data-name="MessageToast"
      className={cn(
        'pointer-events-auto flex max-w-[calc(100vw-32px)] items-center gap-2 rounded-lg bg-[#2D2D2D]/96 px-4 py-3 text-sm leading-[20px] font-semibold text-white shadow-[0_16px_44px_rgba(0,0,0,0.28)] backdrop-blur-[10px]',
        item.leaving ? 'animate-message-leave' : 'animate-message-enter',
      )}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (item.leaving) onExited(item.id);
      }}
      aria-live="polite"
    >
      <Icon name={icon} className="block size-[20px] shrink-0" color={color} />
      <span className="min-w-0 break-words">{item.content}</span>
    </output>
  );
}

function MessageViewport({
  item,
  close,
  remove,
}: {
  item: MessageItem | null;
  close: () => void;
  remove: (id: number) => void;
}) {
  if (!item) return null;

  return (
    <div
      data-name="Message"
      className="app-fixed-frame pointer-events-none fixed inset-y-0 flex items-center justify-center px-4"
      style={{ zIndex: ZIndex.Message }}
    >
      <MessageToast key={item.id} item={item} onClose={close} onExited={remove} />
    </div>
  );
}

function useMessage(): [MessageApi] {
  const context = useContext(MessageApiContext);
  if (!context) {
    throw new Error('message.useMessage 必须在 <MessageProvider /> 内使用');
  }
  return context;
}

const message = {
  useMessage,
};

// oxlint-disable-next-line react/only-export-components
export { MessageProvider, message };
export type { MessageApi, MessageConfig, MessageType };
