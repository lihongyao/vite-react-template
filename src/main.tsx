/*
 * @Author: Lee
 * @Date: 2021-08-31 15:50:32
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-17 14:02:49
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from '@/components/@lgs-react/ErrorBoundary';

import '@/utils/rem';
import '@/index.css';
import { AppRouter, AppRoutes, GuardEnv } from './App';
import Schemes from 'lg-schemes';

// 1. 开发环境 & 测试环境 启用vconsole
import vconsole from 'vconsole';
if (import.meta.env.VITE_APP_ENV !== 'pro') {
  new vconsole();
}

// 2. 记录出入进入程序时的url地址（用于配置iOS js-sdk）
window.CONFIG_URL_FOR_IOS = window.location.href;

// 3. Schemes地址（APP嵌套H5模式）
// Schemes.config("xxx://www.xxx.com");

// 4. 渲染视图
ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <GuardEnv>
        <AppRouter>
          <AppRoutes />
        </AppRouter>
      </GuardEnv>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
