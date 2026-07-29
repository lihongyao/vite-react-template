/**
 * 周，用于计算当前处于周几。
 * 取周公式：weeks[date.getDay()]
 */
export const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const TODAY = 'today' as const;

export type LeasePickerType = 'start' | 'end';
export type DateColumnValue = Date | typeof TODAY;
export type PickerValue = [number, number, number];

export interface LeaseDateRange {
  start: Date;
  end: Date;
}

export interface LeaseDuration {
  day: number;
  hours: number;
  description: string;
}

export interface LeaseDateValue {
  v: string;
  dateTimeString: string;
  weeks: string;
}

export interface LeasePickerResult {
  start: LeaseDateValue;
  end: LeaseDateValue;
  durations: LeaseDuration;
}

export interface LeasePickerColumns {
  dates: DateColumnValue[];
  hours: string[];
  minutes: string[];
  value: PickerValue;
}

interface DateMeta {
  year: string;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
  week: string;
}

interface GetPickerColumnsOptions {
  type: LeasePickerType;
  currentDate: Date;
  result: LeaseDateRange;
  countDays: number;
}

interface GetResultFromPickerOptions {
  type: LeasePickerType;
  currentDate: Date;
  result: LeaseDateRange;
  columns: LeasePickerColumns;
  value: PickerValue;
}

/** 处理时、分数值，小于 10 时在前面补 0。 */
export function format(value: number | string) {
  return value.toString().padStart(2, '0');
}

/** 获取日期数据（解构）。 */
export function getDateMeta(date: Date): DateMeta {
  return {
    year: date.getFullYear().toString(),
    month: format(date.getMonth() + 1),
    day: format(date.getDate()),
    hours: format(date.getHours()),
    minutes: format(date.getMinutes()),
    seconds: format(date.getSeconds()),
    week: weeks[date.getDay()],
  };
}

/** 处理渲染日期格式，支持 YYYY-MM-DD HH:mm:ss d。 */
export function dateFormat(date: Date, pattern = 'MM月DD日 HH:mm') {
  const { year, month, day, hours, minutes, seconds, week } = getDateMeta(date);
  return pattern
    .replace(/YYYY/gi, year)
    .replace(/MM/, month)
    .replace(/DD/, day)
    .replace(/HH/, hours)
    .replace(/mm/, minutes)
    .replace(/ss/, seconds)
    .replace(/d/, week);
}

/** 解析组件输出的本地日期字符串，避免浏览器将其按 UTC 处理。 */
export function parseDateTime(value: string) {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!matched) return new Date(value);

  const [, year, month, day, hours, minutes, seconds = '0'] = matched;
  return new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);
}

/** 解析营业时间，格式：HH:mm - HH:mm，如：09:00 - 18:00。 */
export function parseBusinessHours(currentDate: Date, businessHours: string) {
  const [timeStart = '09:00', timeEnd = '18:00'] = businessHours.replace(/\s*/g, '').split('-');
  const [startHours = 9, startMinutes = 0] = timeStart.split(':').map(Number);
  const [endHours = 18, endMinutes = 0] = timeEnd.split(':').map(Number);
  const workTimeStart = new Date(currentDate);
  const workTimeEnd = new Date(currentDate);
  workTimeStart.setHours(startHours, startMinutes, 0, 0);
  workTimeEnd.setHours(endHours, endMinutes, 0, 0);
  return { workTimeStart, workTimeEnd };
}

/** 获取小时数数据源（00-23）。 */
export function getHours() {
  return Array.from({ length: 24 }, (_, index) => format(index));
}

/**
 * 组件加载时，根据当前时间和营业时间计算默认取车、还车时间。
 * 保留原组件的营业状态输出，便于测试不同时间段。
 */
