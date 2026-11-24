'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionQuery, staffRequest } from '@/features/auth/api/auth.api';
import { getPortalSection, permittedSections } from '../portal-navigation';
import Link from 'next/link';
import { ActionIcon, AppShell, Avatar, Burger, Drawer, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { getAccountInitial } from '../portal-account';
import { PortalNavigation } from './portal-navigation';
import { PortalIcon } from './portal-icon';
import classes from './portal.module.css';

export function PortalShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpened, setMobileOpened] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const client = useQueryClient();
  const session = useQuery(sessionQuery);
  const sections = permittedSections(session.data?.permissions ?? []);
  const section = getPortalSection(pathname);
  const allowed = sections.some((item) => item.slug === section?.slug);
  const destination =
    session.data === null
      ? '/login'
      : session.data && !allowed && sections.length
        ? '/portal/' + sections[0].slug
        : null;
  useEffect(() => {
    if (session.data !== undefined && !session.data?.permissions.includes('users.manage'))
      client.removeQueries({ queryKey: ['private', 'employees'] });
    if (destination) router.replace(destination);
  }, [client, destination, router, session.data]);
  const signOut = useMutation({
    mutationFn: () => staffRequest('/auth/logout', 'POST'),
    onSuccess: async () => {
      await client.cancelQueries({ queryKey: sessionQuery.queryKey, exact: true });
      client.setQueryData(sessionQuery.queryKey, null);
      client.removeQueries({ queryKey: ['private', 'employees'] });
    },
  });
  const logoutAction = (
    <>
      <ActionIcon
        variant="subtle"
        color="error"
        size={36}
        loading={signOut.isPending}
        aria-label={t('auth.logout')}
        title={t('auth.logout')}
        onClick={() => signOut.mutate()}
      >
        <PortalIcon name="logout" />
      </ActionIcon>
      {signOut.isError && <Text role="alert">{t('auth.errors.generic')}</Text>}
    </>
  );
  if (session.isError)
    return (
      <Text role="alert">
        {t('auth.errors.generic')} <button onClick={() => session.refetch()}>{t('auth.retry')}</button>
      </Text>
    );
  if (session.data && !sections.length) {
    return (
      <Group p="md">
        <Text role="status">{t('auth.errors.FORBIDDEN')}</Text>
        {logoutAction}
      </Group>
    );
  }
  if (!session.data || !allowed) return <Text role="status">{t('auth.loading')}</Text>;

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: collapsed ? 72 : 224, breakpoint: '48em', collapsed: { mobile: true } }}
      transitionDuration={0}
      classNames={{ header: classes.header, navbar: classes.sidebar, main: classes.main }}
    >
      <a href="#portal-content" className={classes.skipLink}>
        {t('portal.skipToContent')}
      </a>
      <AppShell.Header>
        <div className={classes.headerBrand}>
          <Burger
            hiddenFrom="sm"
            opened={mobileOpened}
            onClick={() => setMobileOpened((opened) => !opened)}
            size="sm"
            aria-label={t('portal.openMenu')}
            aria-expanded={mobileOpened}
            aria-controls="portal-mobile-menu"
          />
          <Link href="/portal" aria-label={t('portal.home')} className={classes.logoLink}>
            <BrandLogo height={39.68} />
          </Link>
        </div>
        <div className={classes.account}>
          <Avatar size={32} radius="xl" classNames={{ placeholder: classes.avatar }} aria-hidden="true">
            {getAccountInitial(session.data.fullName)}
          </Avatar>
          <Text size="sm" fw={500} truncate className={classes.accountName}>
            {session.data.fullName}
          </Text>
          {logoutAction}
        </div>
      </AppShell.Header>
      <AppShell.Navbar>
        <div className={classes.sidebarControls}>
          {!collapsed && (
            <Text size="xs" fw={600} c="dimmed">
              {t('portal.menu')}
            </Text>
          )}
          <ActionIcon
            variant="subtle"
            color="neutral"
            size={40}
            className={classes.toggle}
            data-collapsed={collapsed || undefined}
            onClick={() => setCollapsed((value) => !value)}
            aria-label={t(collapsed ? 'portal.expandMenu' : 'portal.collapseMenu')}
            aria-expanded={!collapsed}
            aria-controls="portal-desktop-menu"
          >
            <PortalIcon name="chevron-left" />
          </ActionIcon>
        </div>
        <div id="portal-desktop-menu" className={classes.menuScroll}>
          <PortalNavigation sections={sections} collapsed={collapsed} />
        </div>
        <div className={classes.sessionSlot} />
      </AppShell.Navbar>
      <Drawer
        id="portal-mobile-menu"
        opened={mobileOpened}
        onClose={() => setMobileOpened(false)}
        title={t('portal.menu')}
        size={280}
        padding="md"
        transitionProps={{ duration: 0 }}
        closeButtonProps={{ 'aria-label': t('portal.closeMenu') }}
        classNames={{ content: classes.drawer, header: classes.drawerHeader }}
      >
        <PortalNavigation sections={sections} onNavigate={() => setMobileOpened(false)} />
      </Drawer>
      <AppShell.Main>
        <div id="portal-content" tabIndex={-1} className={classes.content}>
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
