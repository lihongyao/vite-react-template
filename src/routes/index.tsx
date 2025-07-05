import Layout from '@/layout';
import Home from '@/pages/Home';
import Integral from '@/pages/Integral';
import Mine from '@/pages/Mine';
import PrivilegeBrand from '@/pages/PrivilegeBrand';
import Login from '@/pages/Login';
import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Auth from '@/pages/Auth';
const Details = lazy(() => import('@/pages/Details'));
const NotFound = lazy(() => import('@/pages/404'));
const Download = lazy(() => import('@/pages/Download'));
const Test = lazy(() => import('@/pages/Test'));

const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <Layout />,
			children: [
				{ index: true, element: <Home /> },
				{ path: 'privilege-brand', element: <PrivilegeBrand /> },
				{ path: 'integral', element: <Integral /> },
				{ path: 'mine', element: <Mine /> }
			]
		},
		{ path: '/auth/:type', element: <Auth /> },
		{ path: '/login', element: <Login /> },
		{ path: '/details', element: <Details /> },
		{ path: '/download', element: <Download /> },
		{ path: '/test', element: <Test /> },
		{ path: '*', element: <NotFound /> }
	],
	{
		/** 部署二级目录时必须指定 */
		basename: import.meta.env.VITE_BASE.slice(0, -1)
	}
);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
