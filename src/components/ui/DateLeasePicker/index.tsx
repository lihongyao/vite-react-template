import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode, UIEvent } from 'react';

import Icon from '@/components/ui/Icon';
import Popup from '@/components/ui/Popup';
import { cn } from '@/libs/class-helpers';

import {
  createLeasePickerResult,
  dateFormat,
  getDefaultResult,
  getLengthOfLease,
  getPickerColumns,
  getResultFromPicker,
  parseDateTime,
  renderColumnItemForDate,
} from './helper';
import type {
  DateColumnValue,
  LeaseDateRange,
  LeasePickerResult,
  LeasePickerType,
  PickerValue,
} from './helper';

export type { LeasePickerResult as DateLeasePickerResult } from './helper';

export interface DateLeasePickerRef {
  open: (options: { type: LeasePickerType }) => void;
  close: () => void;
}

export interface DateLeasePickerProps {
  children?: ReactNode;
  /** 营业时间，格式：HH:mm - HH:mm。 */
  businessHours?: string;
  /** 默认值，结构与 onSure 回调值一致。 */
  defaultValue?: LeasePickerResult;
  /** 选择区间至少多少天，默认 1。 */
  minDays?: number;
  /** 从当前时间开始计算的可选天数，默认 60。 */
  countDays?: number;
  /** 固定开始时间；传入后仅支持调整结束时间，常用于续租。 */
  fixedDateForStart?: Date;
  /** 开始、结束时间标签。 */
  labelText?: Partial<Record<LeasePickerType, string>>;
  /** 对应原组件的 @sure 事件。 */
  onSure: (value: LeasePickerResult) => void;
  /** 对应原组件的 uni.showToast，用于接入项目消息提示。 */
  onNotice?: (message: string) => void;
  className?: string;
  contentClassName?: string;
}

interface WheelOption<T> {
  key: string;
  label: string;
  value: T;
}

