'use client';

import { Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { PortalPageHeader } from '@/features/portal/components/portal-page-header';
import { ProgramList } from './program-list';

export function EventsPage() {
  const { t } = useTranslation();

  return (
    <>
      <PortalPageHeader title={t('portal.sections.events')} />
      <Stack p="lg" gap="md">
        <ProgramList />
      </Stack>
    </>
  );
}
