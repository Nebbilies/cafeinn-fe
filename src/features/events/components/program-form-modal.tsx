'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import { programErrorKey } from '../api/programs.api';
import { useCreateProgram, useProgramDetail, useUpdateProgram } from '../hooks/use-programs';
import {
  DEFAULT_ACOUSTIC_AREA_ID,
  DEFAULT_HOLD_MINUTES,
  buildProgramPatchPayload,
  formatProgramCode,
  programToRecurringFormValues,
  programToSpecialFormValues,
  recurringProgramEditSchema,
  specialProgramFormSchema,
  toCreateSpecialProgramPayload,
  toEditableSnapshotFromRecurring,
  toEditableSnapshotFromSpecial,
  toVietnamDateAndTime,
  type EditableProgramSnapshot,
  type Program,
} from '../schemas/program.schema';

type ProgramFormModalProps = {
  opened: boolean;
  program?: Program | null;
  onClose: () => void;
  onSaved?: (program: Program) => void;
};

type FormFieldErrors = Record<string, string>;

function defaultDateToday(): string {
  return toVietnamDateAndTime(new Date().toISOString()).date;
}

function ProgramFormBody({
  program,
  onClose,
  onSaved,
  onPendingChange,
}: {
  program?: Program | null;
  onClose: () => void;
  onSaved?: (program: Program) => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const mountedRef = useRef(true);

  const isEdit = Boolean(program);
  const isSpecial = !program || program.kind === 'SPECIAL';

  const initialSpecial = program && program.kind === 'SPECIAL' ? programToSpecialFormValues(program) : null;
  const initialRecurring = program && program.kind === 'RECURRING' ? programToRecurringFormValues(program) : null;
  const today = defaultDateToday();

  const [areaId, setAreaId] = useState<number>(
    initialSpecial?.areaId ?? initialRecurring?.areaId ?? DEFAULT_ACOUSTIC_AREA_ID,
  );
  const [name, setName] = useState(initialSpecial?.name ?? initialRecurring?.name ?? '');
  const [description, setDescription] = useState(
    initialSpecial?.description ?? initialRecurring?.description ?? '',
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialSpecial?.coverImageUrl ?? initialRecurring?.coverImageUrl ?? '',
  );
  const [eventDate, setEventDate] = useState(
    initialSpecial?.eventDate ?? initialRecurring?.eventDate ?? today,
  );
  const [startTime, setStartTime] = useState(
    initialSpecial?.startTime ?? initialRecurring?.startTime ?? '19:30',
  );
  const [endTime, setEndTime] = useState(
    initialSpecial?.endTime ?? initialRecurring?.endTime ?? '21:30',
  );

  const [capacityLimit, setCapacityLimit] = useState<number>(initialSpecial?.capacityLimit ?? 40);
  const [surchargePerPerson, setSurchargePerPerson] = useState<number>(
    initialSpecial?.surchargePerPerson ?? 50000,
  );
  const [registrationDeadlineDate, setRegistrationDeadlineDate] = useState(
    initialSpecial?.registrationDeadlineDate ?? today,
  );
  const [registrationDeadlineTime, setRegistrationDeadlineTime] = useState(
    initialSpecial?.registrationDeadlineTime ?? '18:00',
  );
  const [cancellationDeadlineDate, setCancellationDeadlineDate] = useState(
    initialSpecial?.cancellationDeadlineDate ?? today,
  );
  const [cancellationDeadlineTime, setCancellationDeadlineTime] = useState(
    initialSpecial?.cancellationDeadlineTime ?? '17:00',
  );
  const [holdMinutes, setHoldMinutes] = useState<number>(
    initialSpecial?.holdMinutes ?? DEFAULT_HOLD_MINUTES,
  );

  const [baseline] = useState<EditableProgramSnapshot | null>(() => {
    if (!program) return null;
    if (program.kind === 'SPECIAL') {
      return toEditableSnapshotFromSpecial(programToSpecialFormValues(program));
    }
    return toEditableSnapshotFromRecurring(programToRecurringFormValues(program));
  });
  const [editRevision] = useState<number | null>(() => program?.revision ?? null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const pending = createMutation.isPending || updateMutation.isPending;
  const serverError = isEdit ? updateMutation.error : createMutation.error;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      onPendingChange?.(false);
    };
  }, [onPendingChange]);

  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    if (isSpecial) {
      const parsed = specialProgramFormSchema.safeParse({
        areaId,
        name,
        description,
        coverImageUrl,
        eventDate,
        startTime,
        endTime,
        capacityLimit,
        surchargePerPerson,
        registrationDeadlineDate,
        registrationDeadlineTime,
        cancellationDeadlineDate,
        cancellationDeadlineTime,
        holdMinutes,
      });
      if (!parsed.success) {
        const nextErrors: FormFieldErrors = {};
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? 'form');
          if (!nextErrors[key]) nextErrors[key] = issue.message;
        }
        setFieldErrors(nextErrors);
        return;
      }

      setFieldErrors({});
      try {
        if (program && baseline && editRevision !== null) {
          const nextSnapshot = toEditableSnapshotFromSpecial(parsed.data);
          const patch = buildProgramPatchPayload(baseline, nextSnapshot, editRevision);
          if (!patch) {
            onClose();
            return;
          }
          const saved = await updateMutation.mutateAsync({ id: program.id, body: patch });
          if (!mountedRef.current) return;
          onSaved?.(saved);
          onClose();
          return;
        }

        const saved = await createMutation.mutateAsync(toCreateSpecialProgramPayload(parsed.data));
        if (!mountedRef.current) return;
        onSaved?.(saved);
        onClose();
      } catch {
        // Mutation error state is rendered inline.
      }
      return;
    }

    const parsed = recurringProgramEditSchema.safeParse({
      areaId,
      name,
      description,
      coverImageUrl,
      eventDate,
      startTime,
      endTime,
    });
    if (!parsed.success) {
      const nextErrors: FormFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    if (!program || !baseline || editRevision === null) return;
    try {
      const nextSnapshot = toEditableSnapshotFromRecurring(parsed.data);
      const patch = buildProgramPatchPayload(baseline, nextSnapshot, editRevision);
      if (!patch) {
        onClose();
        return;
      }
      const saved = await updateMutation.mutateAsync({ id: program.id, body: patch });
      if (!mountedRef.current) return;
      onSaved?.(saved);
      onClose();
    } catch {
      // Mutation error state is rendered inline.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="md">
        {serverError && (
          <Alert color="error" role="alert" icon={<CafeIcon name="info" />}>
            {t(programErrorKey(serverError), { defaultValue: t('auth.errors.generic') })}
          </Alert>
        )}

        {program && (
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('events.programs.fields.code')}: <strong>{formatProgramCode(program.id)}</strong>
            </Text>
            <Badge variant="light" size="sm" tt="none">
              {t(`events.programs.kinds.${program.kind}`)}
            </Badge>
          </Group>
        )}

        {!isSpecial && (
          <Alert color="info" icon={<CafeIcon name="info" />}>
            {t('events.programs.recurringFreeNote')}
          </Alert>
        )}

        <TextInput
          label={t('events.programs.fields.name')}
          placeholder={t('events.programs.placeholders.name')}
          required
          maxLength={150}
          value={name}
          error={fieldErrors.name ? t(fieldErrors.name) : undefined}
          onChange={(e) => setName(e.currentTarget.value)}
          data-autofocus
        />

        <Textarea
          label={t('events.programs.fields.description')}
          placeholder={t('events.programs.placeholders.description')}
          required
          minRows={2}
          autosize
          value={description}
          error={fieldErrors.description ? t(fieldErrors.description) : undefined}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />

        <Group grow align="flex-start">
          <NumberInput
            label={t('events.programs.fields.areaId')}
            required
            min={1}
            allowDecimal={false}
            value={areaId}
            error={fieldErrors.areaId ? t(fieldErrors.areaId) : undefined}
            onChange={(value) => {
              if (typeof value === 'number') setAreaId(value);
            }}
          />

          <TextInput
            label={t('events.programs.fields.coverImageUrl')}
            placeholder={t('events.programs.placeholders.coverImageUrl')}
            value={coverImageUrl}
            error={fieldErrors.coverImageUrl ? t(fieldErrors.coverImageUrl) : undefined}
            onChange={(e) => setCoverImageUrl(e.currentTarget.value)}
          />
        </Group>

        <Group grow align="flex-start">
          <TextInput
            type="date"
            label={t('events.programs.fields.eventDate')}
            required
            value={eventDate}
            error={fieldErrors.eventDate ? t(fieldErrors.eventDate) : undefined}
            onChange={(e) => setEventDate(e.currentTarget.value)}
          />
          <TextInput
            type="time"
            label={t('events.programs.fields.startTime')}
            required
            value={startTime}
            error={fieldErrors.startTime ? t(fieldErrors.startTime) : undefined}
            onChange={(e) => setStartTime(e.currentTarget.value)}
          />
          <TextInput
            type="time"
            label={t('events.programs.fields.endTime')}
            required
            value={endTime}
            error={fieldErrors.endTime ? t(fieldErrors.endTime) : undefined}
            onChange={(e) => setEndTime(e.currentTarget.value)}
          />
        </Group>

        {isSpecial && (
          <>
            <Divider />
            <Alert color="info" icon={<CafeIcon name="info" />}>
              {t('events.programs.specialIndependentCapacityNote')}
            </Alert>

            <Group grow align="flex-start">
              <NumberInput
                label={t('events.programs.fields.capacityLimit')}
                required
                min={1}
                max={65535}
                allowDecimal={false}
                value={capacityLimit}
                error={fieldErrors.capacityLimit ? t(fieldErrors.capacityLimit) : undefined}
                onChange={(value) => {
                  if (typeof value === 'number') setCapacityLimit(value);
                }}
              />

              <NumberInput
                label={t('events.programs.fields.surchargePerPerson')}
                required
                min={0}
                allowDecimal={false}
                thousandSeparator="."
                decimalSeparator=","
                value={surchargePerPerson}
                error={fieldErrors.surchargePerPerson ? t(fieldErrors.surchargePerPerson) : undefined}
                onChange={(value) => {
                  if (typeof value === 'number') setSurchargePerPerson(value);
                }}
              />

              <NumberInput
                label={t('events.programs.fields.holdMinutes')}
                required
                min={1}
                max={65535}
                allowDecimal={false}
                value={holdMinutes}
                error={fieldErrors.holdMinutes ? t(fieldErrors.holdMinutes) : undefined}
                onChange={(value) => {
                  if (typeof value === 'number') setHoldMinutes(value);
                }}
              />
            </Group>

            <Group grow align="flex-start">
              <TextInput
                type="date"
                label={t('events.programs.fields.registrationDeadline')}
                required
                value={registrationDeadlineDate}
                error={
                  fieldErrors.registrationDeadlineDate
                    ? t(fieldErrors.registrationDeadlineDate)
                    : undefined
                }
                onChange={(e) => setRegistrationDeadlineDate(e.currentTarget.value)}
              />
              <TextInput
                type="time"
                label={t('events.programs.fields.startTime')}
                aria-label={t('events.programs.fields.registrationDeadline')}
                required
                value={registrationDeadlineTime}
                error={
                  fieldErrors.registrationDeadlineTime
                    ? t(fieldErrors.registrationDeadlineTime)
                    : undefined
                }
                onChange={(e) => setRegistrationDeadlineTime(e.currentTarget.value)}
              />
            </Group>

            <Group grow align="flex-start">
              <TextInput
                type="date"
                label={t('events.programs.fields.cancellationDeadline')}
                required
                value={cancellationDeadlineDate}
                error={
                  fieldErrors.cancellationDeadlineDate
                    ? t(fieldErrors.cancellationDeadlineDate)
                    : undefined
                }
                onChange={(e) => setCancellationDeadlineDate(e.currentTarget.value)}
              />
              <TextInput
                type="time"
                label={t('events.programs.fields.startTime')}
                aria-label={t('events.programs.fields.cancellationDeadline')}
                required
                value={cancellationDeadlineTime}
                error={
                  fieldErrors.cancellationDeadlineTime
                    ? t(fieldErrors.cancellationDeadlineTime)
                    : undefined
                }
                onChange={(e) => setCancellationDeadlineTime(e.currentTarget.value)}
              />
            </Group>
          </>
        )}

        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="default" size="sm" onClick={onClose} disabled={pending}>
            {t('foundations.cancel')}
          </Button>
          <Button type="submit" size="sm" loading={pending}>
            {t('auth.save')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

function ProgramEditFormLoader({
  programId,
  onClose,
  onSaved,
  onPendingChange,
}: {
  programId: number;
  onClose: () => void;
  onSaved?: (program: Program) => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const { t } = useTranslation();
  const detail = useProgramDetail(programId);

  if (detail.isPending) {
    return (
      <Text role="status" size="sm" c="dimmed" py="md">
        {t('auth.loading')}
      </Text>
    );
  }

  if (detail.error || !detail.data) {
    return (
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
            {t('foundations.cancel')}
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <ProgramFormBody
      key={`edit-${detail.data.id}`}
      program={detail.data}
      onClose={onClose}
      onSaved={onSaved}
      onPendingChange={onPendingChange}
    />
  );
}

/**
 * Modal form for creating a special draft program or editing an unused draft program (SK02).
 */
export function ProgramFormModal({ opened, program, onClose, onSaved }: ProgramFormModalProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (!saving) onClose();
      }}
      closeOnClickOutside={!saving}
      closeOnEscape={!saving}
      size={640}
      centered
      title={t(program ? 'events.programs.editTitle' : 'events.programs.createSpecial')}
      closeButtonProps={{ 'aria-label': t('auth.closeDialog'), disabled: saving }}
    >
      {opened &&
        (program ? (
          <ProgramEditFormLoader
            key={`loader-${program.id}`}
            programId={program.id}
            onClose={onClose}
            onSaved={onSaved}
            onPendingChange={setSaving}
          />
        ) : (
          <ProgramFormBody
            key="create-special"
            program={null}
            onClose={onClose}
            onSaved={onSaved}
            onPendingChange={setSaving}
          />
        ))}
    </Modal>
  );
}
