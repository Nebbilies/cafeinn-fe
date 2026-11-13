import type { ReactNode } from 'react';
import classes from './portal.module.css';

export function PortalPageHeader({ title, context, actions }: { title: string; context?: string; actions?: ReactNode }) {
  return (
    <header className={classes.pageHeader}>
      <div className={classes.pageIdentity}>
        <h1 className={classes.pageTitle}>{title}</h1>
        {context && <p className={classes.pageContext}>{context}</p>}
      </div>
      {actions && <div className={classes.pageActions}>{actions}</div>}
    </header>
  );
}
