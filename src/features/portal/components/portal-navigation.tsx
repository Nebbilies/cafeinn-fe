'use client';

import Link from 'next/link';
import { Tooltip, UnstyledButton } from '@mantine/core';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getPortalSection, portalSections } from '../portal-navigation';
import { PortalIcon } from './portal-icon';
import classes from './portal.module.css';

export function PortalNavigation({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const activeSection = getPortalSection(pathname);

  return (
    <nav aria-label={t('portal.navigation')} className={classes.navigation}>
      {portalSections.map((section) => {
        const label = t(`portal.sections.${section.slug}`);
        const active = activeSection?.slug === section.slug;
        return (
          <Tooltip key={section.slug} label={label} position="right" disabled={!collapsed} events={{ hover: true, focus: true, touch: false }} transitionProps={{ duration: 0 }}>
            <UnstyledButton
              component={Link}
              href={`/portal/${section.slug}`}
              className={classes.navLink}
              data-active={active || undefined}
              data-collapsed={collapsed || undefined}
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? label : undefined}
              title={collapsed ? undefined : label}
              onClick={onNavigate}
            >
              <PortalIcon name={section.icon} />
              {!collapsed && <span className={classes.navLabel}>{label}</span>}
            </UnstyledButton>
          </Tooltip>
        );
      })}
    </nav>
  );
}
