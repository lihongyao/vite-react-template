/*
 * @Author: Lee
 * @Date: 2021-09-04 13:00:52
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-19 15:26:17
 */

import React, { memo, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './index.less';

const TabBar: React.FC = () => {
  const { pathname } = useLocation();
  const paths = useMemo(
    () => [
      {
        path: '/',
        text: '首页',
        iconPath: new URL('./images/icon_tab_1.png', import.meta.url),
        selectedIconPath: new URL(
          './images/icon_tab_1_sel.png',
          import.meta.url
        ),
      },
      {
        path: '/privilege-brand',
        text: '权益',
        iconPath: new URL('./images/icon_tab_2.png', import.meta.url),
        selectedIconPath: new URL(
          './images/icon_tab_2_sel.png',
          import.meta.url
        ),
      },
      {
        path: '/integral',
        text: '攒积分',
        iconPath: new URL('./images/icon_tab_3.png', import.meta.url),
        selectedIconPath: new URL(
          './images/icon_tab_3_sel.png',
          import.meta.url
        ),
      },
      {
        path: '/mine',
        text: '我的',
        iconPath: new URL('./images/icon_tab_4.png', import.meta.url),
        selectedIconPath: new URL(
          './images/icon_tab_4_sel.png',
          import.meta.url
        ),
      },
    ],
    []
  );
  return (
    <div className='lg-tab-bar'>
      {paths.map((v) => (
        <NavLink className='lg-tab-bar__item' key={v.path} to={v.path} replace>
          {pathname === v.path ? (
            <img className='icon' src={v.selectedIconPath.toString()} alt='' />
          ) : (
            <img className='icon' src={v.iconPath.toString()} alt='' />
          )}
          <span className='text'>{v.text}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default memo(TabBar);
