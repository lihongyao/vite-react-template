import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { type DateRange, DayPicker, type DayPickerProps, type Matcher } from '@daypicker/react';
import { enUS, es, pt, zhCN } from '@daypicker/react/locale';

import Popup from '@/components/ui/Popup';
import type { Locale } from '@/i18n/config';
import { useCurrentLocale } from '@/i18n/navigation';
import { cn } from '@/libs/class-helpers';

import '@daypicker/react/style.css';
import './styles.css';

export type CalendarSelectRange = DateRange;

export interface CalendarSelectLabels {
  title: string;
  cancel: string;
  confirm: string;
  close: string;
}

interface CalendarSelectPanelCommonProps {
  /** 是否允许选择今天之后的日期，默认允许。 */
  allowFutureDates?: boolean;
  /** 额外需要禁用的日期或日期匹配器。 */
  disabledDates?: Matcher | Matcher[];
  /** 最早可选日期。 */
  minDate?: Date;
  /** 最晚可选日期。 */
  maxDate?: Date;
  /** 用于显示和未来日期判断的“今天”，默认使用系统当前日期。 */
  today?: Date;
  /** 首次展示的月份。 */
  defaultMonth?: Date;
  /** 受控展示的月份。 */
  month?: Date;
  /** 月份切换回调。 */
  onMonthChange?: (month: Date) => void;
  /** 一次展示的月份数量，默认 1。 */
  numberOfMonths?: number;
  /** 是否显示固定六周，默认 false。 */
  fixedWeeks?: boolean;
  /** 是否显示上个月或下个月的日期，默认 false。 */
  showOutsideDays?: boolean;
  /** 每周从哪一天开始，0 为周日，1 为周一。默认跟随当前项目 locale。 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** DayPicker 使用的本地化配置，默认跟随当前项目 locale。 */
  locale?: DayPickerProps['locale'];
  /** 是否自动聚焦日历，默认 false。 */
  autoFocus?: boolean;
  /** 日历根节点的 aria-label。 */
  'aria-label'?: string;
  /** 自定义日历根节点样式。 */
  style?: CSSProperties;
  /** 自定义日历根节点类名。 */
  className?: string;
}

export interface CalendarSelectPanelSingleProps extends CalendarSelectPanelCommonProps {
  mode: 'single';
  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date | undefined) => void;
  maxRangeDays?: never;
}

export interface CalendarSelectPanelRangeProps extends CalendarSelectPanelCommonProps {
  mode: 'range';
  value?: CalendarSelectRange;
  defaultValue?: CalendarSelectRange;
  onChange?: (value: CalendarSelectRange | undefined) => void;
  /** 起止日期最多相隔多少个自然日。 */
  maxRangeDays?: number;
}

export type CalendarSelectPanelProps =
  CalendarSelectPanelSingleProps | CalendarSelectPanelRangeProps;

interface CalendarSelectCommonProps extends Omit<
  CalendarSelectPanelCommonProps,
  'autoFocus' | 'className' | 'style'
> {
  /** 触发器内容。 */
  children: ReactNode;
  /** Popup 标题，优先级高于 labels.title。 */
  title?: string;
  /** 文案配置。 */
  labels?: Partial<CalendarSelectLabels>;
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
  /** 触发器样式。 */
  triggerClassName?: string;
  /** Popup 遮罩层样式。 */
  popupClassName?: string;
  /** Popup 面板样式。 */
  contentClassName?: string;
  /** 内部日历面板样式。 */
  panelClassName?: string;
  /** 内部日历面板内联样式。 */
  panelStyle?: CSSProperties;
  /** 打开后是否自动聚焦日历，默认 false。 */
  autoFocusCalendar?: boolean;
}

export interface CalendarSelectSingleProps extends CalendarSelectCommonProps {
  mode: 'single';
  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date | undefined) => void;
  maxRangeDays?: never;
}

export interface CalendarSelectRangeProps extends CalendarSelectCommonProps {
  mode: 'range';
  value?: CalendarSelectRange;
  defaultValue?: CalendarSelectRange;
  onChange?: (value: CalendarSelectRange | undefined) => void;
  /** 起止日期最多相隔多少个自然日。 */
  maxRangeDays?: number;
}

