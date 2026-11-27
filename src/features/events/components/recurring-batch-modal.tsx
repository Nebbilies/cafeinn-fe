'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Chip,
  Divider,
  Group,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import { programErrorKey } from '../api/programs.api';
import { useCreateRecurringBatch, usePreviewRecurringBatch } from '../hooks/use-programs';
import {
  DEFAULT_ACOUSTIC_AREA_ID,
  formatProgramCode,
  formatVietnamTime,
  recurringBatchFormSchema,
  toRecurringBatchInput,
  toVietnamDateAndTime,
  weekdays,
  type RecurringBatchCreated,
  type RecurringPreview,
  type Weekday,
} from '../schemas/program.schema';

type RecurringBatchModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreated?: (result: RecurringBatchCreated) => void;
};

type FormFieldErrors = Record<string, string>;

function RecurringBatchBody({
  onClose,
  onCreated,
  onPendingChange,
}: {
  onClose: () => void;
  onCreated?: (result: RecurringBatchCreated) => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const { t } = useTranslation();
  const previewMutation = usePreviewRecurringBatch();
  const createMutation = useCreateRecurringBatch();
  const mountedRef = useRef(true);
  const previewRequestIdRef = useRef(0);

  const [areaId, setAreaId] = useState<number>(DEFAULT_ACOUSTIC_AREA_ID);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [fromDate, setFromDate] = useState(
    () => toVietnamDateAndTime(new Date().toISOString()).date,
  );
  const [toDate, setToDate] = useState(
    () => toVietnamDateAndTime(new Date(Date.now() + 28 * 86_400_000).toISOString()).date,
  );
  const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>(['FRI', 'SAT']);
  const [startTime, setStartTime] = useState('19:30');
  const [endTime, setEndTime] = useState('21:30');
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const [preview, setPreview] = useState<RecurringPreview | null>(null);
  const [previewInput, setPreviewInput] = useState<ReturnType<typeof toRecurringBatchInput> | null>(
    null,
  );
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const pending = previewMutation.isPending || createMutation.isPending;
  const serverError = createMutation.error ?? previewMutation.error;

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

  const invalidatePreview = () => {
    previewRequestIdRef.current += 1;
    if (preview) {
      setPreview(null);
      setPreviewInput(null);
      setSelectedDates([]);
    }
  };

  const handlePreview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const parsed = recurringBatchFormSchema.safeParse({
      areaId,
      name,
      description,
      coverImageUrl,
      fromDate,
      toDate,
      weekdays: selectedWeekdays,
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
    createMutation.reset();
    const requestId = ++previewRequestIdRef.current;
    const input = toRecurringBatchInput(parsed.data);
    try {
      const result = await previewMutation.mutateAsync(input);
      if (!mountedRef.current || previewRequestIdRef.current !== requestId) return;
      setPreview(result);
      setPreviewInput(input);
      setSelectedDates(
        result.occurrences
          .filter((item) => item.conflictProgramIds.length === 0)
          .map((item) => item.date),
      );
    } catch {
      // Error rendered inline.
    }
  };

  const handleCreate = async () => {
    if (pending || !previewInput || selectedDates.length === 0) return;
    try {
      const result = await createMutation.mutateAsync({
        input: previewInput,
        selectedDates,
      });
      if (!mountedRef.current) return;
      onCreated?.(result);
      onClose();
    } catch {
      // Error rendered inline.
    }
  };

  const validDates =
    preview?.occurrences
      .filter((item) => item.conflictProgramIds.length === 0)
      .map((item) => item.date) ?? [];

  return (
    <form onSubmit={handlePreview} noValidate>
      <Stack gap="md">
        <Alert color="info" icon={<CafeIcon name="info" />}>
          {t('events.programs.recurringFreeNote')}
        </Alert>

        {serverError && (
          <Alert color="error" role="alert" icon={<CafeIcon name="info" />}>
            {t(programErrorKey(serverError), { defaultValue: t('auth.errors.generic') })}
          </Alert>
        )}

        <TextInput
          label={t('events.programs.fields.name')}
          placeholder={t('events.programs.placeholders.name')}
          required
          maxLength={150}
          value={name}
          error={fieldErrors.name ? t(fieldErrors.name) : undefined}
          onChange={(e) => {
            setName(e.currentTarget.value);
            invalidatePreview();
          }}
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
          onChange={(e) => {
            setDescription(e.currentTarget.value);
            invalidatePreview();
          }}
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
              if (typeof value === 'number') {
                setAreaId(value);
                invalidatePreview();
              }
            }}
          />

          <TextInput
            label={t('events.programs.fields.coverImageUrl')}
            placeholder={t('events.programs.placeholders.coverImageUrl')}
            value={coverImageUrl}
            error={fieldErrors.coverImageUrl ? t(fieldErrors.coverImageUrl) : undefined}
            onChange={(e) => {
              setCoverImageUrl(e.currentTarget.value);
              invalidatePreview();
            }}
          />
        </Group>

        <Group grow align="flex-start">
          <TextInput
            type="date"
            label={t('events.programs.fields.fromDate')}
            required
            value={fromDate}
            error={fieldErrors.fromDate ? t(fieldErrors.fromDate) : undefined}
            onChange={(e) => {
              setFromDate(e.currentTarget.value);
              invalidatePreview();
            }}
          />
          <TextInput
            type="date"
            label={t('events.programs.fields.toDate')}
            required
            value={toDate}
            error={fieldErrors.toDate ? t(fieldErrors.toDate) : undefined}
            onChange={(e) => {
              setToDate(e.currentTarget.value);
              invalidatePreview();
            }}
          />
        </Group>

        <Group grow align="flex-start">
          <TextInput
            type="time"
            label={t('events.programs.fields.startTime')}
            required
            value={startTime}
            error={fieldErrors.startTime ? t(fieldErrors.startTime) : undefined}
            onChange={(e) => {
              setStartTime(e.currentTarget.value);
              invalidatePreview();
            }}
          />
          <TextInput
            type="time"
            label={t('events.programs.fields.endTime')}
            required
            value={endTime}
            error={fieldErrors.endTime ? t(fieldErrors.endTime) : undefined}
            onChange={(e) => {
              setEndTime(e.currentTarget.value);
              invalidatePreview();
            }}
          />
        </Group>

        <Stack gap={6}>
          <Text size="sm" fw={500}>
            {t('events.programs.fields.weekdays')}
          </Text>
          <Chip.Group
            multiple
            value={selectedWeekdays}
            onChange={(next) => {
              setSelectedWeekdays(next.filter((d): d is Weekday => weekdays.includes(d as Weekday)));
              invalidatePreview();
            }}
          >
            <Group gap="xs">
              {weekdays.map((day) => (
                <Chip key={day} value={day} size="xs" variant="light">
                  {t(`events.programs.weekdays.${day}`)}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
          {fieldErrors.weekdays && (
            <Text size="xs" c="error">
              {t(fieldErrors.weekdays)}
            </Text>
          )}
        </Stack>

        <Group justify="flex-end" gap="sm">
          <Button type="submit" variant="light" size="sm" loading={previewMutation.isPending}>
            {t('events.programs.previewAction')}
          </Button>
        </Group>

        {preview && (
          <>
            <Divider />
            <Group justify="space-between" align="center" wrap="wrap">
              <Text size="sm" fw={500}>
                {t('events.programs.previewSummary', {
                  candidates: preview.candidateCount,
                  valid: preview.validCount,
                })}
              </Text>
              {validDates.length > 0 && (
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setSelectedDates(validDates)}
                >
                  {t('events.programs.selectAllValid')}
                </Button>
              )}
            </Group>

            {preview.occurrences.length === 0 ? (
              <Text size="sm" c="dimmed">
                {t('events.programs.noValidOccurrences')}
              </Text>
            ) : (
              <ScrollArea.Autosize mah={220}>
                <Stack gap="xs">
                  {preview.occurrences.map((item) => {
                    const hasConflict = item.conflictProgramIds.length > 0;
                    const checked = selectedDates.includes(item.date);
                    return (
                      <Paper key={item.date} withBorder p="xs" radius="sm">
                        <Group justify="space-between" wrap="nowrap" gap="sm">
                          <Checkbox
                            checked={checked}
                            disabled={hasConflict}
                            label={`${item.date} · ${formatVietnamTime(item.startsAt)}–${formatVietnamTime(item.endsAt)}`}
                            onChange={(event) => {
                              const isChecked = event.currentTarget.checked;
                              setSelectedDates((current) =>
                                isChecked
                                  ? [...current, item.date]
                                  : current.filter((d) => d !== item.date),
                              );
                            }}
                          />
                          {hasConflict ? (
                            <Badge color="error" variant="light" size="sm" tt="none">
                              {t('events.programs.conflictBadge', {
                                ids: item.conflictProgramIds.map(formatProgramCode).join(', '),
                              })}
                            </Badge>
                          ) : (
                            <Badge color="success" variant="light" size="sm" tt="none">
                              {t('events.programs.availableBadge')}
                            </Badge>
                          )}
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </ScrollArea.Autosize>
            )}
          </>
        )}

        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="default" size="sm" onClick={onClose} disabled={pending}>
            {t('foundations.cancel')}
          </Button>
          {preview && (
            <Button
              size="sm"
              loading={createMutation.isPending}
              disabled={selectedDates.length === 0}
              onClick={handleCreate}
            >
              {t('events.programs.createBatchAction', { count: selectedDates.length })}
            </Button>
          )}
        </Group>
      </Stack>
    </form>
  );
}

/**
 * Modal for previewing and creating recurring draft programs in batch (BL-048 / BL-066).
 */
export function RecurringBatchModal({ opened, onClose, onCreated }: RecurringBatchModalProps) {
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (!pending) onClose();
      }}
      closeOnClickOutside={!pending}
      closeOnEscape={!pending}
      size={660}
      centered
      title={t('events.programs.createRecurring')}
      closeButtonProps={{ 'aria-label': t('auth.closeDialog'), disabled: pending }}
    >
      {opened && (
        <RecurringBatchBody
          key="recurring-batch"
          onClose={onClose}
          onCreated={onCreated}
          onPendingChange={setPending}
        />
      )}
    </Modal>
  );
}
