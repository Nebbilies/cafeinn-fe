'use client';

import { useState } from 'react';
import { Alert, Badge, Box, Button, Divider, Group, Paper, Stack, Tabs, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import { PortalPageHeader } from '@/features/portal/components/portal-page-header';
import { artistErrorKey } from '../api/artists.api';
import { useArtistDetail } from '../hooks/use-artists';
import { formatArtistCode } from '../schemas/artist.schema';
import { ArtistContactPicker } from './artist-contact-picker';
import { ArtistContactsPanel } from './artist-contacts-panel';

function EventProgramArtistPanel() {
  const { t } = useTranslation();
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const selectedDetail = useArtistDetail(selectedArtistId);
  const selectedArtist = selectedDetail.data ?? null;

  return (
    <Paper withBorder p="lg">
      <Stack gap="md">
        <Box>
          <Text fw={600} size="md">
            {t('events.programs.workspaceTitle')}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {t('events.programs.workspaceNote')}
          </Text>
        </Box>

        <Box maw={520}>
          <ArtistContactPicker
            value={selectedArtistId}
            onChange={(artist) => setSelectedArtistId(artist?.id ?? null)}
          />
        </Box>

        {selectedArtistId !== null && selectedDetail.isPending && (
          <Text size="sm" c="dimmed" role="status">
            {t('auth.loading')}
          </Text>
        )}

        {selectedArtistId !== null && selectedDetail.error && (
          <Alert color="error" role="alert" icon={<CafeIcon name="info" />}>
            <Stack gap="xs">
              <Text size="sm">
                {t(artistErrorKey(selectedDetail.error), {
                  defaultValue: t('auth.errors.generic'),
                })}
              </Text>
              <Group gap="xs">
                <Button
                  variant="default"
                  size="xs"
                  loading={selectedDetail.isFetching}
                  onClick={() => {
                    void selectedDetail.refetch();
                  }}
                >
                  {t('retry')}
                </Button>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setSelectedArtistId(null)}
                >
                  {t('events.programs.clearSelection')}
                </Button>
              </Group>
            </Stack>
          </Alert>
        )}

        {selectedArtist ? (
          <Paper withBorder p="md" radius="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <Box style={{ minWidth: 0, flex: 1 }}>
                  <Text size="xs" c="dimmed">
                    {t('events.programs.selectedTitle')}
                  </Text>
                  <Group gap="xs" mt={4} wrap="wrap">
                    <Text fw={600} size="sm">
                      {formatArtistCode(selectedArtist.id)} · {selectedArtist.stageName}
                    </Text>
                    <Badge variant="light" size="sm" tt="none">
                      {t(`events.artists.kinds.${selectedArtist.kind}`)}
                    </Badge>
                    <Badge
                      variant="dot"
                      size="sm"
                      color={selectedArtist.status === 'ACTIVE' ? 'success' : 'neutral'}
                    >
                      {t(`events.artists.status.${selectedArtist.status}`)}
                    </Badge>
                  </Group>
                </Box>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setSelectedArtistId(null)}
                >
                  {t('events.programs.clearSelection')}
                </Button>
              </Group>

              <Divider />

              <Group gap="lg" wrap="wrap">
                <Text size="sm">
                  <Text span c="dimmed">
                    {t('events.artists.fields.email')}:{' '}
                  </Text>
                  {selectedArtist.email}
                </Text>
                <Text size="sm">
                  <Text span c="dimmed">
                    {t('events.artists.fields.phone')}:{' '}
                  </Text>
                  {selectedArtist.phone || t('auth.notProvided')}
                </Text>
                {selectedArtist.genre && (
                  <Text size="sm">
                    <Text span c="dimmed">
                      {t('events.artists.fields.genre')}:{' '}
                    </Text>
                    {selectedArtist.genre}
                  </Text>
                )}
              </Group>

              {selectedArtist.notes && (
                <Text size="sm" c="dimmed">
                  {selectedArtist.notes}
                </Text>
              )}
            </Stack>
          </Paper>
        ) : (
          selectedArtistId === null && (
            <Alert color="info" icon={<CafeIcon name="info" />}>
              {t('events.programs.selectedEmpty')}
            </Alert>
          )
        )}
      </Stack>
    </Paper>
  );
}

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
            <EventProgramArtistPanel />
          </Tabs.Panel>

          <Tabs.Panel value="artists" pt="md">
            <ArtistContactsPanel />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </>
  );
}
