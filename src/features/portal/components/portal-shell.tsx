'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ActionIcon, AppShell, Avatar, Burger, Drawer, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { getAccountInitial } from '../portal-account';
import { PortalNavigation } from './portal-navigation';
import { PortalIcon } from './portal-icon';
import classes from './portal.module.css';

// Layout fixture until an authenticated session supplies the display name.
const previewAccount = { displayName: 'Minh' };

export function PortalShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpened, setMobileOpened] = useState(false);

  return (
    <AppShell header={{ height: 64 }} navbar={{ width: collapsed ? 72 : 224, breakpoint: '48em', collapsed: { mobile: true } }} transitionDuration={0} classNames={{ header: classes.header, navbar: classes.sidebar, main: classes.main }}>
      <a href="#portal-content" className={classes.skipLink}>{t('portal.skipToContent')}</a>
      <AppShell.Header>
        <div className={classes.headerBrand}>
          <Burger hiddenFrom="sm" opened={mobileOpened} onClick={() => setMobileOpened((opened) => !opened)} size="sm" aria-label={t('portal.openMenu')} aria-expanded={mobileOpened} aria-controls="portal-mobile-menu" />
          <Link href="/portal" aria-label={t('portal.home')} className={classes.logoLink}><BrandLogo height={39.68} /></Link>
        </div>
        <div className={classes.account}>
          <Avatar size={32} radius="xl" classNames={{ placeholder: classes.avatar }} aria-hidden="true">{getAccountInitial(previewAccount.displayName)}</Avatar>
          <Text size="sm" fw={500} truncate className={classes.accountName}>{previewAccount.displayName}</Text>
        </div>
      </AppShell.Header>
      <AppShell.Navbar>
        <div className={classes.sidebarControls}>
          {!collapsed && <Text size="xs" fw={600} c="dimmed">{t('portal.menu')}</Text>}
          <ActionIcon variant="subtle" color="neutral" size={40} className={classes.toggle} data-collapsed={collapsed || undefined} onClick={() => setCollapsed((value) => !value)} aria-label={t(collapsed ? 'portal.expandMenu' : 'portal.collapseMenu')} aria-expanded={!collapsed} aria-controls="portal-desktop-menu"><PortalIcon name="chevron-left" /></ActionIcon>
        </div>
        <div id="portal-desktop-menu" className={classes.menuScroll}><PortalNavigation collapsed={collapsed} /></div>
        <div className={classes.sessionSlot} />
      </AppShell.Navbar>
      <Drawer id="portal-mobile-menu" opened={mobileOpened} onClose={() => setMobileOpened(false)} title={t('portal.menu')} size={280} padding="md" transitionProps={{ duration: 0 }} closeButtonProps={{ 'aria-label': t('portal.closeMenu') }} classNames={{ content: classes.drawer, header: classes.drawerHeader }}>
        <PortalNavigation onNavigate={() => setMobileOpened(false)} />
      </Drawer>
      <AppShell.Main><div id="portal-content" tabIndex={-1} className={classes.content}>{children}</div></AppShell.Main>
    </AppShell>
  );
}
