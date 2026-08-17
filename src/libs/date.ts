import { localeMap } from '@/i18n/config';

export type DateTimeFormat = 'localized' | 'standard';

/** 控制需要显示哪些日期、时间字段。 */
export type DateTimePreset =
  'date' | 'year-month' | 'date-time-minute' | 'date-time-second' | 'time-second';

export type FormatDateTimeOptions = {
  format?: DateTimeFormat;
  locale?: string;
  preset?: DateTimePreset;
  timeZone?: string;
};

const INVALID_DATE_PLACEHOLDER = '--';

// h23 表示 00:00 至 23:59 的 24 小时制，午夜显示为 00 而不是 24。
const TIME_MINUTE_OPTIONS = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
} satisfies Intl.DateTimeFormatOptions;

const TIME_SECOND_OPTIONS = {
  ...TIME_MINUTE_OPTIONS,
  second: '2-digit',
} satisfies Intl.DateTimeFormatOptions;

const DATE_TIME_PRESET_OPTIONS = {
  date: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  'year-month': {
    year: 'numeric',
    month: '2-digit',
  },
  'date-time-minute': {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...TIME_MINUTE_OPTIONS,
  },
  'date-time-second': {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...TIME_SECOND_OPTIONS,
  },
  'time-second': TIME_SECOND_OPTIONS,
} satisfies Record<DateTimePreset, Intl.DateTimeFormatOptions>;

function formatStandardDateTime(date: Date, preset: DateTimePreset, timeZone?: string) {
  // formatToParts 按字段取值，再自行拼接，避免固定格式受 locale 分隔符和字段顺序影响。
  const parts = new Intl.DateTimeFormat('en-CA-u-ca-gregory-nu-latn', {
    ...DATE_TIME_PRESET_OPTIONS[preset],
    timeZone,
  }).formatToParts(date);
  const partMap = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  switch (preset) {
    case 'date':
      return `${partMap.year}-${partMap.month}-${partMap.day}`;
    case 'year-month':
      return `${partMap.year}-${partMap.month}`;
    case 'date-time-minute':
      return `${partMap.year}-${partMap.month}-${partMap.day} ${partMap.hour}:${partMap.minute}`;
    case 'date-time-second':
      return `${partMap.year}-${partMap.month}-${partMap.day} ${partMap.hour}:${partMap.minute}:${partMap.second}`;
    case 'time-second':
      return `${partMap.hour}:${partMap.minute}:${partMap.second}`;
  }
}

function formatLocalizedDateTime(
  date: Date,
  locale: string | undefined,
  preset: DateTimePreset,
  timeZone?: string,
) {
  if (preset === 'date-time-minute' || preset === 'date-time-second') {
    // Intl 会根据 locale 在日期和时间之间加入逗号等符号，因此分开格式化后统一用空格连接。
    const dateText = new Intl.DateTimeFormat(locale, {
      ...DATE_TIME_PRESET_OPTIONS.date,
      timeZone,
    }).format(date);

    const timeText = new Intl.DateTimeFormat(locale, {
      ...(preset === 'date-time-minute' ? TIME_MINUTE_OPTIONS : TIME_SECOND_OPTIONS),
      timeZone,
    }).format(date);

    return `${dateText} ${timeText}`;
  }

  return new Intl.DateTimeFormat(locale, {
    ...DATE_TIME_PRESET_OPTIONS[preset],
    timeZone,
  }).format(date);
}

/**
 * 格式化后端返回的秒级 Unix 时间戳。
 *
 * - localized：日期顺序跟随 locale，例如 en-US 为月/日/年。
 * - standard：输出固定的年-月-日顺序。
 * - 不传 timeZone 时，使用用户设备的本地时区。
 * - 空值、0 或无效时间戳统一返回 "--"。
 */
export function formatDateTime(
  timestamp: number | null | undefined,
  {
    format = 'localized',
    locale,
    preset = 'date-time-second',
    timeZone,
  }: FormatDateTimeOptions = {},
) {
  if (!timestamp || !Number.isFinite(timestamp)) {
    return INVALID_DATE_PLACEHOLDER;
  }

  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) {
    return INVALID_DATE_PLACEHOLDER;
  }

  if (format === 'standard') {
    return formatStandardDateTime(date, preset, timeZone);
  }

  const resolvedLocale = locale ? (localeMap[locale] ?? locale) : undefined;

  return formatLocalizedDateTime(date, resolvedLocale, preset, timeZone);
}
