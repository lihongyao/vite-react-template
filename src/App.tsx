/*
 * @Author: Lee
 * @Date: 2021-11-12 14:46:06
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-13 17:34:49
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Fallback from '@/components/@lgs-react/Fallback';
import Layout from '@/layout';
import IndexPage from '@/pages/IndexPage';
import Integral from '@/pages/Integral';
import Mine from '@/pages/Mine';
import PrivilegeBrand from '@/pages/PrivilegeBrand';
import Auth from '@/pages/Auth';
import NotFound from './pages/NotFound';

const Details = React.lazy(() => import('@/pages/Details'));

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
