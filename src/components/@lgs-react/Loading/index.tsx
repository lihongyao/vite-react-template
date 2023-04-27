/*
 * @Author: Lee
 * @Date: 2021-12-18 21:36:40
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-18 22:16:10
 */

import classNames from 'lg-classnames';
import React, { memo } from 'react';
import './index.less';
interface Iprops {
  color?: string;
  tips?: string;
  top?: number;
  direction?: 'vertical' | 'horizontal';
}
const Loading: React.FC<Iprops> = ({
  color = '#999999',
  tips,
  top = 50,
  direction = 'horizontal',
}) => {
  return (
    <div
      className={classNames([
        'lg-loading',
        { vertical: direction === 'vertical' },
      ])}
      style={{
        paddingTop: top,
      }}
    >
      {tips && (
        <div
          className='lg-loading__tips'
          style={{
            color,
          }}
        >
          {tips}
        </div>
      )}
      <div className='lg-loading__wrap'>
        {new Array(3).fill(1).map((item, index) => (
          <div
            className='lg-loading__idot'
            style={{
              background: color,
            }}
            key={index}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default memo(Loading);