export type CalendarSelectProps = CalendarSelectSingleProps | CalendarSelectRangeProps;

const defaultLabels: CalendarSelectLabels = {
  title: '选择日期',
  cancel: '取消',
  confirm: '确定',
  close: '关闭',
};

const dayPickerLocaleMap = {
  'en-US': { locale: enUS, weekStartsOn: 0 },
  'zh-CN': { locale: zhCN, weekStartsOn: 1 },
  es: { locale: es, weekStartsOn: 1 },
  pt: { locale: pt, weekStartsOn: 1 },
} as const satisfies Record<
  Locale,
  {
    locale: DayPickerProps['locale'];
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  }
>;

const normalizeDate = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) return undefined;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const cloneRange = (range?: CalendarSelectRange) => {
  const from = normalizeDate(range?.from);
  const to = normalizeDate(range?.to);
  return from || to ? { from, to } : undefined;
};

const toMatchers = (matcher?: Matcher | Matcher[]) => {
  if (!matcher) return [];
  return Array.isArray(matcher) ? matcher : [matcher];
};

const earlierDate = (first?: Date, second?: Date) => {
  if (!first) return second;
  if (!second) return first;
  return first <= second ? first : second;
};

const getDateKey = (date?: Date) => normalizeDate(date)?.getTime() ?? 'none';

const getRangeKey = (range?: CalendarSelectRange) =>
  `${getDateKey(range?.from)}:${getDateKey(range?.to)}`;

export function CalendarSelectPanel(props: CalendarSelectPanelProps) {
  const systemToday = normalizeDate(new Date())!;
  const today = normalizeDate(props.today) ?? systemToday;
  const minDate = normalizeDate(props.minDate);
  const requestedMaxDate = normalizeDate(props.maxDate);
  const futureMaxDate = props.allowFutureDates === false ? today : undefined;
  const maxDate = earlierDate(requestedMaxDate, futureMaxDate);
  const isValueControlled = Object.prototype.hasOwnProperty.call(props, 'value');
  const disabledMatchers: Matcher[] = [...toMatchers(props.disabledDates)];

  if (minDate) disabledMatchers.push({ before: minDate });
  if (maxDate) disabledMatchers.push({ after: maxDate });

  const dayPickerDisabled = disabledMatchers.length > 0 ? disabledMatchers : undefined;

  const navigationStartMonth = minDate && (!maxDate || minDate <= maxDate) ? minDate : undefined;
  const navigationEndMonth = maxDate && (!minDate || minDate <= maxDate) ? maxDate : undefined;
  const commonProps = {
    autoFocus: props.autoFocus,
    className: cn('calendar-select', props.className),
    defaultMonth: props.defaultMonth,
    disabled: dayPickerDisabled,
    endMonth: navigationEndMonth,
    fixedWeeks: props.fixedWeeks,
    locale: props.locale,
    month: props.month,
    navLayout: 'around' as const,
    numberOfMonths: props.numberOfMonths ?? 1,
    onMonthChange: props.onMonthChange,
    showOutsideDays: props.showOutsideDays ?? false,
    startMonth: navigationStartMonth,
    style: props.style,
    today,
    weekStartsOn: props.weekStartsOn ?? 0,
    'aria-label': props['aria-label'] ?? 'Calendar',
  };

  const [singleValue, setSingleValue] = useState<Date | undefined>(
    props.mode === 'single' ? props.defaultValue : undefined,
  );
  const [rangeValue, setRangeValue] = useState<CalendarSelectRange | undefined>(
    props.mode === 'range' ? props.defaultValue : undefined,
  );

  if (props.mode === 'single') {
    const selected = isValueControlled ? props.value : singleValue;

    return (
      <DayPicker
        {...commonProps}
        mode="single"
        selected={selected}
        onSelect={(nextValue) => {
          if (!isValueControlled) setSingleValue(nextValue);
          props.onChange?.(nextValue);
        }}
      />
    );
  }

  const selected = isValueControlled ? props.value : rangeValue;
  const maxRangeDays =
    props.maxRangeDays === undefined
      ? undefined
      : Math.max(1, Math.floor(Number.isFinite(props.maxRangeDays) ? props.maxRangeDays : 1));

  return (
    <DayPicker
      {...commonProps}
      mode="range"
      excludeDisabled
      max={maxRangeDays}
      resetOnSelect
      selected={selected}
      onSelect={(nextValue) => {
        if (!isValueControlled) setRangeValue(nextValue);
        props.onChange?.(nextValue);
      }}
    />
  );
}

