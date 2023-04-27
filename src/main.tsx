import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary, GuardEnv } from '@/App';
import AppRoutes from '@/routes';
import Schemes from 'lg-schemes';

import '@/utils/rem';
import '@/index.css';

// 1. 开发环境 & 测试环境 启用vconsole --- Tips：目前启用vconsole打包会出现异常
import vconsole from 'vconsole';

if (import.meta.env.VITE_APP_ENV !== 'pro') {
  new vconsole();
}

// 2. 记录出入进入程序时的url地址（用于配置iOS js-sdk）
window.CONFIG_URL_FOR_IOS = window.location.href;

// 3. Schemes地址（APP嵌套H5模式）
Schemes.config('xxx://www.xxx.com');

// 4. 渲染视图
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GuardEnv>
        <AppRoutes />
      </GuardEnv>
    </ErrorBoundary>
  </React.StrictMode>
);
