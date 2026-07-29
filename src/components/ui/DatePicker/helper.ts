export const DATE_PICKER_NOW = 'now' as const;

export type DatePickerYear = number | typeof DATE_PICKER_NOW;

export interface DateMeta {
  year: number;
  month: number;
  day: number;
}

interface DateRangeOptions {
  min: Date;
  max: Date;
}

interface MonthRangeOptions extends DateRangeOptions {
  year: number;
}

interface DayRangeOptions extends MonthRangeOptions {
  month: number;
}

const createRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

/** 判断指定年份是否为闰年。 */
export const isLeapYear = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** 将 Date 转成年、月、日数据，月份从 1 开始。 */
export const getDateMeta = (date: Date): DateMeta => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
});

/** 使用本地时区创建日期，避免 UTC 字符串带来的日期偏移。 */
export const createDate = ({ year, month, day }: DateMeta) => new Date(year, month - 1, day);

/** 去掉时分秒；无效 Date 返回 null。 */
export const normalizeDate = (date: Date) =>
  Number.isNaN(date.getTime())
    ? null
    : new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** 保证日期范围始终按从小到大的顺序返回。 */
export const orderDateRange = (first: Date, second: Date) =>
  first <= second ? { min: first, max: second } : { min: second, max: first };

/** 将日期限制在 min 和 max 之间。 */
export const clampDate = (date: Date, min: Date, max: Date) => {
  const normalized = normalizeDate(date) ?? new Date(min);
  if (normalized < min) return new Date(min);
  if (normalized > max) return new Date(max);
  return normalized;
};

/** 获取年份集合；“至今”紧跟在当前年份后面。 */
export const getYears = (min: Date, max: Date, showNow: boolean, currentDate: Date) => {
  const years: DatePickerYear[] = createRange(min.getFullYear(), max.getFullYear());
  if (!showNow) return years;

  const currentYearIndex = years.indexOf(currentDate.getFullYear());
  years.splice(currentYearIndex >= 0 ? currentYearIndex + 1 : years.length, 0, DATE_PICKER_NOW);
  return years;
};

/** 获取指定年份的有效月份集合，并处理最小、最大日期边界。 */
export const getMonths = ({ year, min, max }: MonthRangeOptions) => {
  const start = year === min.getFullYear() ? min.getMonth() + 1 : 1;
  const end = year === max.getFullYear() ? max.getMonth() + 1 : 12;
  return createRange(start, end);
};

/** 获取指定年月的有效日期集合，并处理闰年及日期边界。 */
export const getDays = ({ year, month, min, max }: DayRangeOptions) => {
  const isMinMonth = year === min.getFullYear() && month === min.getMonth() + 1;
  const isMaxMonth = year === max.getFullYear() && month === max.getMonth() + 1;
  const start = isMinMonth ? min.getDate() : 1;

  let monthDays = 31;
  if ([4, 6, 9, 11].includes(month)) monthDays = 30;
  else if (month === 2) monthDays = isLeapYear(year) ? 29 : 28;

  const end = isMaxMonth ? max.getDate() : monthDays;
  return createRange(start, end);
};

/** 根据 YYYY、MM、DD 占位符格式化日期。 */
export const formatDate = ({ year, month, day }: DateMeta, format: string) =>
  format
    .replaceAll('YYYY', String(year))
    .replaceAll('MM', String(month).padStart(2, '0'))
    .replaceAll('DD', String(day).padStart(2, '0'));
