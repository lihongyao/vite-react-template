import type { RouteObject } from 'react-router';
import { RouterProvider, createBrowserRouter } from 'react-router';

import { AppErrorFallback } from '@/components/features/AppErrorBoundary';
import type { RouteTransitionHandle } from '@/components/features/RouteTransition/types';
import { LOCALE_CONFIG, SUPPORTED_LOCALES } from '@/i18n/config';
import LocaleLayout, { createLocaleLoader } from '@/i18n/locale-route';
import RootLayout from '@/layout';
import Goods from '@/pages/Goods';
import GoodsDetail from '@/pages/GoodsDetail';
import Home from '@/pages/Home';
import Integral from '@/pages/Integral';
import Menu from '@/pages/Menu';
import NotFound from '@/pages/NotFound';
import PrivilegeBrand from '@/pages/PrivilegeBrand';
import Profile from '@/pages/Profile';

import { ROUTE_PATHS, toChildPath } from './paths';

const stackTransitionHandle = {
  transitionSurface: 'stack',
} satisfies RouteTransitionHandle;

const tabRouteHandles = {
  home: {
    sceneId: 'home',
    transitionSurface: 'tab',
    header: { title: 'Agent Center', description: 'Your monthly commission and referral data' },
  },
  goods: {
    sceneId: 'goods',
    transitionSurface: 'tab',
    header: { title: 'Goods', description: 'Discover products worth adding to your list' },
  },
  privilegeBrand: {
    sceneId: 'privilege-brand',
    transitionSurface: 'tab',
    header: { title: 'Brand Privileges', description: 'Exclusive offers from selected partners' },
  },
  integral: {
    sceneId: 'integral',
    transitionSurface: 'tab',
    header: { title: 'My Points', description: 'Track your points and recent rewards' },
  },
  menu: {
    sceneId: 'menu',
    transitionSurface: 'tab',
    header: { title: 'Menu', description: 'Explore services and account options' },
  },
} as const satisfies Record<string, RouteTransitionHandle & { header: object }>;

function createPageRoutes(): RouteObject[] {
  return [
    { index: true, element: <Home />, handle: tabRouteHandles.home },
    {
      path: toChildPath(ROUTE_PATHS.Goods),
      element: <Goods />,
      handle: tabRouteHandles.goods,
    },
    {
      path: toChildPath(ROUTE_PATHS.PrivilegeBrand),
      element: <PrivilegeBrand />,
      handle: tabRouteHandles.privilegeBrand,
    },
    {
      path: toChildPath(ROUTE_PATHS.Integral),
      element: <Integral />,
      handle: tabRouteHandles.integral,
    },
    {
      path: toChildPath(ROUTE_PATHS.Menu),
      element: <Menu />,
      handle: tabRouteHandles.menu,
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
        children: [
          ...createPageRoutes(),
          {
            path: toChildPath(ROUTE_PATHS.Profile),
            element: <Profile />,
            handle: stackTransitionHandle,
          },
          {
            path: toChildPath(ROUTE_PATHS.Apply),
            lazy: {
              Component: async () => (await import('@/pages/Apply')).default,
            },
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
