import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode, UIEvent } from 'react';

import Popup from '@/components/ui/Popup';
import { cn } from '@/libs/class-helpers';

import {
  DATE_PICKER_NOW,
  clampDate,
  createDate,
  formatDate,
  getDateMeta,
  getDays,
  getMonths,
  getYears,
  normalizeDate,
  orderDateRange,
} from './helper';
import type { DateMeta, DatePickerYear } from './helper';

export type DatePickerField = 'YEAR' | 'MONTH' | 'DAY';
export type DatePickerValue = Date | typeof DATE_PICKER_NOW;

export interface DatePickerLabels {
  title: string;
  cancel: string;
  confirm: string;
  year: string;
  month: string;
  day: string;
  now: string;
}

export interface DatePickerProps {
  /** 自定义触发器内容。 */
  children: ReactNode;
  /** 已确认的受控值，`now` 表示“至今”。 */
  value?: DatePickerValue;
  /** 非受控初始值，默认当前日期；showNow 为 true 时默认“至今”。 */
  defaultValue?: DatePickerValue;
  /** 最小可选日期，默认 1970-01-01。 */
  min?: Date;
  /** 最大可选日期，默认当前日期。 */
  max?: Date;
  /** 选择粒度，默认 DAY。 */
  fields?: DatePickerField;
  /** 是否在年份列展示“至今”。 */
  showNow?: boolean;
  /** 确认时返回值的格式。 */
  format?: string;
  /** 确认选择时触发。 */
  onChange: (value: string, date: Date | null) => void;
  /** 是否禁用触发器。 */
  disabled?: boolean;
  /** 受控打开状态。 */
  open?: boolean;
  /** 非受控初始打开状态。 */
  defaultOpen?: boolean;
  /** 打开状态改变时触发。 */
  onOpenChange?: (open: boolean) => void;
  /** 点击遮罩是否关闭，默认关闭。 */
  closeOnClickOverlay?: boolean;
  /** 文案配置。 */
  labels?: Partial<DatePickerLabels>;
  /** 主题色。 */
  themeColor?: string;
  /** 触发器样式。 */
  triggerClassName?: string;
  /** Popup 遮罩层样式。 */
  popupClassName?: string;
  /** Popup 面板样式。 */
  contentClassName?: string;
}

interface WheelOption<T extends number | string> {
  value: T;
  label: string;
}

interface DatePickerStyle extends CSSProperties {
  '--date-picker-theme': string;
}

interface WheelColumnProps<T extends number | string> {
  ariaLabel: string;
  options: WheelOption<T>[];
  value: T;
  visible: boolean;
  onChange: (value: T) => void;
}

const ITEM_HEIGHT = 48;
const VISIBLE_ROWS = 5;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const WHEEL_PADDING = (VIEWPORT_HEIGHT - ITEM_HEIGHT) / 2;

const defaultLabels: DatePickerLabels = {
  title: '选择日期',
  cancel: '取消',
  confirm: '确定',
  year: '年',
  month: '月',
  day: '日',
  now: '至今',
};

