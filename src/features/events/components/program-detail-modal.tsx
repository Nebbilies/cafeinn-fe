'use client';

import { Alert, Anchor, Badge, Box, Button, Divider, Group, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import { programErrorKey } from '../api/programs.api';
import { useProgramDetail } from '../hooks/use-programs';
import {
  canEditOrDeleteDraft,
  formatProgramCode,
  formatVietnamDateTime,
  formatVietnamTime,
  formatVnd,
  getProgramDisplayState,
  type Program,
  type ProgramDisplayState,
} from '../schemas/program.schema';

export function displayStateColor(state: ProgramDisplayState): string {
  switch (state) {
    case 'DRAFT':
      return 'neutral';
    case 'UPCOMING':
      return 'info';
    case 'ONGOING':
      return 'success';
    case 'ENDED':
      return 'neutral';
    case 'CANCELLED':
      return 'error';
  }
}

export function ProgramDetailModal({
  programId,
  onClose,
  onEdit,
}: {
  programId: number | null;
  onClose: () => void;
  onEdit: (program: Program) => void;
}) {
  const { t } = useTranslation();
  const detail = useProgramDetail(programId);
  const program = detail.data;
  const displayState = program ? getProgramDisplayState(program) : null;
  const editable = program ? canEditOrDeleteDraft(program) : false;

  return (
    <Modal
      opened={programId !== null}
      onClose={onClose}
      size={600}
      centered
      title={t('events.programs.detailTitle')}
      closeButtonProps={{ 'aria-label': t('auth.closeDialog') }}
    >
      {detail.isPending && <Text role="status">{t('auth.loading')}</Text>}

      {detail.error && (
        <Stack gap="md">
          <Alert color="error" role="alert" icon={<CafeIcon name="info" />}>
            {t(programErrorKey(detail.error), { defaultValue: t('auth.errors.generic') })}
          </Alert>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              size="sm"
              loading={detail.isFetching}
              onClick={() => {
                void detail.refetch();
              }}
            >
              {t('retry')}
            </Button>
            <Button variant="default" size="sm" onClick={onClose}>
              {t('studyRooms.close')}
            </Button>
          </Group>
        </Stack>
      )}

      {program && displayState && (
        <Stack gap="md">
          <Box>
            <Text fw={600} size="lg">
              {program.name}
            </Text>
            <Group gap="xs" mt={4} wrap="wrap">
              <Text size="sm" c="dimmed">
                {formatProgramCode(program.id)}
              </Text>
              <Badge variant="light" tt="none">
                {t(`events.programs.kinds.${program.kind}`)}
              </Badge>
              <Badge variant="dot" color={displayStateColor(displayState)}>
                {t(`events.programs.displayState.${displayState}`)}
              </Badge>
              {program.recurringBatchId && (
                <Badge variant="outline" size="sm" tt="none">
                  {t('events.programs.batchRef', { id: program.recurringBatchId })}
                </Badge>
              )}
            </Group>
          </Box>

          <Divider />

          <Box
            component="dl"
            m={0}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 11rem), 1fr))',
              gap: 'var(--mantine-spacing-md)',
              overflowWrap: 'anywhere',
            }}
          >
            <Box>
              <Text component="dt" size="sm" c="dimmed">
                {t('events.programs.fields.timeRange')}
              </Text>
              <Text component="dd" m={0}>
                {formatVietnamDateTime(program.startsAt)} – {formatVietnamTime(program.endsAt)}
              </Text>
            </Box>

            <Box>
              <Text component="dt" size="sm" c="dimmed">
                {t('events.programs.fields.areaId')}
              </Text>
              <Text component="dd" m={0}>
                {t('events.programs.areaLabel', { id: program.areaId })}
              </Text>
            </Box>

            {program.specialEvent ? (
              <>
                <Box>
                  <Text component="dt" size="sm" c="dimmed">
                    {t('events.programs.fields.capacityLimit')}
                  </Text>
                  <Text component="dd" m={0}>
                    {t('events.programs.capacityUnit', {
                      count: program.specialEvent.capacityLimit,
                    })}
                  </Text>
                </Box>

                <Box>
                  <Text component="dt" size="sm" c="dimmed">
                    {t('events.programs.fields.surchargePerPerson')}
                  </Text>
                  <Text component="dd" m={0}>
                    {program.specialEvent.surchargePerPerson === 0
                      ? t('events.programs.freeLabel')
                      : formatVnd(program.specialEvent.surchargePerPerson)}
                  </Text>
                </Box>

                <Box>
                  <Text component="dt" size="sm" c="dimmed">
                    {t('events.programs.fields.registrationDeadline')}
                  </Text>
                  <Text component="dd" m={0}>
                    {formatVietnamDateTime(program.specialEvent.registrationDeadline)}
                  </Text>
                </Box>

                <Box>
                  <Text component="dt" size="sm" c="dimmed">
                    {t('events.programs.fields.cancellationDeadline')}
                  </Text>
                  <Text component="dd" m={0}>
                    {formatVietnamDateTime(program.specialEvent.cancellationDeadline)}
                  </Text>
                </Box>

                <Box>
                  <Text component="dt" size="sm" c="dimmed">
                    {t('events.programs.fields.holdMinutes')}
                  </Text>
                  <Text component="dd" m={0}>
                    {t('events.programs.holdMinutesUnit', {
                      minutes: program.specialEvent.holdMinutes,
                    })}{' '}
                    ({t('events.programs.fields.holdUntil')}:{' '}
                    {formatVietnamTime(program.specialEvent.holdUntil)})
                  </Text>
                </Box>

                <Box>
                  <Text component="dt" size="sm" c="dimmed">
                    {t('events.programs.fields.bookingStatus')}
                  </Text>
                  <Text component="dd" m={0}>
                    {program.bookingAllowed
                      ? t('events.programs.bookingEligible')
                      : t('events.programs.bookingNotEligible')}
                  </Text>
                </Box>
              </>
            ) : null}

            <Box style={{ gridColumn: '1 / -1' }}>
              <Text component="dt" size="sm" c="dimmed">
                {t('events.programs.fields.description')}
              </Text>
              <Text component="dd" m={0}>
                {program.description || t('auth.notProvided')}
              </Text>
            </Box>

            {program.coverImageUrl && (
              <Box style={{ gridColumn: '1 / -1' }}>
                <Text component="dt" size="sm" c="dimmed">
                  {t('events.programs.fields.coverImageUrl')}
                </Text>
                <Text component="dd" m={0}>
                  <Anchor href={program.coverImageUrl} target="_blank" rel="noreferrer">
                    {program.coverImageUrl}
                  </Anchor>
                </Text>
              </Box>
            )}
          </Box>

          {program.kind === 'RECURRING' && (
            <Alert color="info" icon={<CafeIcon name="info" />}>
              {t('events.programs.recurringFreeNote')}
            </Alert>
          )}

          <Group justify="flex-end" gap="sm">
            {editable && (
              <Button
                variant="default"
                size="sm"
                leftSection={<CafeIcon name="pencil" />}
                onClick={() => onEdit(program)}
              >
                {t('studyRooms.actions.edit')}
              </Button>
            )}
            <Button variant="default" size="sm" onClick={onClose} data-autofocus>
              {t('studyRooms.close')}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
