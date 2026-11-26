'use client';

import { Paper, Stack, Tabs, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { PortalPageHeader } from '@/features/portal/components/portal-page-header';
import { ArtistContactsPanel } from './artist-contacts-panel';

export function EventsPage() {
  const { t } = useTranslation();

  return (
    <>
      <PortalPageHeader title={t('portal.sections.events')} />
      <Stack p="lg" gap="md">
        <Tabs defaultValue="artists">
          <Tabs.List>
            <Tabs.Tab value="programs">{t('events.tabs.programs')}</Tabs.Tab>
            <Tabs.Tab value="artists">{t('events.tabs.artists')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="programs" pt="md">
            <Paper withBorder p="lg">
              <Text c="dimmed">{t('portal.placeholder')}</Text>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="artists" pt="md">
            <ArtistContactsPanel />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </>
  );
}
