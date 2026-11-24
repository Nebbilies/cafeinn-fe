'use client';

import { Badge, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import type { StudyRoom } from '../types/study-room.types.ts';
import { useFormatMoney } from '../hooks/use-format-money.ts';
import classes from './study-rooms.module.css';

type RoomDialogProps = { room: StudyRoom | undefined; onClose: () => void };

export function StudyRoomDetailModal({ room, onClose, onEdit }: RoomDialogProps & { onEdit: (room: StudyRoom) => void }) {
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();
  const rows = room ? [
    [t('studyRooms.columns.code'), room.code],
    [t('studyRooms.columns.name'), room.name],
    [t('studyRooms.columns.capacity'), String(room.capacity)],
    [t('studyRooms.columns.hourlyRate'), formatMoney(room.hourlyRate)],
    [t('studyRooms.fields.amenities'), room.amenities || '—'],
    [t('studyRooms.columns.status'), t(`studyRooms.status.${room.status}`)],
  ] : [];

  return (
    <Modal opened={Boolean(room)} onClose={onClose} size={640} centered title={t('studyRooms.detailTitle')} closeButtonProps={{ 'aria-label': t('studyRooms.close') }}>
      <Stack gap="lg">
        <dl className={classes.detailList}>
          {rows.map(([label, value]) => (
            <div key={label} className={classes.detailRow}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" size="sm" leftSection={<CafeIcon name="pencil" />} onClick={() => room && onEdit(room)}>{t('studyRooms.actions.edit')}</Button>
          <Button variant="default" size="sm" onClick={onClose} data-autofocus>{t('studyRooms.close')}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function StudyRoomMaintenanceModal({ room, onClose, onReopen }: RoomDialogProps & { onReopen: (room: StudyRoom) => void }) {
  const { t } = useTranslation();
  return (
    <Modal opened={Boolean(room)} onClose={onClose} size={560} centered title={t('studyRooms.maintenanceTitle')} closeButtonProps={{ 'aria-label': t('studyRooms.close') }}>
      <Stack gap="lg">
        <Stack gap="md" align="flex-start">
          <Badge variant="light" color="warning" size="md">{t('studyRooms.needsAction')}</Badge>
          <Text size="sm">{t('studyRooms.maintenanceNotice', { code: room?.code })}</Text>
        </Stack>
        <Group justify="flex-end">
          <Button size="md" onClick={() => room && onReopen(room)} data-autofocus>{t('studyRooms.reopen')}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function StudyRoomDeleteModal({ room, onClose, onConfirm }: RoomDialogProps & { onConfirm: (room: StudyRoom) => void }) {
  const { t } = useTranslation();
  return (
    <Modal opened={Boolean(room)} onClose={onClose} size={560} centered title={t('studyRooms.deleteTitle')} closeButtonProps={{ 'aria-label': t('studyRooms.close') }}>
      <Stack gap="lg">
        <Stack gap="xs">
          <Text size="sm" fw={600}>{room ? `${room.code} · ${room.name}` : null}</Text>
          <Text size="sm" c="dimmed">{t('studyRooms.deleteNotice')}</Text>
        </Stack>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" size="sm" onClick={onClose} data-autofocus>{t('studyRooms.back')}</Button>
          <Button variant="default" size="sm" leftSection={<CafeIcon name="trash" />} onClick={() => room && onConfirm(room)}>{t('studyRooms.actions.delete')}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