export function getDefaultResult(currentDate: Date, businessHours: string): LeaseDateRange {
  // 1. 解析营业时间
  const { workTimeStart, workTimeEnd } = parseBusinessHours(currentDate, businessHours);
  console.log('————————————————————————————————————');
  console.log('上班时间：', workTimeStart);
  console.log('下班时间：', workTimeEnd);
  console.log('————————————————————————————————————');

  // 2. 处理开始时间
  const startDate = new Date(currentDate);
  if (currentDate > workTimeStart && currentDate < workTimeEnd) {
    console.log('当前状态：营业中');
    if (startDate.getMinutes() < 30) {
      startDate.setMinutes(30, 0, 0);
    } else {
      startDate.setHours(startDate.getHours() + 1, 0, 0, 0);
      // 如果计算后的取车时间超过打烊时间，则顺延到次日营业时间。
      if (startDate > workTimeEnd) setToBusinessStart(startDate, workTimeStart, true);
    }
  } else {
    const isClosed = currentDate > workTimeEnd;
    console.log(isClosed ? '当前状态：已打烊' : '当前状态：未营业');
    setToBusinessStart(startDate, workTimeStart, isClosed);
  }

  // 3. 默认还车时间在取车时间基础上增加 2 天
  const endDate = addDays(startDate, 2);
  return { start: startDate, end: endDate };
}

/** 渲染拾取器第 1 列日期。 */
export function renderColumnItemForDate(date: DateColumnValue) {
  if (date === TODAY) return '今日';
  const { month, day, week } = getDateMeta(date);
  return `${month}月${day}日 ${week}`;
}

/** 获取租赁时长。 */
export function getLengthOfLease(startDate: Date, endDate: Date): LeaseDuration {
  // 1. 计算时差
  const ms = endDate.getTime() - startDate.getTime();
  const day = Math.floor(ms / 1000 / 60 / 60 / 24);
  const hours = Math.floor((ms / 1000 / 60 / 60) % 24);
  const minutes = Math.floor((ms / 1000 / 60) % 60);

  // 2. 分钟 >= 30 时按 1 小时计算；小时满 24 后进 1 天
  let resultDay = day;
  let resultHours = hours;
  if (minutes >= 30) resultHours += 1;
  if (resultHours >= 24) {
    resultDay += 1;
    resultHours = 0;
  }

  // 3. 拼接租赁时长字符串
  let description = '';
  if (resultDay) description += `${resultDay}天`;
  if (resultHours) description += `${resultHours}小时`;
  return { day: resultDay, hours: resultHours, description };
}

/** 将内部 Date 结果转换为原组件 @sure 的输出结构。 */
export function createLeasePickerResult(
  result: LeaseDateRange,
  currentDate: Date,
): LeasePickerResult {
  const getWeeks = (date: Date) => (sameDate(date, currentDate) ? '今日' : weeks[date.getDay()]);
  return {
    start: {
      v: dateFormat(result.start, 'MM月DD日 HH:mm'),
      dateTimeString: dateFormat(result.start, 'YYYY-MM-DD HH:mm:ss'),
      weeks: getWeeks(result.start),
    },
    end: {
      v: dateFormat(result.end, 'MM月DD日 HH:mm'),
      dateTimeString: dateFormat(result.end, 'YYYY-MM-DD HH:mm:ss'),
      weeks: getWeeks(result.end),
    },
    durations: getLengthOfLease(result.start, result.end),
  };
}

