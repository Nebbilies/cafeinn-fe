'use client';

import { useState, type FormEvent } from 'react';
import { Button, Group, Modal, NumberInput, Stack, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { StudyRoom, StudyRoomInput } from '../types/study-room.types.ts';
import { validateStudyRoomForm, type StudyRoomFormErrors, type StudyRoomFormField } from '../schemas/study-room.schema.ts';

type StudyRoomFormModalProps = {
  opened: boolean;
  /** The room being edited; omit to create a room. */
  room?: StudyRoom;
  onClose: () => void;
  onSubmit: (input: StudyRoomInput) => void;
};

export function StudyRoomFormModal({ opened, room, onClose, onSubmit }: StudyRoomFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal opened={opened} onClose={onClose} size={640} centered title={t(room ? 'studyRooms.editTitle' : 'studyRooms.createTitle')} closeButtonProps={{ 'aria-label': t('studyRooms.close') }}>
      {/* Keyed so each opening starts from the selected room's saved values. */}
      {opened && <StudyRoomForm key={room?.id ?? 'new'} room={room} onCancel={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

type FormValues = { name: string; capacity: number | string; hourlyRate: number | string; amenities: string };

function StudyRoomForm({ room, onCancel, onSubmit }: { room?: StudyRoom; onCancel: () => void; onSubmit: (input: StudyRoomInput) => void }) {
  const { t, i18n } = useTranslation();
  const [values, setValues] = useState<FormValues>(() => ({
    name: room?.name ?? '', capacity: room?.capacity ?? '', hourlyRate: room?.hourlyRate ?? '', amenities: room?.amenities ?? '',
  }));
  const [errors, setErrors] = useState<StudyRoomFormErrors>({});
  const thousandSeparator = i18n.language === 'en' ? ',' : '.';
  const decimalSeparator = i18n.language === 'en' ? '.' : ',';

  const update = <K extends StudyRoomFormField>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };
  const errorFor = (field: StudyRoomFormField) => (errors[field] ? t(`studyRooms.errors.${errors[field]}`) : undefined);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateStudyRoomForm(values);
    if (result.data) onSubmit(result.data);
    else setErrors(result.errors);
  };

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        <TextInput size="md" label={t('studyRooms.fields.name')} value={values.name} onChange={(event) => update('name', event.currentTarget.value)} error={errorFor('name')} required data-autofocus maxLength={50} />
        <NumberInput size="md" label={t('studyRooms.fields.capacity')} value={values.capacity} onChange={(value) => update('capacity', value)} error={errorFor('capacity')} required allowDecimal={false} allowNegative={false} min={1} max={255} hideControls />
        <NumberInput size="md" label={t('studyRooms.fields.hourlyRate')} value={values.hourlyRate} onChange={(value) => update('hourlyRate', value)} error={errorFor('hourlyRate')} required allowDecimal={false} allowNegative={false} thousandSeparator={thousandSeparator} decimalSeparator={decimalSeparator} hideControls />
        <TextInput size="md" label={t('studyRooms.fields.amenities')} value={values.amenities} onChange={(event) => update('amenities', event.currentTarget.value)} error={errorFor('amenities')} />
        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="default" size="md" onClick={onCancel}>{t('studyRooms.cancel')}</Button>
          <Button type="submit" size="md">{t('studyRooms.save')}</Button>
        </Group>
      </Stack>
    </form>
  );
}
