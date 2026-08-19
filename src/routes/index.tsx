import type { LoaderFunctionArgs, RouteObject } from 'react-router';
import { RouterProvider, createBrowserRouter, replace } from 'react-router';

import { AppErrorFallback } from '@/components/features/AppErrorBoundary';
import {
  StartupHydrateFallback,
  StartupRouteErrorBoundary,
  appStartupMiddleware,
  appStartupRouteContext,
} from '@/components/features/AppStartup';
import type { RouteTransitionHandle } from '@/components/features/RouteTransition/types';
import { LOCALE_CONFIG, type Locale, SUPPORTED_LOCALES } from '@/i18n/config';
import LocaleLayout, { createLocaleLoader } from '@/i18n/locale-route';
import { localizePathname } from '@/i18n/routing';
import RootLayout from '@/layout';
import Goods from '@/pages/Goods';
import Home from '@/pages/Home';
import Integral from '@/pages/Integral';
import Menu from '@/pages/Menu';
import NotFound from '@/pages/NotFound';
import PrivilegeBrand from '@/pages/PrivilegeBrand';

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

function createHomeLoader(locale: Locale) {
  return ({ context }: LoaderFunctionArgs) => {
    const startup = context.get(appStartupRouteContext);
    if (!startup.isAgent) throw replace(localizePathname(ROUTE_PATHS.Apply, locale));

    return null;
  };
}

function createPageRoutes(locale: Locale): RouteObject[] {
  return [
    {
      index: true,
      element: <Home />,
      handle: tabRouteHandles.home,
      loader: createHomeLoader(locale),
    },
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
          ...createPageRoutes(locale),
          {
            path: toChildPath(ROUTE_PATHS.Profile),
            lazy: {
              Component: async () => (await import('@/pages/Profile')).default,
            },
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
            lazy: {
              Component: async () => (await import('@/pages/GoodsDetail')).default,
            },
            handle: stackTransitionHandle,
          },
          {
            path: toChildPath(ROUTE_PATHS.Transactions),
            lazy: {
              Component: async () => (await import('@/pages/Transactions')).default,
            },
            handle: stackTransitionHandle,
          },
          {
            path: toChildPath(ROUTE_PATHS.TransactionDetail),
            lazy: {
              Component: async () => (await import('@/pages/TransactionDetail')).default,
            },
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

const routes: RouteObject[] = [
  {
    id: 'app-startup',
    middleware: [appStartupMiddleware],
    loader: () => null,
    HydrateFallback: StartupHydrateFallback,
    ErrorBoundary: StartupRouteErrorBoundary,
    children: localeRoutes,
  },
];

// Router creation is deferred until i18next has finished initializing.
// oxlint-disable-next-line react/only-export-components
export function createAppRouter() {
  return createBrowserRouter(routes, {
    /** 部署二级目录时必须指定 */
    basename: import.meta.env.VITE_APP_BASE?.slice(0, -1),
  });
}

type AppRoutesProps = {
  router: ReturnType<typeof createAppRouter>;
};

const AppRoutes = ({ router }: AppRoutesProps) => <RouterProvider router={router} />;

export default AppRoutes;
