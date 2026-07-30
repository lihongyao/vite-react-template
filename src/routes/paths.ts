// Canonical business paths and patterns. Locale prefixes are added by the i18n layer.
export const TAB_ROUTE_PATHS = {
  Home: '/',
  Goods: '/goods',
  PrivilegeBrand: '/privilege-brand',
  Integral: '/integral',
  Profile: '/profile',
} as const;

export const PAGE_ROUTE_PATHS = {
  Apply: '/apply',
  GoodsDetail: '/goods/:id',
} as const;

export const ROUTE_PATHS = {
  ...TAB_ROUTE_PATHS,
  ...PAGE_ROUTE_PATHS,
} as const;

export type AppRoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
export type TabRoutePath = (typeof TAB_ROUTE_PATHS)[keyof typeof TAB_ROUTE_PATHS];

type ChildRoutePath = Exclude<AppRoutePath, typeof ROUTE_PATHS.Home>;

/** Convert a canonical absolute path into a path for a nested route definition. */
export function toChildPath(path: ChildRoutePath) {
  return path.slice(1);
}
