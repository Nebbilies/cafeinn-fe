'use client';

import { Paper, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { PortalSection } from '../portal-navigation';
import { PortalPageHeader } from './portal-page-header';

import classes from './portal.module.css';



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
