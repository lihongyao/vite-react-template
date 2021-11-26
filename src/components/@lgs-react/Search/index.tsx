/*
 * @Author: Lee
 * @Date: 2021-05-13 13:40:56
 * @LastEditors: Lee
 * @LastEditTime: 2021-09-14 15:30:07
 */
import React, { memo, useState, useCallback, CSSProperties } from 'react';
import Field from '../Field/index';
import './index.less';

interface IProps {
  value: string;
  fieldStyle?: CSSProperties;
  placeHolder?: string;
  placeHolderColor?: string;
  backgroundColor?: string;
  buttonText?: string;
  maxLength?: number;
  onChange: (value: string) => void;
  onButtonTap?: (value: string) => void;
}
const Search: React.FC<IProps> = ({
  value,
  placeHolder = '请输入搜索关键字',
  placeHolderColor = '#999999',
  backgroundColor = '#FFFFFF',
  fieldStyle = {},
  buttonText = '搜索',
  maxLength = 20,
  onChange,
  onButtonTap,
}) => {
  // state
  const [keyword, setKeyword] = useState('');
  // events
  const onFieldChange = useCallback(
    (value: string) => {
      setKeyword(value);
      onChange(value);
    },
    [onChange],
  );
  // render
  return (
    <div className="lg-search" style={{ backgroundColor }}>
      <div className="lg-search__box">
        <img
          className="lg-search__icon"
          src={require('./images/icon_search.png')}
          alt="icon_search"
        />
        <Field
          placeHolder={placeHolder}
          placeHolderColor={placeHolderColor}
          value={value}
          fieldStyle={fieldStyle}
          onChange={onFieldChange}
          maxLength={maxLength}
        />
      </div>
      <section
        className="lg-search__buttton"
        onClick={() => {
          onButtonTap && onButtonTap(keyword);
        }}
      >
        {buttonText}
      </section>
    </div>
  );
};

export default memo(Search);
