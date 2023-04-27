/*
 * @Author: Lee
 * @Date: 2021-12-09 20:37:46
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-14 10:35:40
 */

import React, { memo, useCallback, useState } from 'react';
import { DatePicker } from 'antd-mobile';
import Tools from 'lg-tools';
import './index.less';
interface IProps {
  startDate: Date /** 开始时间 */;
  endDate: Date /** 结束时间 */;
  min?: Date /** 最小时间 */;
  max?: Date /** 最大时间 */;
  gap?: number /** 开始时间与最小时间间隔 */;
  precision?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
  onStartDateConfirm: (v: Date) => void;
  onEndDateConfirm: (v: Date) => void;
}
const RangeDatePicker: React.FC<IProps> = ({
  startDate,
  endDate,
  min = new Date('1970/01/01'),
  max = new Date(),
  gap = 0,
  precision = 'day',
  onStartDateConfirm,
  onEndDateConfirm,
}) => {
  const dateFormat = (() => {
    switch (precision) {
      case 'year':
        return 'YYYY年';
      case 'month':
        return 'YYYY-MM';
      case 'day':
        return 'YYYY-MM-DD';
      case 'hour':
        return 'YYYY-MM-DD HH';
      case 'minute':
        return 'YYYY-MM-DD HH:mm';
      case 'second':
        return 'YYYY-MM-DD HH:mm:ss';
    }
  })();
  // state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  // callbacks
  const labelRenderer = useCallback((type: string, data: number) => {
    switch (type) {
      case 'year':
        return data + '年';
      case 'month':
        return data + '月';
      case 'day':
        return data + '日';
      case 'hour':
        return data + '时';
      case 'minute':
        return data + '分';
      case 'second':
        return data + '秒';
      default:
        return data;
    }
  }, []);

  return (
    <div className='range-date-picker'>
      <div className='range-date-picker__content'>
        <div
          className='range-date-picker__item'
          onClick={() => setShowStartDatePicker(true)}
        >
          <div>{Tools.dateFormat(startDate, dateFormat)}</div>
          <img
            className='range-date-picker__icon'
            src='https://qn.d-dou.com/dcep/dbean/d71b111a77ff4de0b2f8bdc55c14dbc5xol16p.png'
          />
        </div>
        <div className='range-date-picker__spacing'>至</div>
        <div
          className='range-date-picker__item'
          onClick={() => setShowEndDatePicker(true)}
        >
          <div>{Tools.dateFormat(endDate, dateFormat)}</div>
          <img
            className='range-date-picker__icon'
            src='https://qn.d-dou.com/dcep/dbean/d71b111a77ff4de0b2f8bdc55c14dbc5xol16p.png'
          />
        </div>
      </div>
      <DatePicker
        title='选择开始时间'
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        precision={precision}
        min={min}
        max={endDate}
        renderLabel={labelRenderer}
        onConfirm={(v: Date) => {
          setShowStartDatePicker(false);
          onStartDateConfirm(v);
          if (gap) {
            let t = new Date(v.getTime() + gap * 24 * 60 * 60 * 1000);
            onEndDateConfirm(t > max ? max : t);
          }
        }}
      />
      <DatePicker
        title='选择结束时间'
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        precision={precision}
        min={startDate}
        max={max}
        renderLabel={labelRenderer}
        onConfirm={(v: Date) => {
          setShowEndDatePicker(false);
          onEndDateConfirm(v);
        }}
      />
    </div>
  );
};

export default memo(RangeDatePicker);
