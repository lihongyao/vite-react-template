/*
 * @Author: Lee
 * @Date: 2021-10-18 15:30:08
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-03 14:49:31
 */
import React, { CSSProperties, FC, memo } from 'react';
import './index.less';

interface IProps {
  showTips?: boolean;
  tips?: string;
  top?: string;
  icon?: any;
  tipsStyle?: CSSProperties;
}
const Loading: FC<IProps> = ({
  top = '100px',
  tips = '数据加载中',
  showTips = true,
  icon,
  tipsStyle = {},
}) => {
  return (
    <div className='lg-loading2' style={{ paddingTop: top }}>
      <div className='lg-loading2__ct'>
        <img
          src={icon ? icon : new URL('./images/logo_1.png', import.meta.url)}
          alt=''
          className='lg-loading2__logo'
        />
        <div className='lg-loading2__icon' />
      </div>
      {showTips && (
        <div className='lg-loading2__tips' style={{ ...tipsStyle }}>
          {tips}
        </div>
      )}
    </div>
  );
};

export default memo(Loading);
