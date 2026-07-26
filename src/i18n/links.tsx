import type { LinkProps, NavLinkProps } from 'react-router';
import { Link, NavLink } from 'react-router';

import { localizeTo, useCurrentLocale } from './navigation';

export function LocalizedLink({ to, ...props }: LinkProps) {
  const locale = useCurrentLocale();
  return <Link {...props} to={localizeTo(to, locale)} />;
}

export function LocalizedNavLink({ to, ...props }: NavLinkProps) {
  const locale = useCurrentLocale();
  return <NavLink {...props} to={localizeTo(to, locale)} />;
}
