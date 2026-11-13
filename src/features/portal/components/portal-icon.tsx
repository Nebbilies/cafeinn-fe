import type { CSSProperties } from 'react';
import type { PortalSection } from '../portal-navigation';
import classes from './portal.module.css';

export function PortalIcon({ name }: { name: PortalSection['icon'] | 'chevron-left' }) {
  return (
    <span
      aria-hidden="true"
      className={classes.icon}
      data-chevron={name === 'chevron-left' || undefined}
      style={{ '--portal-icon': `url('/portal/icons/${name}.svg')` } as CSSProperties}
    />
  );
}
