'use client';

import { Button, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import type { StudyRoom } from '../types/study-room.types.ts';
import { useFormatMoney } from '../hooks/use-format-money.ts';
import classes from './study-rooms.module.css';

type StudyRoomTableProps = {
  rooms: StudyRoom[];
  onDetail: (room: StudyRoom) => void;
  onEdit: (room: StudyRoom) => void;
  onDelete: (room: StudyRoom) => void;
};

const rowButtonClassNames = { section: classes.rowButtonSection };

export function StudyRoomTable({ rooms, onDetail, onEdit, onDelete }: StudyRoomTableProps) {
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();

  return (
    <Table.ScrollContainer minWidth={960} type="native">
      <Table className={classes.table} verticalSpacing={0}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={classes.code}>{t('studyRooms.columns.code')}</Table.Th>
            <Table.Th className={classes.name}>{t('studyRooms.columns.name')}</Table.Th>
            <Table.Th className={classes.capacity}>{t('studyRooms.columns.capacity')}</Table.Th>
            <Table.Th className={classes.rate}>{t('studyRooms.columns.hourlyRate')}</Table.Th>
            <Table.Th className={classes.status}>{t('studyRooms.columns.status')}</Table.Th>
            <Table.Th className={classes.actions}>{t('studyRooms.columns.actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rooms.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6} className={classes.empty}>{t('studyRooms.empty')}</Table.Td>
            </Table.Tr>
          ) : rooms.map((room) => (
            <Table.Tr key={room.id}>
              <Table.Td className={classes.code}>{room.code}</Table.Td>
              <Table.Td className={classes.name}><div className={classes.nameText} title={room.name}>{room.name}</div></Table.Td>
              <Table.Td className={classes.capacity}>{room.capacity}</Table.Td>
              <Table.Td className={classes.rate}>{formatMoney(room.hourlyRate)}</Table.Td>
              <Table.Td className={classes.status}>{t(`studyRooms.status.${room.status}`)}</Table.Td>
              <Table.Td className={classes.actions}>
                <div className={classes.rowActions}>
                  <Button variant="default" size="sm" classNames={rowButtonClassNames} px={8} leftSection={<CafeIcon name="eye" />} onClick={() => onDetail(room)} aria-label={t('studyRooms.rowAction', { action: t('studyRooms.actions.detail'), name: room.name })}>
                    {t('studyRooms.actions.detail')}
                  </Button>
                  <Button variant="default" size="sm" classNames={rowButtonClassNames} px={8} leftSection={<CafeIcon name="pencil" />} onClick={() => onEdit(room)} aria-label={t('studyRooms.rowAction', { action: t('studyRooms.actions.edit'), name: room.name })}>
                    {t('studyRooms.actions.edit')}
                  </Button>
                  <Button variant="default" size="sm" classNames={rowButtonClassNames} px={8} leftSection={<CafeIcon name="trash" />} disabled={room.hasUsageHistory} onClick={() => onDelete(room)} aria-label={t('studyRooms.rowAction', { action: t('studyRooms.actions.delete'), name: room.name })}>
                    {t('studyRooms.actions.delete')}
                  </Button>
                </div>
                {room.hasUsageHistory && <Text size="xs" c="dimmed" mt={4}>{t('studyRooms.deleteLocked')}</Text>}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
