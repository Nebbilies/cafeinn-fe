import type { CSSProperties } from 'react';
import type { PortalSection } from '../portal-navigation';
import classes from './portal.module.css';

export function PortalIcon({ name }: { name: PortalSection['icon'] | 'chevron-left' | 'search' | 'logout' | 'sort' }) {
  return (
    <span
      aria-hidden="true"
      className={classes.icon}
      data-current-color={['chevron-left', 'search', 'logout', 'sort'].includes(name) || undefined}
      style={{ '--portal-icon': `url('/portal/icons/${name}.svg')` } as CSSProperties}
    />
  );
}
