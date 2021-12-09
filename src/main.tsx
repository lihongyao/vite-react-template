/*
 * @Author: Lee
 * @Date: 2021-08-31 15:50:32
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-09 21:56:16
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from '@/components/@lgs-react/ErrorBoundary';

import '@/utils/rem';
import '@/index.css';
import { AppRouter, AppRoutes } from './App';

// import vconsole from 'vconsole';

//  1. 开发环境 & 测试环境 启用vconsole
if (import.meta.env.VITE_APP_ENV !== 'pro') {
  // new vconsole();
}

// 2. 记录出入进入程序时的url地址（用于配置iOS js-sdk）
window.CONFIG_URL_FOR_IOS = window.location.href;
console.log(window.CONFIG_URL_FOR_IOS);
// 3. 渲染视图
ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppRouter>
        <AppRoutes />
      </AppRouter>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