/** 根据当前拾取类型计算日期、小时、分钟三列数据及选中下标。 */
export function getPickerColumns({
  type,
  currentDate,
  result,
  countDays,
}: GetPickerColumnsOptions): LeasePickerColumns {
  const allHours = getHours();
  const allDates = getDateColumns(currentDate, countDays);
  let dates: DateColumnValue[];

  // Column1 - 日期
  if (type === 'start') {
    // 默认结束时间比开始时间多 2 天，开始日期需为结束日期预留两项。
    dates = allDates.slice(0, Math.max(1, allDates.length - 2));
  } else {
    const startIndex = Math.max(
      0,
      allDates.findIndex((item) => sameDate(resolveDate(item, currentDate), result.start)),
    );
    const shouldDelayOneDay = dateFormat(result.start, 'HH:mm') === '23:30';
    dates = allDates.slice(startIndex + (shouldDelayOneDay ? 1 : 0));
  }

  const selectedDate = type === 'start' ? result.start : result.end;
  let dateIndex = dates.findIndex((item) => sameDate(resolveDate(item, currentDate), selectedDate));
  if (dateIndex < 0) dateIndex = 0;
  let selectedDateColumn = dates[dateIndex];

  // Column2 - 小时
  let hours: string[];
  if (type === 'start' && selectedDateColumn === TODAY) {
    let firstHour = currentDate.getHours();
    if (currentDate.getMinutes() > 30) firstHour += 1;
    hours = allHours.slice(Math.max(0, allHours.indexOf(format(firstHour))));
  } else if (
    type === 'end' &&
    sameDate(resolveDate(selectedDateColumn, currentDate), result.start)
  ) {
    const startHourIndex = allHours.indexOf(format(result.start.getHours()));
    hours = allHours.slice(startHourIndex + 1);
    // 23 点后同一天已没有结束小时，自动切换到下一天。
    if (hours.length === 0 && dates[dateIndex + 1]) {
      dateIndex += 1;
      selectedDateColumn = dates[dateIndex];
      hours = allHours;
    }
  } else {
    hours = allHours;
  }

  const selectedHours = type === 'start' ? result.start.getHours() : result.end.getHours();
  const hourIndex = Math.max(0, hours.indexOf(format(selectedHours)));

  // Column3 - 分钟
  const selectedHour = hours[hourIndex];
  let minutes = ['00', '30'];
  if (
    type === 'start' &&
    selectedDateColumn === TODAY &&
    +selectedHour === currentDate.getHours() &&
    currentDate.getMinutes() > 0 &&
    currentDate.getMinutes() < 30
  ) {
    minutes = ['30'];
  }
  const selectedMinutes = type === 'start' ? result.start.getMinutes() : result.end.getMinutes();
  const minuteIndex = Math.max(0, minutes.indexOf(format(selectedMinutes)));

  return { dates, hours, minutes, value: [dateIndex, hourIndex, minuteIndex] };
}

/** 根据三列选中下标生成临时开始、结束时间。 */
export function getResultFromPicker({
  type,
  currentDate,
  result,
  columns,
  value,
}: GetResultFromPickerOptions): LeaseDateRange {
  const [dateIndex, hourIndex, minuteIndex] = value;
  const dateColumn = columns.dates[dateIndex] ?? columns.dates[0];
  const hours = columns.hours[hourIndex] ?? columns.hours[0] ?? '00';
  const minutes = columns.minutes[minuteIndex] ?? columns.minutes[0] ?? '00';
  const selectedDate = resolveDate(dateColumn, currentDate);
  selectedDate.setHours(+hours, +minutes, 0, 0);

  if (type === 'start') return { start: selectedDate, end: addDays(selectedDate, 2) };
  return { start: new Date(result.start), end: selectedDate };
}

function setToBusinessStart(date: Date, workTimeStart: Date, nextDay: boolean) {
  const hours = workTimeStart.getHours();
  const minutes = workTimeStart.getMinutes();
  if (nextDay) date.setDate(date.getDate() + 1);
  date.setHours(minutes > 0 && minutes < 30 ? hours + 1 : hours);
  date.setMinutes(minutes > 0 && minutes < 30 ? 30 : 0, 0, 0);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function sameDate(first: Date, second: Date) {
  return first.toDateString() === second.toDateString();
}

function resolveDate(value: DateColumnValue, currentDate: Date) {
  return new Date(value === TODAY ? currentDate : value);
}

function getDateColumns(currentDate: Date, countDays: number) {
  const cursor = new Date(currentDate);
  const dates: DateColumnValue[] = [];
  // 当前时间未超过当天 23:30 时，可以选择“今日”。
  if (!(cursor.getHours() === 23 && cursor.getMinutes() > 30)) dates.push(TODAY);
  for (let index = 0; index < Math.max(3, countDays); index += 1) {
    cursor.setDate(cursor.getDate() + 1);
    dates.push(new Date(cursor));
  }
  return dates;
}
