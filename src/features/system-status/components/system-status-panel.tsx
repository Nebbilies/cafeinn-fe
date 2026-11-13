'use client';

import { Badge, Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { useSystemStatus } from '../hooks/use-system-status';

export function SystemStatusPanel() {
  const { t } = useTranslation();
  const status = useSystemStatus();
  const state = status.isPending ? 'loading' : status.isError ? 'offline' : 'online';

  return (
    <Container size="sm" py={{ base: 32, sm: 72 }}>
      <Stack gap="xl">
        <Group justify="space-between" align="center" wrap="wrap">
          <BrandLogo />
          <LocaleSwitcher />
        </Group>
        <Stack gap="sm">
          <Text size="xs" tt="uppercase" fw={500} c="dimmed" style={{ letterSpacing: '0.16em' }}>
            {t('eyebrow')}
          </Text>
          <Title order={1} size="h1">{t('title')}</Title>
          <Text c="dimmed" size="lg">{t('description')}</Text>
        </Stack>
        <Paper withBorder p="xl" radius="lg" shadow="xs">
          <Stack gap="md">
            <Group justify="space-between" wrap="wrap">
              <Title order={2} size="h3">{t('serviceTitle')}</Title>
              <Badge color={state === 'online' ? 'success' : state === 'offline' ? 'warning' : 'neutral'}
                variant="light" role="status">
                {t(state)}
              </Badge>
            </Group>
            <Text c="dimmed" aria-live="polite">{t(state + 'Description')}</Text>
            <Button variant="light" onClick={() => { void status.refetch(); }}
              loading={status.isFetching} style={{ alignSelf: 'flex-start' }}>
              {t('retry')}
            </Button>
          </Stack>
        </Paper>
        <Text size="sm" c="dimmed">{t('note')}</Text>
      </Stack>
    </Container>
  );
}
