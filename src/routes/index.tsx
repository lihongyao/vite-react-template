import { lazy } from 'react';

import type { RouteObject } from 'react-router';
import { RouterProvider, createBrowserRouter } from 'react-router';

import { AppErrorFallback } from '@/components/features/AppErrorBoundary';
import type { RouteTransitionHandle } from '@/components/features/RouteTransition/types';
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

import { ROUTE_PATHS, toChildPath } from './paths';

const Apply = lazy(() => import('@/pages/Apply'));

const tabTransitionHandle = {
  transitionSurface: 'tab',
} satisfies RouteTransitionHandle;

const stackTransitionHandle = {
  transitionSurface: 'stack',
} satisfies RouteTransitionHandle;

function createPageRoutes(): RouteObject[] {
  return [
    { index: true, element: <Home />, handle: tabTransitionHandle },
    {
      path: toChildPath(ROUTE_PATHS.Goods),
      element: <Goods />,
      handle: tabTransitionHandle,
    },
    {
      path: toChildPath(ROUTE_PATHS.PrivilegeBrand),
      element: <PrivilegeBrand />,
      handle: tabTransitionHandle,
    },
    {
      path: toChildPath(ROUTE_PATHS.Integral),
      element: <Integral />,
      handle: tabTransitionHandle,
    },
    {
      path: toChildPath(ROUTE_PATHS.Profile),
      element: <Profile />,
      handle: tabTransitionHandle,
    },
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
        path: toChildPath(ROUTE_PATHS.Apply),
        element: <Apply />,
        handle: stackTransitionHandle,
      },
      {
        path: toChildPath(ROUTE_PATHS.GoodsDetail),
        element: <GoodsDetail />,
        handle: stackTransitionHandle,
      },
      {
        path: '*',
        element: <NotFound />,
        handle: stackTransitionHandle,
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
