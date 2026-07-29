import { useState } from 'react';
import type { CSSProperties } from 'react';

import { type DateRange, DayPicker, type DayPickerProps, type Matcher } from '@daypicker/react';

import '@daypicker/react/style.css';

import { cn } from '@/libs/class-helpers';

import './styles.css';

export type CalendarSelectRange = DateRange;

interface CalendarSelectCommonProps {
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
  /** 每周从哪一天开始，0 为周日，1 为周一。 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** DayPicker 使用的本地化配置。 */
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

const normalizeDate = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) return undefined;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

export default function CalendarSelect(props: CalendarSelectProps) {
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
