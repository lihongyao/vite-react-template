/*
 * @Author: Lee
 * @Date: 2023-04-27 14:23:28
 * @LastEditors: Lee
 * @LastEditTime: 2023-04-27 16:30:58
 * @Description:
 */
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Fallback from '@/components/@lgs-react/Fallback';

import Auth from '@/pages/Auth';
import Layout from '@/layout';
import IndexPage from '@/pages/IndexPage';
import Integral from '@/pages/Integral';
import Mine from '@/pages/Mine';
import PrivilegeBrand from '@/pages/PrivilegeBrand';
import NotFound from '@/pages/NotFound';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <IndexPage /> },
        { path: 'privilege-brand', element: <PrivilegeBrand /> },
        { path: 'integral', element: <Integral /> },
        { path: 'mine', element: <Mine /> },
      ],
    },
    { path: '/auth/:type', element: <Auth /> },
    { path: '/details', lazy: () => import('@/pages/Details') },
    { path: '/download', lazy: () => import('@/pages/Download') },
    { path: '*', element: <NotFound /> },
  ],
  {
    /** 部署二级目录时必须指定 */
    basename: import.meta.env.VITE_APP_BASE,
  }
);

const AppRoutes = () => (
  <RouterProvider router={router} fallbackElement={Fallback} />
);

export default AppRoutes;