interface WheelColumnProps<T> {
  ariaLabel: string;
  options: WheelOption<T>[];
  value: T;
  visible: boolean;
  onChange: (value: T) => void;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const WHEEL_PADDING = (VIEWPORT_HEIGHT - ITEM_HEIGHT) / 2;
const LOG_SEPARATOR = '————————————————————————————————————';

function WheelColumn<T>({ ariaLabel, options, value, visible, onChange }: WheelColumnProps<T>) {
  // -- refs
  const listRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number | undefined>(undefined);

  // -- computed
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  // -- effects
  useEffect(() => {
    if (!visible || !listRef.current) return;
    const targetScrollTop = activeIndex * ITEM_HEIGHT;
    if (Math.abs(listRef.current.scrollTop - targetScrollTop) > ITEM_HEIGHT / 2) {
      listRef.current.scrollTo({ top: targetScrollTop });
    }
  }, [activeIndex, options.length, visible]);

  useEffect(
    () => () => {
      if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
    },
    [],
  );

  // -- methods
  const selectIndex = (index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), options.length - 1);
    const nextOption = options[safeIndex];
    if (nextOption && nextOption.value !== value) onChange(nextOption.value);
  };

  // -- events
  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
    frameIdRef.current = requestAnimationFrame(() => {
      selectIndex(Math.round(scrollTop / ITEM_HEIGHT));
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex;
    if (event.key === 'ArrowDown') nextIndex += 1;
    else if (event.key === 'ArrowUp') nextIndex -= 1;
    else if (event.key === 'PageDown') nextIndex += VISIBLE_ROWS;
    else if (event.key === 'PageUp') nextIndex -= VISIBLE_ROWS;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = options.length - 1;
    else return;

    event.preventDefault();
    nextIndex = Math.min(Math.max(nextIndex, 0), options.length - 1);
    selectIndex(nextIndex);
    listRef.current?.scrollTo({ top: nextIndex * ITEM_HEIGHT, behavior: 'smooth' });
  };

  return (
    <div className="relative min-w-0 flex-1">
      <div
        ref={listRef}
        className="scrollbar-hidden relative z-10 overflow-y-auto overscroll-contain"
        style={{
          height: VIEWPORT_HEIGHT,
          paddingBlock: WHEEL_PADDING,
          scrollSnapType: 'y mandatory',
        }}
        onScroll={onScroll}
      >
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <button
              type="button"
              aria-label={`${ariaLabel} ${option.label}`}
              aria-current={selected ? 'true' : undefined}
              className={cn(
                'flex w-full items-center justify-center px-1 text-center text-sm text-[#737373] outline-none select-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-inset',
                selected && 'font-semibold text-[#202124]',
              )}
              key={option.key}
              style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                selectIndex(index);
                listRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
              }}
              onKeyDown={onKeyDown}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 z-0 border-y border-[#e5e7eb] bg-[#f7f8fa]"
        style={{ top: WHEEL_PADDING, height: ITEM_HEIGHT }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-white via-white/80 to-transparent"
        style={{ height: WHEEL_PADDING }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-white via-white/80 to-transparent"
        style={{ height: WHEEL_PADDING }}
      />
    </div>
  );
}

export default forwardRef<DateLeasePickerRef, DateLeasePickerProps>(function DateLeasePicker(
  {
    children,
    businessHours = '09:00 - 18:00',
    defaultValue,
    minDays = 1,
    countDays = 60,
    fixedDateForStart,
    labelText: labelTextProp,
    onSure,
    onNotice,
    className,
    contentClassName,
  },
  ref,
) {
  // -- refs
  const generatedId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onSureRef = useRef(onSure);
  const onNoticeRef = useRef(onNotice);
  const didEmitDefaultRef = useRef(false);
  onSureRef.current = onSure;
  onNoticeRef.current = onNotice;

  // -- constants
  const labels = { start: '取车时间', end: '还车时间', ...labelTextProp };
  const initialCurrentDateRef = useRef(new Date(fixedDateForStart ?? new Date()));
  const initialNoticeRef = useRef('');
  const initialResultRef = useRef<LeaseDateRange | null>(null);

  // -- defaults
  if (!initialResultRef.current) {
    const currentDate = initialCurrentDateRef.current;
    if (fixedDateForStart) {
      const start = new Date(fixedDateForStart);
      const end = new Date(start);
      end.setDate(end.getDate() + 2);
      initialResultRef.current = { start, end };
    } else {
      const fallback = getDefaultResult(currentDate, businessHours);
      if (defaultValue) {
        const start = parseDateTime(defaultValue.start.dateTimeString);
        const end = parseDateTime(defaultValue.end.dateTimeString);
        if (start < currentDate) {
          initialNoticeRef.current = `亲，${labels.start}已过当前时间，已为您修改${labels.start}`;
          initialResultRef.current = fallback;
        } else {
          initialResultRef.current = { start, end };
        }
      } else {
        initialResultRef.current = fallback;
      }
    }

    console.log(LOG_SEPARATOR);
    console.log('开始时间(默认)：', initialResultRef.current.start);
    console.log('结束时间(默认)：', initialResultRef.current.end);
    console.log(LOG_SEPARATOR);
  }
  const initialResult = initialResultRef.current;

  // -- state
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<LeasePickerType>(fixedDateForStart ? 'end' : 'start');
  const [currentDate, setCurrentDate] = useState(initialCurrentDateRef.current);
  const [result, setResult] = useState<LeaseDateRange>(initialResult);
  const [noticeMessage, setNoticeMessage] = useState(initialNoticeRef.current);

  // -- computed
  const durations = getLengthOfLease(result.start, result.end);
  const columns = getPickerColumns({ type, currentDate, result, countDays });
  const titleId = `${generatedId}-title`;
  const dateOptions: WheelOption<DateColumnValue>[] = columns.dates.map((date) => ({
    key: date === 'today' ? 'today' : String(date.getTime()),
    label: renderColumnItemForDate(date),
    value: date,
  }));
  const hourOptions: WheelOption<string>[] = columns.hours.map((hours) => ({
    key: hours,
    label: hours,
    value: hours,
  }));
  const minuteOptions: WheelOption<string>[] = columns.minutes.map((minutes) => ({
    key: minutes,
    label: minutes,
    value: minutes,
  }));

  // -- life circle
  useEffect(() => {
    if (didEmitDefaultRef.current) return;
    didEmitDefaultRef.current = true;
    // 1. 组件加载后将默认结果回传给调用者
    onSureRef.current(createLeasePickerResult(initialResult, initialCurrentDateRef.current));
    // 2. 默认值过期时保留原组件的提示行为
    if (initialNoticeRef.current) onNoticeRef.current?.(initialNoticeRef.current);
  }, [initialResult]);

  useEffect(() => {
    if (!visible) return undefined;
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  // -- methods
  const showNotice = (message: string) => {
    setNoticeMessage(message);
    onNotice?.(message);
  };

  const close = () => setVisible(false);

  const open = ({ type: nextType }: { type: LeasePickerType }) => {
    // 1. 传入固定开始时间时，仅支持修改结束时间
    if (fixedDateForStart && nextType === 'start') return;
    // 2. 更新当前类型和当前时间
    const nextCurrentDate = new Date(fixedDateForStart ?? new Date());
    let nextResult = result;
    setType(nextType);
    setCurrentDate(nextCurrentDate);
    setNoticeMessage('');
    // 3. 开始时间已过期时，重新计算默认结果并立即回传
    if (nextResult.start < nextCurrentDate) {
      const message = `亲，${labels.start}已过当前时间，已为您修改${labels.start}`;
      showNotice(message);
      nextResult = getDefaultResult(nextCurrentDate, businessHours);
      setResult(nextResult);
      console.log(LOG_SEPARATOR);
      console.log('开始时间：', nextResult.start);
      console.log('结束时间：', nextResult.end);
      console.log(LOG_SEPARATOR);
      onSureRef.current(createLeasePickerResult(nextResult, nextCurrentDate));
    }
    // 4. 展示拾取器
    setVisible(true);
  };

  const updatePickerValue = (value: PickerValue) => {
    console.log('拾取下标：', value);
    const nextResult = getResultFromPicker({
      type,
      currentDate,
      result,
      columns,
      value,
    });
    console.log(LOG_SEPARATOR);
    console.log('开始时间(临时)：', nextResult.start);
    console.log('结束时间(临时)：', nextResult.end);
    console.log(LOG_SEPARATOR);
    const nextColumns = getPickerColumns({ type, currentDate, result: nextResult, countDays });
    console.log('最新下标：', nextColumns.value);
    setResult(nextResult);
    console.log(LOG_SEPARATOR);
    console.log('开始时间：', nextResult.start);
    console.log('结束时间：', nextResult.end);
    console.log(LOG_SEPARATOR);
  };

  // -- events
  const onSwitchType = (nextType: LeasePickerType) => {
    if (fixedDateForStart) return;
    setType(nextType);
    setNoticeMessage('');
  };

  const onDateChange = (date: DateColumnValue) => {
    updatePickerValue([columns.dates.indexOf(date), columns.value[1], columns.value[2]]);
  };

  const onHourChange = (hours: string) => {
    updatePickerValue([columns.value[0], columns.hours.indexOf(hours), columns.value[2]]);
  };

  const onMinuteChange = (minutes: string) => {
    updatePickerValue([columns.value[0], columns.value[1], columns.minutes.indexOf(minutes)]);
  };

  const onConfirm = () => {
    console.log(LOG_SEPARATOR);
    console.log('租赁时长：', durations.description);
    console.log('开始时间：', result.start);
    console.log('结束时间：', result.end);
    console.log(LOG_SEPARATOR);
    // 校验租赁时长
    if (durations.day < minDays) {
      showNotice(`亲，租赁天数至少${minDays}天哟~`);
      return;
    }
    close();
    onSureRef.current(createLeasePickerResult(result, currentDate));
  };

  // -- exposes
  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <>
      {children}
      <Popup
        visible={visible}
        className={cn('ui-date-lease-picker', className)}
        contentClassName={cn('min-h-0 rounded-t-xl', contentClassName)}
        onClose={close}
      >
        <dialog
          open
          aria-labelledby={titleId}
          aria-modal="true"
          className="relative inset-auto m-0 w-full max-w-none border-0 bg-white p-0 text-inherit"
        >
          {/* 顶栏 */}
          <div className="relative flex h-[60px] items-center justify-center px-14">
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="关闭租赁时间选择器"
              className="absolute left-2 flex size-11 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
              onClick={close}
            >
              <Icon name="close" className="size-5" />
            </button>
            <h2 id={titleId} className="truncate text-lg font-semibold text-[#202020]">
              {durations.description || '不足1小时'}
            </h2>
            <button
              type="button"
              className="absolute right-2 flex h-11 min-w-14 items-center justify-center font-medium text-[#2563eb] outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
              onClick={onConfirm}
            >
              确认
            </button>
          </div>

          {/* 开始时间 / 结束时间 */}
          <div className="grid grid-cols-2 border-y border-[#e5e7eb]">
            {(['start', 'end'] as const).map((itemType) => {
              const selected = type === itemType;
              const fixed = Boolean(fixedDateForStart && itemType === 'start');
              return (
                <button
                  type="button"
                  aria-pressed={selected}
                  className={cn(
                    'flex min-h-[68px] flex-col justify-center px-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-inset',
                    itemType === 'end' && 'items-end text-right',
                    selected ? 'bg-[#2563eb] text-white' : 'bg-[#f4f4f4] text-[#202020]',
                    fixed && 'cursor-not-allowed opacity-70',
                  )}
                  disabled={fixed}
                  key={itemType}
                  onClick={() => onSwitchType(itemType)}
                >
                  <span className="text-xs">{labels[itemType]}</span>
                  <span className="mt-1 text-sm font-medium">{dateFormat(result[itemType])}</span>
                </button>
              );
            })}
          </div>

          {noticeMessage && (
            <p
              role="alert"
              className="border-b border-[#fee2e2] bg-[#fff7f7] px-4 py-2 text-xs text-[#b42318]"
            >
              {noticeMessage}
            </p>
          )}

          {/* 日期 / 小时 / 分钟 */}
          <div className="relative flex px-3 py-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
            <WheelColumn
              ariaLabel="日期"
              options={dateOptions}
              value={columns.dates[columns.value[0]]}
              visible={visible}
              onChange={onDateChange}
            />
            <WheelColumn
              ariaLabel="小时"
              options={hourOptions}
              value={columns.hours[columns.value[1]]}
              visible={visible}
              onChange={onHourChange}
            />
            <WheelColumn
              ariaLabel="分钟"
              options={minuteOptions}
              value={columns.minutes[columns.value[2]]}
              visible={visible}
              onChange={onMinuteChange}
            />
          </div>
        </dialog>
      </Popup>
    </>
  );
});
