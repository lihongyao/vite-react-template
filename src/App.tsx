/*
 * @Author: Lee
 * @Date: 2021-11-12 14:46:06
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-13 18:13:33
 */

import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

import Fallback from '@/components/@lgs-react/Fallback';
import Layout from '@/layout';
import IndexPage from '@/pages/IndexPage';
import Integral from '@/pages/Integral';
import Mine from '@/pages/Mine';
import PrivilegeBrand from '@/pages/PrivilegeBrand';
import Auth from '@/pages/Auth';
import NotFound from './pages/NotFound';
import NotEnv from './components/@lgs-react/NotEnv';

import Tools from 'lg-tools';

const Details = React.lazy(() => import('@/pages/Details'));

/**
 * 环境判断
 * 如果 VITE_APP_SOURCE === 'mp'，即表示公众号/生活号
 * 那么在浏览器环境将提示 “请在微信或支付宝客户端打开链接”
 * @param param0
 * @returns
 */
export const GuardEnv: React.FC = ({ children }) => {
  return import.meta.env.VITE_APP_SOURCE === 'mp' &&
    ['weixin', 'alipay'].indexOf(Tools.getEnv()) === -1 ? (
    <NotEnv />
  ) : (
    <>{children}</>
  );
};

/**
 * appRouter
 * @returns
 */
export const AppRouter: React.FC = ({ children }) => {
  return (
    <Suspense fallback={Fallback}>
      <Router basename={import.meta.env.VITE_APP_BASE}>{children}</Router>
    </Suspense>
  );
};

/**
 * appRoutes - 渲染路由
 * @returns
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='index' element={<IndexPage />} />
        <Route path='privilege-brand' element={<PrivilegeBrand />} />
        <Route path='integral' element={<Integral />} />
        <Route path='mine' element={<Mine />} />
      </Route>
      <Route path='/details' element={<Details />} />
      <Route path='/auth/:type' element={<Auth />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};
