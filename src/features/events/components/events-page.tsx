'use client';

import { Stack, Tabs } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { PortalPageHeader } from '@/features/portal/components/portal-page-header';
import { ArtistContactsPanel } from './artist-contacts-panel';
import { ProgramList } from './program-list';

export function EventsPage() {
  const { t } = useTranslation();

  return (
    <>
      <PortalPageHeader title={t('portal.sections.events')} />
      <Stack p="lg" gap="md">
        <Tabs defaultValue="programs">
          <Tabs.List>
            <Tabs.Tab value="programs">{t('events.tabs.programs')}</Tabs.Tab>
            <Tabs.Tab value="artists">{t('events.tabs.artists')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="programs" pt="md">
            <ProgramList />
          </Tabs.Panel>

          <Tabs.Panel value="artists" pt="md">
            <ArtistContactsPanel />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </>
  );
}
