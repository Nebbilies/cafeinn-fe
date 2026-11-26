'use client';

import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  VisuallyHidden,
} from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/shared/api/api-error';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import { PortalIcon } from '@/features/portal/components/portal-icon';
import { artistErrorKey } from '../api/artists.api';
import { useArtistDetail, useArtists, useDeleteArtist } from '../hooks/use-artists';
import {
  artistKinds,
  artistStatuses,
  canDeleteArtist,
  formatArtistCode,
  type Artist,
  type ArtistKind,
  type ArtistSort,
  type ArtistStatus,
} from '../schemas/artist.schema';
import { ArtistContactInlineForm } from './artist-contact-inline-form';

const nextSort: Record<ArtistSort, ArtistSort> = {
  'id.asc': 'name.asc',
  'name.asc': 'name.desc',
  'name.desc': 'id.asc',
};

const tooltipEvents = { hover: true, focus: true, touch: true };

function ArtistDetailModal({
  artistId,
  onClose,
  onEdit,
}: {
  artistId: number | null;
  onClose: () => void;
  onEdit: (artist: Artist) => void;
}) {
  const { t } = useTranslation();
  const detail = useArtistDetail(artistId);
  const artist = detail.data;

  return (
    <Modal
      opened={artistId !== null}
      onClose={onClose}
      size={560}
      centered
      title={t('events.artists.detailTitle')}
      closeButtonProps={{ 'aria-label': t('auth.closeDialog') }}
    >
      {detail.isPending && <Text role="status">{t('auth.loading')}</Text>}
      {detail.error && (
        <Alert color="error" role="alert" icon={<CafeIcon name="info" />}>
          {t(artistErrorKey(detail.error), { defaultValue: t('auth.errors.generic') })}
        </Alert>
      )}
      {artist && (
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Text fw={600} size="lg">
                {artist.stageName}
              </Text>
              <Group gap="xs" mt={4}>
                <Text size="sm" c="dimmed">
                  {formatArtistCode(artist.id)}
                </Text>
                <Badge variant="light" tt="none">
                  {t(`events.artists.kinds.${artist.kind}`)}
                </Badge>
                <Badge variant="dot" color={artist.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {t(`events.artists.status.${artist.status}`)}
                </Badge>
              </Group>
            </Box>
          </Group>

          <Divider />

          <Box
            component="dl"
            m={0}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 10rem), 1fr))',
              gap: 'var(--mantine-spacing-md)',
              overflowWrap: 'anywhere',
            }}
          >
            <Box>
              <Text component="dt" size="sm" c="dimmed">
                {t('events.artists.fields.email')}
              </Text>
              <Text component="dd" m={0}>
                {artist.email}
              </Text>
            </Box>
            <Box>
              <Text component="dt" size="sm" c="dimmed">
                {t('events.artists.fields.phone')}
              </Text>
              <Text component="dd" m={0}>
                {artist.phone || t('auth.notProvided')}
              </Text>
            </Box>
            <Box>
              <Text component="dt" size="sm" c="dimmed">
                {t('events.artists.fields.genre')}
              </Text>
              <Text component="dd" m={0}>
                {artist.genre || t('auth.notProvided')}
              </Text>
            </Box>
            <Box>
              <Text component="dt" size="sm" c="dimmed">
                {t('events.artists.fields.history')}
              </Text>
              <Text component="dd" m={0}>
                {t('events.artists.historySummary', {
                  invitations: artist.invitationCount,
                  assignments: artist.assignmentCount,
                })}
              </Text>
            </Box>
            <Box style={{ gridColumn: '1 / -1' }}>
              <Text component="dt" size="sm" c="dimmed">
                {t('events.artists.fields.notes')}
              </Text>
              <Text component="dd" m={0}>
                {artist.notes || t('auth.notProvided')}
              </Text>
            </Box>
          </Box>

          <Alert color="info" icon={<CafeIcon name="info" />}>
            {t('events.artists.noAccountNote')}
          </Alert>

          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              size="sm"
              leftSection={<CafeIcon name="pencil" />}
              onClick={() => onEdit(artist)}
            >
              {t('studyRooms.actions.edit')}
            </Button>
            <Button variant="default" size="sm" onClick={onClose} data-autofocus>
              {t('studyRooms.close')}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

