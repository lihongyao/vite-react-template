/*
 * @Author: Lee
 * @Date: 2021-08-31 15:50:32
 * @LastEditors: Lee
 * @LastEditTime: 2022-04-15 17:19:42
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from '@/components/@lgs-react/ErrorBoundary';

import '@/utils/rem';
import '@/index.css';
import { AppRouter, AppRoutes, GuardEnv } from './App';
import Schemes from 'lg-schemes';

// 1. 开发环境 & 测试环境 启用vconsole --- Tips：目前启用vconsole打包会出现异常
/*
import vconsole from 'vconsole';
if (import.meta.env.VITE_APP_ENV !== 'pro') {
  new vconsole();
}*/

// 2. 记录出入进入程序时的url地址（用于配置iOS js-sdk）
// window.CONFIG_URL_FOR_IOS = window.location.href;

// 3. Schemes地址（APP嵌套H5模式）
// Schemes.config("xxx://www.xxx.com");

// 4. 渲染视图
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GuardEnv>
        <AppRouter>
          <AppRoutes />
        </AppRouter>
      </GuardEnv>
    </ErrorBoundary>
  </React.StrictMode>
);
