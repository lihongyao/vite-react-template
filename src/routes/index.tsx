import { lazy } from 'react';

import type { RouteObject } from 'react-router';
import { RouterProvider, createBrowserRouter } from 'react-router';

import { AppErrorFallback } from '@/components/features/AppErrorBoundary';
import LocaleLayout from '@/i18n/LocaleLayout';
import { LOCALE_CONFIG, SUPPORTED_LOCALES } from '@/i18n/config';
import { createLocaleLoader } from '@/i18n/locale-loader';
import RootLayout from '@/layout';
import Goods from '@/pages/Goods';
import GoodsDetail from '@/pages/GoodsDetail';
import Home from '@/pages/Home';
import Integral from '@/pages/Integral';
import NotFound from '@/pages/NotFound';
import PrivilegeBrand from '@/pages/PrivilegeBrand';
import Profile from '@/pages/Profile';

const Apply = lazy(() => import('@/pages/Apply'));

function createPageRoutes(): RouteObject[] {
  return [
    { index: true, element: <Home /> },
    { path: 'goods', element: <Goods /> },
    { path: 'privilege-brand', element: <PrivilegeBrand /> },
    { path: 'integral', element: <Integral /> },
    { path: 'profile', element: <Profile /> },
  ];
}

const localeRoutes: RouteObject[] = SUPPORTED_LOCALES.map((locale) => {
  const { pathPrefix } = LOCALE_CONFIG[locale];

  return {
    path: pathPrefix ? `/${pathPrefix}` : '/',
    loader: createLocaleLoader(locale),
    element: <LocaleLayout locale={locale} />,
    ErrorBoundary: AppErrorFallback,
    children: [
      {
        element: <RootLayout />,
        children: createPageRoutes(),
      },
      {
        path: 'apply',
        element: <Apply />,
      },
      {
        path: 'goods/:id',
        element: <GoodsDetail />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  };
});

// Router creation is deferred until i18next has finished initializing.
// oxlint-disable-next-line react/only-export-components
export function createAppRouter() {
  return createBrowserRouter(localeRoutes, {
    /** 部署二级目录时必须指定 */
    basename: import.meta.env.VITE_APP_BASE?.slice(0, -1),
  });
}

type AppRoutesProps = {
  router: ReturnType<typeof createAppRouter>;
};

const AppRoutes = ({ router }: AppRoutesProps) => <RouterProvider router={router} />;

export default AppRoutes;