const defaultMinDate = new Date(1970, 0, 1);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function WheelColumn<T extends number | string>({
  ariaLabel,
  options,
  value,
  visible,
  onChange,
}: WheelColumnProps<T>) {
  // -- refs
  const listRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number | undefined>(undefined);

  // -- computed
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  // -- effects
  // 初次打开或选项范围改变时，将当前值移动到中间选中区域。
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
    const nextOption = options[clamp(index, 0, options.length - 1)];
    if (nextOption && nextOption.value !== value) onChange(nextOption.value);
  };

  // -- events
  // 滚动过程中按距离最近的选项更新值，最终位置由 scroll-snap 自动吸附。
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
    frameIdRef.current = requestAnimationFrame(() => {
      selectIndex(Math.round(scrollTop / ITEM_HEIGHT));
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex;
    if (event.key === 'ArrowDown') nextIndex += 1;
    else if (event.key === 'ArrowUp') nextIndex -= 1;
    else if (event.key === 'PageDown') nextIndex += VISIBLE_ROWS;
    else if (event.key === 'PageUp') nextIndex -= VISIBLE_ROWS;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = options.length - 1;
    else return;

    event.preventDefault();
    nextIndex = clamp(nextIndex, 0, options.length - 1);
    selectIndex(nextIndex);
    listRef.current?.scrollTo({ top: nextIndex * ITEM_HEIGHT, behavior: 'smooth' });
  };

  const handleItemClick = (option: WheelOption<T>) => {
    const index = options.indexOf(option);
    selectIndex(index);
    listRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
  };

  return (
    <div className="relative min-w-0 flex-1">
      <div
        ref={listRef}
        className="scrollbar-hidden relative z-10 overflow-y-auto overscroll-contain outline-none"
        style={{
          height: VIEWPORT_HEIGHT,
          paddingBlock: WHEEL_PADDING,
          scrollSnapType: 'y mandatory',
        }}
        onScroll={handleScroll}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              type="button"
              aria-label={`${ariaLabel} ${option.label}`}
              aria-current={selected ? 'true' : undefined}
              className={cn(
                'flex w-full cursor-pointer items-center justify-center px-1 text-center text-sm text-[#737373] transition-[color,font-weight] outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--date-picker-theme)] focus-visible:ring-inset',
                selected && 'font-semibold text-[#202124]',
              )}
              key={option.value}
              style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
              tabIndex={selected ? 0 : -1}
              onClick={() => handleItemClick(option)}
              onKeyDown={handleKeyDown}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div
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

export default function DatePicker({
  children,
  value,
  defaultValue,
  min = defaultMinDate,
  max,
  fields = 'DAY',
  showNow = false,
  format = 'YYYY-MM-DD',
  onChange,
  disabled = false,
  open,
  defaultOpen = false,
  onOpenChange,
  closeOnClickOverlay = true,
  labels: labelsProp,
  themeColor = '#0f766e',
  triggerClassName,
  popupClassName,
  contentClassName,
}: DatePickerProps) {
  // -- refs
  const generatedId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // -- constants
  const currentDate = normalizeDate(new Date()) ?? defaultMinDate;
  const validMin = normalizeDate(min) ?? defaultMinDate;
  const validMax = normalizeDate(max ?? currentDate) ?? currentDate;
  const { min: minDate, max: maxDate } = orderDateRange(validMin, validMax);
  const labels = { ...defaultLabels, ...labelsProp };
  const pickerStyle: DatePickerStyle = { '--date-picker-theme': themeColor };
  const isValueControlled = value !== undefined;
  const isOpenControlled = open !== undefined;
  const dialogId = `${generatedId}-dialog`;
  const titleId = `${generatedId}-title`;

  // -- defaults
  const getInitialValue = (nextValue?: DatePickerValue): DatePickerValue => {
    if (nextValue === DATE_PICKER_NOW && showNow) return DATE_PICKER_NOW;
    if (nextValue instanceof Date) return clampDate(nextValue, minDate, maxDate);
    if (showNow) return DATE_PICKER_NOW;
    return clampDate(currentDate, minDate, maxDate);
  };

  // -- state
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [innerValue, setInnerValue] = useState<DatePickerValue>(() =>
    getInitialValue(defaultValue),
  );
  const committedValue = getInitialValue(isValueControlled ? value : innerValue);
  const [draftValue, setDraftValue] = useState<DatePickerValue>(committedValue);

  // -- computed
  const visible = isOpenControlled ? open : innerOpen;
  const committedKey: number | typeof DATE_PICKER_NOW =
    committedValue === DATE_PICKER_NOW
      ? DATE_PICKER_NOW
      : createDate(getDateMeta(committedValue)).getTime();
  const draftMeta =
    draftValue === DATE_PICKER_NOW
      ? getDateMeta(clampDate(currentDate, minDate, maxDate))
      : getDateMeta(draftValue);

  const yearValues = getYears(minDate, maxDate, showNow, currentDate);
  const monthValues = getMonths({ year: draftMeta.year, min: minDate, max: maxDate });
  const dayValues = getDays({
    year: draftMeta.year,
    month: draftMeta.month,
    min: minDate,
    max: maxDate,
  });

  const yearOptions = yearValues.map((year) => ({
    value: year,
    label: year === DATE_PICKER_NOW ? labels.now : `${year}${labels.year}`,
  }));
  const monthOptions = monthValues.map((month) => ({
    value: month,
    label: `${String(month).padStart(2, '0')}${labels.month}`,
  }));
  const dayOptions = dayValues.map((day) => ({
    value: day,
    label: `${String(day).padStart(2, '0')}${labels.day}`,
  }));

  // -- effects
  // 每次打开都从已确认值开始，取消操作不会保留本次草稿。
  useEffect(() => {
    if (!visible) return;
    setDraftValue(committedKey === DATE_PICKER_NOW ? DATE_PICKER_NOW : new Date(committedKey));
    requestAnimationFrame(() => cancelRef.current?.focus());
  }, [committedKey, visible]);

  // Escape 与点击取消保持相同行为，并将焦点还给触发器。
  useEffect(() => {
    if (!visible) return undefined;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (!isOpenControlled) setInnerOpen(false);
      onOpenChange?.(false);
      requestAnimationFrame(() => triggerRef.current?.focus());
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpenControlled, onOpenChange, visible]);

  // -- methods
  const setVisible = (nextOpen: boolean, restoreFocus = false) => {
    if (!isOpenControlled) setInnerOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen && restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  // 年或月变化后重新计算有效范围，避免出现 2 月 30 日等无效日期。
  const updateDraft = (meta: Partial<DateMeta>) => {
    const year = meta.year ?? draftMeta.year;
    const availableMonths = getMonths({ year, min: minDate, max: maxDate });
    const month = clamp(meta.month ?? draftMeta.month, availableMonths[0], availableMonths.at(-1)!);
    const availableDays = getDays({ year, month, min: minDate, max: maxDate });
    const day = clamp(meta.day ?? draftMeta.day, availableDays[0], availableDays.at(-1)!);
    setDraftValue(createDate({ year, month, day }));
  };

  // -- events
  const onCancel = () => setVisible(false, true);

  const onYearChange = (year: DatePickerYear) => {
    if (year === DATE_PICKER_NOW) setDraftValue(DATE_PICKER_NOW);
    else updateDraft({ year });
  };

  const onConfirm = () => {
    if (draftValue === DATE_PICKER_NOW) {
      if (!isValueControlled) setInnerValue(DATE_PICKER_NOW);
      onChange(labels.now, null);
    } else {
      const meta = getDateMeta(draftValue);
      const resultMeta: DateMeta = {
        year: meta.year,
        month: fields === 'YEAR' ? 1 : meta.month,
        day: fields === 'DAY' ? meta.day : 1,
      };
      const resultDate = createDate(resultMeta);
      if (!isValueControlled) setInnerValue(resultDate);
      onChange(formatDate(resultMeta, format), resultDate);
    }
    setVisible(false, true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-controls={dialogId}
        aria-expanded={visible}
        aria-haspopup="dialog"
        className={cn(
          'block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--date-picker-theme)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          triggerClassName,
        )}
        disabled={disabled}
        style={pickerStyle}
        onClick={() => setVisible(true)}
      >
        {children}
      </button>

      <Popup
        visible={visible}
        className={cn('ui-date-picker', popupClassName)}
        closeOnClickOverlay={closeOnClickOverlay}
        contentClassName={cn('min-h-0 rounded-t-xl', contentClassName)}
        onClose={onCancel}
      >
        <dialog
          id={dialogId}
          open
          aria-labelledby={titleId}
          aria-modal="true"
          className="relative inset-auto m-0 w-full max-w-none border-0 bg-transparent p-0 text-inherit"
          style={pickerStyle}
        >
          <div className="flex h-[60px] items-center border-b border-[#eeeeee] px-6 text-sm">
            <button
              ref={cancelRef}
              type="button"
              className="flex h-10 min-w-12 items-center justify-start text-[#737373] outline-none focus-visible:ring-2 focus-visible:ring-[var(--date-picker-theme)]"
              onClick={onCancel}
            >
              {labels.cancel}
            </button>
            <h2
              id={titleId}
              className="min-w-0 flex-1 truncate px-3 text-center text-base font-semibold text-[#202124]"
            >
              {labels.title}
            </h2>
            <button
              type="button"
              className="flex h-10 min-w-12 items-center justify-end font-medium text-[var(--date-picker-theme)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--date-picker-theme)]"
              onClick={onConfirm}
            >
              {labels.confirm}
            </button>
          </div>

          <div className="relative flex px-3 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
            <WheelColumn
              ariaLabel={labels.year}
              options={yearOptions}
              value={draftValue === DATE_PICKER_NOW ? DATE_PICKER_NOW : draftMeta.year}
              visible={visible}
              onChange={onYearChange}
            />
            {fields !== 'YEAR' && draftValue !== DATE_PICKER_NOW && (
              <WheelColumn
                ariaLabel={labels.month}
                options={monthOptions}
                value={draftMeta.month}
                visible={visible}
                onChange={(month) => updateDraft({ month })}
              />
            )}
            {fields === 'DAY' && draftValue !== DATE_PICKER_NOW && (
              <WheelColumn
                ariaLabel={labels.day}
                options={dayOptions}
                value={draftMeta.day}
                visible={visible}
                onChange={(day) => updateDraft({ day })}
              />
            )}
          </div>
        </dialog>
      </Popup>
    </>
  );
}
