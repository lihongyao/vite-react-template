import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import Popup from '@/components/ui/Popup';
import { cn } from '@/libs/class-helpers';

export interface DataPickerProps<T> {
  /** Header 标题。 */
  title: string;
  /** 可选择的数据列表。 */
  items: T[];
  /** 自定义触发器内容。 */
  children: ReactNode;
  /** 自定义每个选项的展示内容。 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 点击选项时触发。 */
  onClick: (item: T, index: number) => void;
  /** 是否禁用触发器。 */
  disabled?: boolean;
  /** 选择后是否自动关闭，默认关闭。 */
  closeOnSelect?: boolean;
  /** 受控打开状态。 */
  open?: boolean;
  /** 非受控初始打开状态。 */
  defaultOpen?: boolean;
  /** 打开状态改变时触发。 */
  onOpenChange?: (open: boolean) => void;
  /** 点击遮罩是否关闭，默认关闭。 */
  closeOnClickOverlay?: boolean;
  /** 关闭按钮的无障碍名称。 */
  closeAriaLabel?: string;
  /** 触发器样式。 */
  triggerClassName?: string;
  /** Popup 遮罩层样式。 */
  popupClassName?: string;
  /** Popup 面板样式。 */
  contentClassName?: string;
  /** Header 样式。 */
  headerClassName?: string;
  /** 列表容器样式。 */
  listClassName?: string;
  /** 单个选项样式。 */
  itemClassName?: string;
}

export default function DataPicker<T>({
  title,
  items,
  children,
  renderItem,
  onClick,
  disabled = false,
  closeOnSelect = true,
  open,
  defaultOpen = false,
  onOpenChange,
  closeOnClickOverlay = true,
  closeAriaLabel = 'Close',
  triggerClassName,
  popupClassName,
  contentClassName,
  headerClassName,
  listClassName,
  itemClassName,
}: DataPickerProps<T>) {
  const generatedId = useId();
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const visible = isControlled ? open : innerOpen;
  const titleId = `${generatedId}-title`;
  const dialogId = `${generatedId}-dialog`;

  const setVisible = (nextOpen: boolean) => {
    if (!isControlled) setInnerOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const handleItemClick = (item: T, index: number) => {
    onClick(item, index);
    if (closeOnSelect) setVisible(false);
  };

  return (
    <>
      <button
        type="button"
        aria-controls={dialogId}
        aria-expanded={visible}
        aria-haspopup="dialog"
        className={cn(
          'block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          triggerClassName,
        )}
        disabled={disabled}
        onClick={() => setVisible(true)}
      >
        {children}
      </button>

      <Popup
        visible={visible}
        className={cn('ui-data-picker', popupClassName)}
        closeOnClickOverlay={closeOnClickOverlay}
        contentClassName={cn('min-h-0', contentClassName)}
        onClose={setVisible}
      >
        <dialog
          id={dialogId}
          open
          aria-labelledby={titleId}
          aria-modal="true"
          className="relative inset-auto m-0 flex min-h-0 w-full max-w-none flex-col border-0 bg-transparent p-0 text-inherit"
          style={{ maxHeight: '80dvh' }}
        >
          <div
            className={cn(
              'flex h-14 shrink-0 items-center gap-3 border-b border-[#e5e7eb] px-4',
              headerClassName,
            )}
          >
            <h2
              id={titleId}
              className="min-w-0 flex-1 truncate text-base font-semibold text-[#1f2937]"
            >
              {title}
            </h2>
            <button
              type="button"
              aria-label={closeAriaLabel}
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6b7280] transition-colors outline-none hover:bg-[#f3f4f6] hover:text-[#1f2937] focus-visible:ring-2 focus-visible:ring-[#16a34a]"
              onClick={() => setVisible(false)}
            >
              <span
                aria-hidden
                className="relative block size-4 before:absolute before:top-1/2 before:left-0 before:h-[1.5px] before:w-full before:-translate-y-1/2 before:rotate-45 before:rounded-full before:bg-current before:content-[''] after:absolute after:top-1/2 after:left-0 after:h-[1.5px] after:w-full after:-translate-y-1/2 after:-rotate-45 after:rounded-full after:bg-current after:content-['']"
              />
            </button>
          </div>

          <div
            className={cn(
              'scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]',
              listClassName,
            )}
          >
            {items.map((item, index) => (
              <button
                type="button"
                className={cn(
                  'block min-h-12 w-full cursor-pointer border-b border-[#eee] px-4 py-3 text-left text-[#374151] transition-colors outline-none last:border-b-0 hover:bg-[#f7f8f8] focus-visible:bg-[#f0f7f3]',
                  itemClassName,
                )}
                key={index}
                onClick={() => handleItemClick(item, index)}
              >
                {renderItem(item, index)}
              </button>
            ))}
          </div>
        </dialog>
      </Popup>
    </>
  );
}