export default function CalendarSelect(props: CalendarSelectProps) {
  const generatedId = useId();
  const currentLocale = useCurrentLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const isValueControlled = Object.prototype.hasOwnProperty.call(props, 'value');
  const isOpenControlled = props.open !== undefined;
  const onOpenChange = props.onOpenChange;
  const localeConfig = dayPickerLocaleMap[currentLocale];
  const dayPickerLocale = props.locale ?? localeConfig.locale;
  const dayPickerWeekStartsOn = props.weekStartsOn ?? localeConfig.weekStartsOn;
  const labels = {
    ...defaultLabels,
    ...props.labels,
    ...(props.title ? { title: props.title } : {}),
  };

  const [innerOpen, setInnerOpen] = useState(props.defaultOpen ?? false);
  const [singleValue, setSingleValue] = useState<Date | undefined>(() =>
    props.mode === 'single'
      ? normalizeDate(isValueControlled ? props.value : props.defaultValue)
      : undefined,
  );
  const [rangeValue, setRangeValue] = useState<CalendarSelectRange | undefined>(() =>
    props.mode === 'range'
      ? cloneRange(isValueControlled ? props.value : props.defaultValue)
      : undefined,
  );
  const [draftSingle, setDraftSingle] = useState<Date | undefined>(() =>
    props.mode === 'single'
      ? normalizeDate(isValueControlled ? props.value : props.defaultValue)
      : undefined,
  );
  const [draftRange, setDraftRange] = useState<CalendarSelectRange | undefined>(() =>
    props.mode === 'range'
      ? cloneRange(isValueControlled ? props.value : props.defaultValue)
      : undefined,
  );

  const visible = (isOpenControlled ? props.open : innerOpen) ?? false;
  const committedSingle =
    props.mode === 'single'
      ? normalizeDate(isValueControlled ? props.value : singleValue)
      : undefined;
  const committedRange =
    props.mode === 'range' ? cloneRange(isValueControlled ? props.value : rangeValue) : undefined;
  const committedKey =
    props.mode === 'single' ? getDateKey(committedSingle) : getRangeKey(committedRange);
  const committedSingleRef = useRef(committedSingle);
  const committedRangeRef = useRef(committedRange);
  const dialogId = `${generatedId}-dialog`;
  const titleId = `${generatedId}-title`;
  const panelKey = `${props.mode}-${visible ? committedKey : 'closed'}`;
  const panelDefaultMonth =
    props.defaultMonth ??
    (props.mode === 'single' ? draftSingle : (draftRange?.from ?? draftRange?.to)) ??
    (props.allowFutureDates === false
      ? (normalizeDate(props.today) ?? normalizeDate(new Date()))
      : undefined);
  const canConfirm =
    props.mode === 'single'
      ? draftSingle !== undefined
      : draftRange?.from !== undefined && draftRange?.to !== undefined;

  committedSingleRef.current = committedSingle;
  committedRangeRef.current = committedRange;

  useEffect(() => {
    if (!visible) return;

    if (props.mode === 'single') setDraftSingle(normalizeDate(committedSingleRef.current));
    else setDraftRange(cloneRange(committedRangeRef.current));

    requestAnimationFrame(() => cancelRef.current?.focus());
  }, [committedKey, props.mode, visible]);

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

  const setVisible = (nextOpen: boolean, restoreFocus = false) => {
    if (!isOpenControlled) setInnerOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen && restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const onCancel = () => setVisible(false, true);

  const onConfirm = () => {
    if (!canConfirm) return;

    if (props.mode === 'single') {
      const nextValue = normalizeDate(draftSingle);
      if (!isValueControlled) setSingleValue(nextValue);
      props.onChange?.(nextValue);
    } else {
      const nextValue = cloneRange(draftRange);
      if (!isValueControlled) setRangeValue(nextValue);
      props.onChange?.(nextValue);
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
          'block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          props.triggerClassName,
        )}
        disabled={props.disabled}
        onClick={() => setVisible(true)}
      >
        {props.children}
      </button>

      <Popup
        visible={visible}
        className={cn('ui-calendar-select', props.popupClassName)}
        closeOnClickOverlay={props.closeOnClickOverlay}
        contentClassName={cn('min-h-0 rounded-t-xl', props.contentClassName)}
        onClose={onCancel}
      >
        <dialog
          id={dialogId}
          open
          aria-labelledby={titleId}
          aria-modal="true"
          className="calendar-select-dialog relative inset-auto m-0 w-full max-w-none border-0 bg-transparent p-0 text-inherit"
        >
          <div className="relative flex h-[56px] items-center justify-center border-b border-[#eeeeee] px-14">
            <h2
              id={titleId}
              className="min-w-0 truncate text-center text-base font-semibold text-[var(--calendar-select-text)]"
            >
              {labels.title}
            </h2>
            <button
              type="button"
              aria-label={labels.close}
              className="absolute top-1/2 right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-2xl leading-none text-[var(--calendar-select-muted-text)] outline-none hover:bg-[var(--calendar-select-hover-bg)] hover:text-[var(--calendar-select-text)] focus-visible:ring-2 focus-visible:ring-[var(--calendar-select-selected-bg)]"
              onClick={onCancel}
            >
              <span aria-hidden>×</span>
            </button>
          </div>

          <div className="px-4 pt-3 pb-2">
            {props.mode === 'single' ? (
              <CalendarSelectPanel
                key={panelKey}
                allowFutureDates={props.allowFutureDates}
                autoFocus={props.autoFocusCalendar}
                className={cn('calendar-select--popup', props.panelClassName)}
                defaultMonth={panelDefaultMonth}
                disabledDates={props.disabledDates}
                fixedWeeks={props.fixedWeeks}
                locale={dayPickerLocale}
                maxDate={props.maxDate}
                minDate={props.minDate}
                mode="single"
                month={props.month}
                numberOfMonths={props.numberOfMonths}
                showOutsideDays={props.showOutsideDays}
                style={props.panelStyle}
                today={props.today}
                value={draftSingle}
                weekStartsOn={dayPickerWeekStartsOn}
                onChange={(nextValue) => setDraftSingle(normalizeDate(nextValue))}
                onMonthChange={props.onMonthChange}
              />
            ) : (
              <CalendarSelectPanel
                key={panelKey}
                allowFutureDates={props.allowFutureDates}
                autoFocus={props.autoFocusCalendar}
                className={cn('calendar-select--popup', props.panelClassName)}
                defaultMonth={panelDefaultMonth}
                disabledDates={props.disabledDates}
                fixedWeeks={props.fixedWeeks}
                locale={dayPickerLocale}
                maxDate={props.maxDate}
                maxRangeDays={props.maxRangeDays}
                minDate={props.minDate}
                mode="range"
                month={props.month}
                numberOfMonths={props.numberOfMonths}
                showOutsideDays={props.showOutsideDays}
                style={props.panelStyle}
                today={props.today}
                value={draftRange}
                weekStartsOn={dayPickerWeekStartsOn}
                onChange={(nextValue) => setDraftRange(cloneRange(nextValue))}
                onMonthChange={props.onMonthChange}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[#eeeeee] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
            <button
              ref={cancelRef}
              type="button"
              className="flex h-11 items-center justify-center rounded-lg border border-[#d6e2da] bg-white text-sm font-medium text-[#1f2937] outline-none hover:bg-[#eef4f0] focus-visible:ring-2 focus-visible:ring-[#22c55e]"
              onClick={onCancel}
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center rounded-lg bg-[#22c55e] text-sm font-semibold text-white outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[#22c55e] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canConfirm}
              onClick={onConfirm}
            >
              {labels.confirm}
            </button>
          </div>
        </dialog>
      </Popup>
    </>
  );
}
