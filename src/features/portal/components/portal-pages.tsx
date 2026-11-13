'use client';

import Link from 'next/link';
import { Anchor, Paper, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { portalSections, type PortalSection } from '../portal-navigation';
import { PortalPageHeader } from './portal-page-header';
import { PortalIcon } from './portal-icon';
import classes from './portal.module.css';

export function PortalHome() {
  const { t } = useTranslation();
  return (
    <>
      <PortalPageHeader title={t('portal.home')} />
      <div className={classes.pageBody}>
        <Stack gap="lg">
          <Text c="dimmed">{t('portal.welcome')}</Text>
          <div className={classes.destinationGrid}>
            {portalSections.map((section) => (
              <Anchor component={Link} key={section.slug} href={`/portal/${section.slug}`} className={classes.destination} underline="never">
                <PortalIcon name={section.icon} /><span>{t(`portal.sections.${section.slug}`)}</span>
              </Anchor>
            ))}
          </div>
        </Stack>
      </div>
    </>
  );
}

export function PortalSectionPage({ section }: { section: PortalSection['slug'] }) {
  const { t } = useTranslation();
  return (
    <>
      <PortalPageHeader title={t(section === 'employees' ? 'portal.employeesTitle' : `portal.sections.${section}`)} />
      <div className={classes.pageBody}>
        <Paper withBorder p="lg"><Text c="dimmed">{t('portal.placeholder')}</Text></Paper>
      </div>
    </>
  );
}
