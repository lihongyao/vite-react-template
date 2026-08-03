import type { Key, ReactNode } from 'react';

import { cn } from '@/libs/class-helpers';

/** 步骤状态：等待、成功或失败。 */
export type StepStatus = 'default' | 'success' | 'error';

/** 按步骤状态配置图标，未配置的状态会继续使用下一级兜底图标。 */
export type StepsIcons = Partial<Record<StepStatus, ReactNode>>;

/** 连接线进度：已经过或尚未经过。 */
export type StepLineState = 'passed' | 'pending';

/** 按连接线进度配置类名。 */
export type StepsLineClassNames = Partial<Record<StepLineState, string>>;

export interface StepsItem {
  /** 用于 React 列表渲染的稳定标识；未传时使用数组索引。 */
  key?: Key;
  /** 步骤标题。 */
  title: ReactNode;
  /** 标题下方的辅助描述。 */
  description?: ReactNode;
  /** 当前步骤状态，默认为 `default`。 */
  status?: StepStatus;
  /** 当前节点在所有状态下共用的图标，优先级高于 Steps 的全局 `icons`。 */
  icon?: ReactNode;
  /** 当前节点的状态图标，优先级高于 `icon` 和 Steps 的全局 `icons`。 */
  icons?: StepsIcons;
  /** 连接至当前节点的线条类名，优先级高于 Steps 的全局 `lineClassNames`。 */
  lineClassNames?: StepsLineClassNames;
}

export interface StepsProps {
  /** 按展示顺序排列的步骤数据。 */
  items: readonly StepsItem[];
  /** 当前已到达步骤的索引，从 0 开始；默认为 0。 */
  current?: number;
  /** 全局状态图标；节点未配置对应图标时使用。 */
  icons?: StepsIcons;
  /** 根列表元素的自定义类名。 */
  className?: string;
  /** 步骤标题的自定义类名。 */
  titleClassName?: string;
  /** 步骤描述的自定义类名。 */
  descriptionClassName?: string;
  /** 全局状态连接线类名；节点未配置对应状态时使用。 */
  lineClassNames?: StepsLineClassNames;
  /** 步骤列表的无障碍名称，默认为 `Progress`。 */
  ariaLabel?: string;
}

const statusColorClasses: Record<StepStatus, string> = {
  default: 'text-[#9ca3af]',
  success: 'text-[#16a34a]',
  error: 'text-[#dc2626]',
};

const statusLabels: Record<StepStatus, string> = {
  default: 'Pending',
  success: 'Completed',
  error: 'Failed',
};

export default function Steps({
  items,
  current = 0,
  icons,
  className,
  titleClassName,
  descriptionClassName,
  lineClassNames,
  ariaLabel = 'Progress',
}: StepsProps) {
  return (
    <ol aria-label={ariaLabel} className={cn('ui-steps', className)}>
      {items.map((item, index) => {
        const status = item.status ?? 'default';
        const customIcon = item.icons?.[status] ?? item.icon ?? icons?.[status];
        const incomingLineState: StepLineState = index <= current ? 'passed' : 'pending';
        const incomingLineClassName =
          item.lineClassNames?.[incomingLineState] ?? lineClassNames?.[incomingLineState];
        const nextItem = items[index + 1];
        const outgoingLineState: StepLineState = index + 1 <= current ? 'passed' : 'pending';
        const outgoingLineClassName =
          nextItem?.lineClassNames?.[outgoingLineState] ?? lineClassNames?.[outgoingLineState];
        const isLast = index === items.length - 1;

        return (
          <li
            key={item.key ?? index}
            data-status={status}
            className="relative grid min-h-10 grid-cols-[20px_minmax(0,1fr)] gap-x-3 pb-5 last:pb-0"
          >
            <div aria-hidden className="relative flex min-h-5 items-center justify-center">
              {index > 0 ? (
                <span
                  className={cn(
                    'absolute top-0 bottom-[calc(50%+14px)] left-[9.5px] w-px bg-[#d1d5db]',
                    incomingLineClassName,
                  )}
                />
              ) : null}
              {!isLast ? (
                <span
                  className={cn(
                    'absolute top-[calc(50%+14px)] -bottom-5 left-[9.5px] w-px bg-[#d1d5db]',
                    outgoingLineClassName,
                  )}
                />
              ) : null}
              <div
                className={cn(
                  'relative z-10 flex size-5 shrink-0 items-center justify-center',
                  statusColorClasses[status],
                )}
              >
                {customIcon ?? <span className="size-2.5 rounded-full bg-current" />}
              </div>
            </div>

            <div className="min-w-0 pt-px">
              <div className={cn('text-sm leading-5 font-medium text-[#1f2937]', titleClassName)}>
                <span className="sr-only">{statusLabels[status]}: </span>
                {item.title}
              </div>
              {item.description !== undefined && item.description !== null ? (
                <div
                  className={cn(
                    'mt-0.5 text-xs leading-[18px] text-[#6b7280]',
                    descriptionClassName,
                  )}
                >
                  {item.description}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
