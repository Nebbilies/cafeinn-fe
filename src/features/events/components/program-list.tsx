'use client';

import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
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
import { programErrorKey } from '../api/programs.api';
import { useDeleteProgram, usePrograms } from '../hooks/use-programs';
import {
  canEditOrDeleteDraft,
  formatProgramCode,
  formatVietnamDateTime,
  formatVietnamTime,
  formatVnd,
  getProgramDisplayState,
  programKinds,
  programStatuses,
  toVietnamDateAndTime,
  toVietnamIso,
  type Program,
  type ProgramKind,
  type ProgramSort,
  type ProgramStatus,
} from '../schemas/program.schema';
import { displayStateColor, ProgramDetailModal } from './program-detail-modal';
import { ProgramFormModal } from './program-form-modal';
import { RecurringBatchModal } from './recurring-batch-modal';

const tooltipEvents = { hover: true, focus: true, touch: true };

function nextDayIso(date: string): string {
  const nextMs = Date.parse(toVietnamIso(date, '00:00')) + 86_400_000;
  const nextDate = toVietnamDateAndTime(new Date(nextMs).toISOString()).date;
  return toVietnamIso(nextDate, '00:00');
}

function ProgramDeleteModal({
  program,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  program: Program | null;
  pending: boolean;
  error: unknown;
  onClose: () => void;
  onConfirm: (program: Program) => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      opened={program !== null}
      onClose={() => {
        if (!pending) onClose();
      }}
      closeOnClickOutside={!pending}
      closeOnEscape={!pending}
      size={480}
      centered
      title={t('events.programs.deleteTitle')}
      closeButtonProps={{ 'aria-label': t('auth.closeDialog'), disabled: pending }}
    >
      <Stack gap="md">
        {error ? (
          <Alert color="error" role="alert" icon={<CafeIcon name="info" />}>
            {t(programErrorKey(error), { defaultValue: t('auth.errors.generic') })}
          </Alert>
        ) : null}
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            {program ? `${formatProgramCode(program.id)} · ${program.name}` : null}
          </Text>
          <Text size="sm" c="dimmed">
            {t('events.programs.deleteNotice')}
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
            onClick={() => program && onConfirm(program)}
          >
            {t('studyRooms.actions.delete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

/**
 * Staff event program browser (SK01): supports special & recurring programs,
 * acoustic-area conflict-safe creation, draft editing/deletion, and derived lifecycle statuses.
 */
export function ProgramList() {
  const { t } = useTranslation();
  const client = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<ProgramKind | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState<ProgramSort>('startsAt.asc');

  const [formModal, setFormModal] = useState<{ opened: boolean; program: Program | null }>({
    opened: false,
    program: null,
  });
  const [batchModalOpened, setBatchModalOpened] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const validRange = !fromDate || !toDate || fromDate <= toDate;
  const fromIso = validRange && fromDate ? toVietnamIso(fromDate, '00:00') : null;
  const toIso = validRange && toDate ? nextDayIso(toDate) : null;

  const list = usePrograms({
    page,
    pageSize: 10,
    search: search.trim(),
    kind: kindFilter,
    status: statusFilter,
    from: fromIso,
    to: toIso,
    sort,
  });

  const deleteMutation = useDeleteProgram();

  const denied = [list.error, deleteMutation.error].find(
    (value) => value instanceof ApiError && (value.status === 401 || value.code === 'FORBIDDEN'),
  );

  useEffect(() => {
    if (denied) {
      client.removeQueries({ queryKey: ['private'] });
      window.location.replace(
        denied instanceof ApiError && denied.status === 401 ? '/login' : '/portal',
      );
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
                aria-label={t('events.programs.search')}
                placeholder={t('events.programs.searchPlaceholder')}
                maxLength={150}
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setPage(1);
                }}
              />

              <Select
                aria-label={t('events.programs.fields.kind')}
                placeholder={t('events.programs.fields.kind')}
                clearable
                value={kindFilter}
                data={programKinds.map((value) => ({
                  value,
                  label: t(`events.programs.kinds.${value}`),
                }))}
                onChange={(value) => {
                  setKindFilter(programKinds.find((kind) => kind === value) ?? null);
                  setPage(1);
                }}
              />

              <Select
                aria-label={t('events.programs.fields.status')}
                placeholder={t('events.programs.fields.status')}
                clearable
                value={statusFilter}
                data={programStatuses.map((value) => ({
                  value,
                  label: t(`events.programs.status.${value}`),
                }))}
                onChange={(value) => {
                  setStatusFilter(programStatuses.find((status) => status === value) ?? null);
                  setPage(1);
                }}
              />

              <TextInput
                type="date"
                aria-label={t('events.programs.fromDate')}
                placeholder={t('events.programs.fromDate')}
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.currentTarget.value);
                  setPage(1);
                }}
              />

              <TextInput
                type="date"
                aria-label={t('events.programs.toDate')}
                placeholder={t('events.programs.toDate')}
                value={toDate}
                error={!validRange ? t('events.programs.errors.dateRangeInvalid') : undefined}
                onChange={(event) => {
                  setToDate(event.currentTarget.value);
                  setPage(1);
                }}
              />
            </Group>

            <Group gap="xs" wrap="wrap">
              <Button
                variant="default"
                size="sm"
                leftSection={<CafeIcon name="plus" />}
                onClick={() => setBatchModalOpened(true)}
              >
                {t('events.programs.createRecurring')}
              </Button>
              <Button
                size="sm"
                leftSection={<CafeIcon name="plus" />}
                onClick={() => setFormModal({ opened: true, program: null })}
              >
                {t('events.programs.createSpecial')}
              </Button>
            </Group>
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
              {t(programErrorKey(list.error), { defaultValue: t('auth.errors.generic') })}
            </Alert>
          )}

          <Table.ScrollContainer minWidth={880} type="native">
            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('events.programs.fields.code')}</Table.Th>
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
                      {t('events.programs.fields.name')}
                      <ActionIcon
                        variant={sort.startsWith('name.') ? 'light' : 'subtle'}
                        size="sm"
                        aria-label={t('events.programs.sortName')}
                        title={t('events.programs.sortName')}
                        onClick={() => {
                          setSort((current) => (current === 'name.asc' ? 'name.desc' : 'name.asc'));
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
                  <Table.Th>{t('events.programs.fields.kind')}</Table.Th>
                  <Table.Th
                    aria-sort={
                      sort === 'startsAt.asc'
                        ? 'ascending'
                        : sort === 'startsAt.desc'
                          ? 'descending'
                          : 'none'
                    }
                  >
                    <Group gap={4} wrap="nowrap">
                      {t('events.programs.fields.timeRange')}
                      <ActionIcon
                        variant={sort.startsWith('startsAt.') ? 'light' : 'subtle'}
                        size="sm"
                        aria-label={t('events.programs.sortStartsAt')}
                        title={t('events.programs.sortStartsAt')}
                        onClick={() => {
                          setSort((current) =>
                            current === 'startsAt.asc' ? 'startsAt.desc' : 'startsAt.asc',
                          );
                          setPage(1);
                        }}
                      >
                        <Box
                          style={{
                            display: 'flex',
                            transform: sort === 'startsAt.desc' ? 'scaleY(-1)' : undefined,
                          }}
                        >
                          <PortalIcon name="sort" />
                        </Box>
                      </ActionIcon>
                    </Group>
                  </Table.Th>
                  <Table.Th>{t('events.programs.fields.capacityLimit')}</Table.Th>
                  <Table.Th>{t('events.programs.fields.status')}</Table.Th>
                  <Table.Th>{t('auth.actions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {list.isPending ? (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text role="status" c="dimmed" ta="center" py="md">
                        {t('auth.loading')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : !list.data?.items.length ? (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text c="dimmed" ta="center" py="md">
                        {t('events.programs.empty')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  list.data.items.map((program) => {
                    const displayState = getProgramDisplayState(program);
                    const editable = canEditOrDeleteDraft(program);
                    return (
                      <Table.Tr key={program.id}>
                        <Table.Td>{formatProgramCode(program.id)}</Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {program.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {t('events.programs.areaLabel', { id: program.areaId })}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm" tt="none">
                            {t(`events.programs.kinds.${program.kind}`)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {formatVietnamDateTime(program.startsAt)} –{' '}
                            {formatVietnamTime(program.endsAt)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {program.specialEvent ? (
                            <Box>
                              <Text size="sm">
                                {t('events.programs.capacityUnit', {
                                  count: program.specialEvent.capacityLimit,
                                })}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {program.specialEvent.surchargePerPerson === 0
                                  ? t('events.programs.freeLabel')
                                  : formatVnd(program.specialEvent.surchargePerPerson)}
                              </Text>
                            </Box>
                          ) : (
                            <Text size="sm" c="dimmed">
                              {t('events.programs.freeLabel')}
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="dot" color={displayStateColor(displayState)}>
                            {t(`events.programs.displayState.${displayState}`)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Box pos="relative">
                            <Group gap={4} wrap="nowrap">
                              <Button
                                variant="default"
                                size="xs"
                                leftSection={<CafeIcon name="eye" size={14} />}
                                onClick={() => setDetailId(program.id)}
                              >
                                {t('studyRooms.actions.detail')}
                              </Button>
                              <Tooltip
                                label={t('events.programs.deleteLocked')}
                                disabled={editable}
                                events={tooltipEvents}
                                withinPortal
                              >
                                <Button
                                  variant="default"
                                  size="xs"
                                  leftSection={<CafeIcon name="pencil" size={14} />}
                                  data-disabled={!editable || undefined}
                                  aria-disabled={!editable || undefined}
                                  aria-describedby={
                                    !editable ? `program-locked-${program.id}` : undefined
                                  }
                                  onClick={
                                    editable
                                      ? () => setFormModal({ opened: true, program })
                                      : undefined
                                  }
                                >
                                  {t('studyRooms.actions.edit')}
                                </Button>
                              </Tooltip>
                              <Tooltip
                                label={t('events.programs.deleteLocked')}
                                disabled={editable}
                                events={tooltipEvents}
                                withinPortal
                              >
                                <Button
                                  variant="default"
                                  size="xs"
                                  leftSection={<CafeIcon name="trash" size={14} />}
                                  data-disabled={!editable || undefined}
                                  aria-disabled={!editable || undefined}
                                  aria-describedby={
                                    !editable ? `program-locked-${program.id}` : undefined
                                  }
                                  onClick={
                                    editable
                                      ? () => {
                                          if (deleteMutation.isPending) return;
                                          deleteMutation.reset();
                                          setDeletingProgram(program);
                                        }
                                      : undefined
                                  }
                                >
                                  {t('studyRooms.actions.delete')}
                                </Button>
                              </Tooltip>
                            </Group>
                            {!editable && (
                              <VisuallyHidden id={`program-locked-${program.id}`}>
                                {t('events.programs.deleteLocked')}
                              </VisuallyHidden>
                            )}
                          </Box>
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

      <ProgramFormModal
        opened={formModal.opened}
        program={formModal.program}
        onClose={() => setFormModal({ opened: false, program: null })}
        onSaved={() => {
          setFeedback(t('events.programs.saved'));
        }}
      />

      <RecurringBatchModal
        opened={batchModalOpened}
        onClose={() => setBatchModalOpened(false)}
        onCreated={(result) => {
          setFeedback(t('events.programs.batchCreated', { count: result.createdCount }));
        }}
      />

      <ProgramDetailModal
        programId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(program) => {
          setDetailId(null);
          setFormModal({ opened: true, program });
        }}
      />

      <ProgramDeleteModal
        program={deletingProgram}
        pending={deleteMutation.isPending}
        error={deleteMutation.error}
        onClose={() => {
          if (!deleteMutation.isPending) setDeletingProgram(null);
        }}
        onConfirm={async (program) => {
          try {
            await deleteMutation.mutateAsync({ id: program.id, revision: program.revision });
            if (list.data && list.data.items.length <= 1 && page > 1) {
              setPage((current) => Math.max(1, current - 1));
            }
            setDeletingProgram((current) => (current?.id === program.id ? null : current));
            setFeedback(t('events.programs.deleted'));
          } catch {
            // Error is shown in the confirmation dialog.
          }
        }}
      />
    </Stack>
  );
}