function ArtistDeleteModal({
  artist,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  artist: Artist | null;
  pending: boolean;
  error: unknown;
  onClose: () => void;
  onConfirm: (artist: Artist) => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      opened={artist !== null}
      onClose={onClose}
      size={480}
      centered
      title={t('events.artists.deleteTitle')}
      closeButtonProps={{ 'aria-label': t('auth.closeDialog') }}
    >
      <Stack gap="md">
        {error ? (
          <Alert color="error" role="alert" icon={<CafeIcon name="info" />}>
            {t(artistErrorKey(error), { defaultValue: t('auth.errors.generic') })}
          </Alert>
        ) : null}
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            {artist ? `${formatArtistCode(artist.id)} · ${artist.stageName}` : null}
          </Text>
          <Text size="sm" c="dimmed">
            {t('events.artists.deleteNotice')}
          </Text>
        </Stack>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" size="sm" onClick={onClose} disabled={pending} data-autofocus>
            {t('foundations.cancel')}
          </Button>
          <Button
            color="error"
            size="sm"
            loading={pending}
            leftSection={<CafeIcon name="trash" />}
            onClick={() => artist && onConfirm(artist)}
          >
            {t('studyRooms.actions.delete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

/**
 * Reusable artist/band contact management panel embedded within the Events workspace.
 * Enforces QD12: no artist accounts/portal, history-preserving cooperation status, and reuse in invitations.
 */
export function ArtistContactsPanel() {
  const { t } = useTranslation();
  const client = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArtistStatus | null>(null);
  const [kindFilter, setKindFilter] = useState<ArtistKind | null>(null);
  const [sort, setSort] = useState<ArtistSort>('id.asc');

  const [formModal, setFormModal] = useState<{ opened: boolean; artist: Artist | null }>({
    opened: false,
    artist: null,
  });
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deletingArtist, setDeletingArtist] = useState<Artist | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const list = useArtists({
    page,
    pageSize: 10,
    search: search.trim(),
    status: statusFilter,
    kind: kindFilter,
    sort,
  });

  const deleteMutation = useDeleteArtist();

  const denied = [list.error, deleteMutation.error].find(
    (value) => value instanceof ApiError && (value.status === 401 || value.code === 'FORBIDDEN'),
  );

  useEffect(() => {
    if (denied) {
      client.removeQueries({ queryKey: ['private'] });
      window.location.replace(denied instanceof ApiError && denied.status === 401 ? '/login' : '/portal');
    }
  }, [denied, client]);

  const totalPages = list.data?.pagination.totalPages;
  const pageCount = totalPages ?? 0;
  const currentPage = Math.min(page, Math.max(1, pageCount));

  if (totalPages !== undefined && page > Math.max(1, totalPages)) {
    setPage(Math.max(1, totalPages));
  }

  if (denied) return null;

  return (
    <Stack gap="md">
      <Paper withBorder p="md">
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="sm" wrap="wrap">
              <TextInput
                leftSection={<PortalIcon name="search" />}
                leftSectionPointerEvents="none"
                aria-label={t('events.artists.search')}
                placeholder={t('events.artists.searchPlaceholder')}
                maxLength={100}
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setPage(1);
                }}
              />

              <Select
                aria-label={t('events.artists.fields.kind')}
                placeholder={t('events.artists.fields.kind')}
                clearable
                value={kindFilter}
                data={artistKinds.map((value) => ({
                  value,
                  label: t(`events.artists.kinds.${value}`),
                }))}
                onChange={(value) => {
                  setKindFilter(artistKinds.find((kind) => kind === value) ?? null);
                  setPage(1);
                }}
              />

              <Select
                aria-label={t('events.artists.fields.status')}
                placeholder={t('events.artists.fields.status')}
                clearable
                value={statusFilter}
                data={artistStatuses.map((value) => ({
                  value,
                  label: t(`events.artists.status.${value}`),
                }))}
                onChange={(value) => {
                  setStatusFilter(artistStatuses.find((status) => status === value) ?? null);
                  setPage(1);
                }}
              />
            </Group>

            <Button
              size="sm"
              leftSection={<CafeIcon name="plus" />}
              onClick={() => setFormModal({ opened: true, artist: null })}
            >
              {t('events.artists.createTitle')}
            </Button>
          </Group>

          {feedback && (
            <Alert
              color="success"
              withCloseButton
              closeButtonLabel={t('studyRooms.dismiss')}
              onClose={() => setFeedback(null)}
            >
              {feedback}
            </Alert>
          )}

          {list.error && (
            <Alert color="error" role="alert" icon={<CafeIcon name="info" />}>
              {t(artistErrorKey(list.error), { defaultValue: t('auth.errors.generic') })}
            </Alert>
          )}

          <Table.ScrollContainer minWidth={820} type="native">
            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('events.artists.fields.code')}</Table.Th>
                  <Table.Th
                    aria-sort={
                      sort === 'name.asc'
                        ? 'ascending'
                        : sort === 'name.desc'
                          ? 'descending'
                          : 'none'
                    }
                  >
                    <Group gap={4} wrap="nowrap">
                      {t('events.artists.fields.stageName')}
                      <ActionIcon
                        variant={sort === 'id.asc' ? 'subtle' : 'light'}
                        size="sm"
                        aria-label={t('events.artists.sortName')}
                        title={t('events.artists.sortName')}
                        onClick={() => {
                          setSort((current) => nextSort[current]);
                          setPage(1);
                        }}
                      >
                        <Box
                          style={{
                            display: 'flex',
                            transform: sort === 'name.desc' ? 'scaleY(-1)' : undefined,
                          }}
                        >
                          <PortalIcon name="sort" />
                        </Box>
                      </ActionIcon>
                    </Group>
                  </Table.Th>
                  <Table.Th>{t('events.artists.fields.kind')}</Table.Th>
                  <Table.Th>{t('events.artists.fields.email')}</Table.Th>
                  <Table.Th>{t('events.artists.fields.phone')}</Table.Th>
                  <Table.Th>{t('events.artists.fields.history')}</Table.Th>
                  <Table.Th>{t('events.artists.fields.status')}</Table.Th>
                  <Table.Th>{t('auth.actions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {list.isPending ? (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Text role="status" c="dimmed" ta="center" py="md">
                        {t('auth.loading')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : !list.data?.items.length ? (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Text c="dimmed" ta="center" py="md">
                        {t('events.artists.empty')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  list.data.items.map((artist) => {
                    const deletable = canDeleteArtist(artist);
                    return (
                      <Table.Tr key={artist.id}>
                        <Table.Td>{formatArtistCode(artist.id)}</Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {artist.stageName}
                          </Text>
                          {artist.genre && (
                            <Text size="xs" c="dimmed">
                              {artist.genre}
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm" tt="none">
                            {t(`events.artists.kinds.${artist.kind}`)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{artist.email}</Table.Td>
                        <Table.Td>{artist.phone || '—'}</Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {artist.hasHistory
                              ? t('events.artists.historySummary', {
                                  invitations: artist.invitationCount,
                                  assignments: artist.assignmentCount,
                                })
                              : t('events.artists.noHistory')}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant="dot"
                            color={artist.status === 'ACTIVE' ? 'success' : 'neutral'}
                          >
                            {t(`events.artists.status.${artist.status}`)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            <Button
                              variant="default"
                              size="xs"
                              leftSection={<CafeIcon name="eye" size={14} />}
                              onClick={() => setDetailId(artist.id)}
                            >
                              {t('studyRooms.actions.detail')}
                            </Button>
                            <Button
                              variant="default"
                              size="xs"
                              leftSection={<CafeIcon name="pencil" size={14} />}
                              onClick={() => setFormModal({ opened: true, artist })}
                            >
                              {t('studyRooms.actions.edit')}
                            </Button>
                            <Tooltip
                              label={t('events.artists.deleteLocked')}
                              disabled={deletable}
                              events={tooltipEvents}
                              withinPortal
                            >
                              <Button
                                variant="default"
                                size="xs"
                                leftSection={<CafeIcon name="trash" size={14} />}
                                data-disabled={!deletable || undefined}
                                aria-disabled={!deletable || undefined}
                                aria-describedby={!deletable ? `artist-delete-locked-${artist.id}` : undefined}
                                onClick={
                                  deletable
                                    ? () => {
                                        deleteMutation.reset();
                                        setDeletingArtist(artist);
                                      }
                                    : undefined
                                }
                              >
                                {t('studyRooms.actions.delete')}
                              </Button>
                            </Tooltip>
                          </Group>
                          {!deletable && (
                            <VisuallyHidden id={`artist-delete-locked-${artist.id}`}>
                              {t('events.artists.deleteLocked')}
                            </VisuallyHidden>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {pageCount > 1 && (
            <Pagination value={currentPage} total={pageCount} onChange={setPage} />
          )}
        </Stack>
      </Paper>

      <ArtistContactInlineForm
        opened={formModal.opened}
        artist={formModal.artist}
        onClose={() => setFormModal({ opened: false, artist: null })}
        onSaved={() => {
          setFeedback(t('events.artists.saved'));
        }}
      />

      <ArtistDetailModal
        artistId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(artist) => {
          setDetailId(null);
          setFormModal({ opened: true, artist });
        }}
      />

      <ArtistDeleteModal
        artist={deletingArtist}
        pending={deleteMutation.isPending}
        error={deleteMutation.error}
        onClose={() => setDeletingArtist(null)}
        onConfirm={async (artist) => {
          try {
            await deleteMutation.mutateAsync(artist.id);
            if (list.data && list.data.items.length <= 1 && page > 1) {
              setPage((current) => Math.max(1, current - 1));
            }
            setDeletingArtist(null);
            setFeedback(t('events.artists.deleted'));
          } catch {
            // Error is shown in the confirmation dialog.
          }
        }}
      />
    </Stack>
  );
}
