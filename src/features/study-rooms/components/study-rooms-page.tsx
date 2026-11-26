'use client';

import { useCallback, useState } from 'react';
import { Button, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import { PortalPageHeader } from '@/features/portal';
import type { StudyRoom, StudyRoomInput } from '../types/study-room.types.ts';
import { studyRoomFixtures } from '../fixtures/study-rooms.fixture.ts';
import {
  emptyStudyRoomFilters, getCapacityOptions, nextStudyRoomCode, paginate, queryStudyRooms,
  type StudyRoomFilters, type StudyRoomPageSize, type StudyRoomSort,
} from '../study-room-list.ts';
import { StudyRoomToolbar } from './study-room-toolbar';
import { StudyRoomTable } from './study-room-table';
import { StudyRoomPagination } from './study-room-pagination';
import { StudyRoomFormModal } from './study-room-form-modal';
import { StudyRoomDeleteModal, StudyRoomDetailModal, StudyRoomMaintenanceModal } from './study-room-dialogs';
import { FeedbackToast } from './feedback-toast';
import classes from './study-rooms.module.css';

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit' | 'detail' | 'maintenance' | 'delete'; roomId: number };

/**
 * Admin screen "Phòng học và bảng giá" (Figma AD04). Changes live in local state over
 * design fixtures until the study-room API contract exists; nothing is persisted.
 */
export function StudyRoomsPage() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<StudyRoom[]>(studyRoomFixtures);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<StudyRoomFilters>(emptyStudyRoomFilters);
  const [sort, setSort] = useState<StudyRoomSort>('code-asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<StudyRoomPageSize>(10);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  const slice = paginate(queryStudyRooms(rooms, { search, filters, sort }), page, pageSize);
  const dialogRoom = (kind: Exclude<Dialog['kind'], 'create'>) =>
    dialog?.kind === kind ? rooms.find((room) => room.id === dialog.roomId) : undefined;
  const closeDialog = () => setDialog(null);
  const closeToast = useCallback(() => setToast(null), []);
  const notify = (text: string) => setToast({ id: Date.now(), text });
  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => { setter(value); setPage(1); };

  const updateRoom = (id: number, change: Partial<StudyRoom>) =>
    setRooms((current) => current.map((room) => (room.id === id ? { ...room, ...change } : room)));

  const saveRoom = (input: StudyRoomInput) => {
    if (dialog?.kind === 'edit') {
      updateRoom(dialog.roomId, input);
    } else {
      setRooms((current) => [...current, {
        ...input,
        id: Math.max(0, ...current.map((room) => room.id)) + 1,
        code: nextStudyRoomCode(current),
        status: 'ACTIVE',
        hasUsageHistory: false,
      }]);
    }
    closeDialog();
    notify(t('studyRooms.saved'));
  };

  return (
    <>
      <PortalPageHeader
        title={t('studyRooms.title')}
        actions={<Button size="sm" leftSection={<CafeIcon name="plus" />} onClick={() => setDialog({ kind: 'create' })}>{t('studyRooms.add')}</Button>}
      />
      <div className={classes.workspace}>
        <Paper withBorder radius="md" className={classes.browser}>
          <StudyRoomToolbar
            search={search}
            onSearchChange={resetPage(setSearch)}
            sort={sort}
            onSortChange={resetPage(setSort)}
            filters={filters}
            onFiltersChange={resetPage(setFilters)}
            capacityOptions={getCapacityOptions(rooms)}
          />
          <StudyRoomTable
            rooms={slice.items}
            onDetail={(room) => setDialog({ kind: room.status === 'MAINTENANCE' ? 'maintenance' : 'detail', roomId: room.id })}
            onEdit={(room) => setDialog({ kind: 'edit', roomId: room.id })}
            onDelete={(room) => setDialog({ kind: 'delete', roomId: room.id })}
          />
          <StudyRoomPagination slice={slice} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={resetPage(setPageSize)} />
        </Paper>
      </div>

      <StudyRoomFormModal
        opened={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        room={dialogRoom('edit')}
        onClose={closeDialog}
        onSubmit={saveRoom}
      />
      <StudyRoomDetailModal room={dialogRoom('detail')} onClose={closeDialog} onEdit={(room) => setDialog({ kind: 'edit', roomId: room.id })} />
      <StudyRoomMaintenanceModal
        room={dialogRoom('maintenance')}
        onClose={closeDialog}
        onReopen={(room) => { updateRoom(room.id, { status: 'ACTIVE' }); closeDialog(); notify(t('studyRooms.saved')); }}
      />
      <StudyRoomDeleteModal
        room={dialogRoom('delete')}
        onClose={closeDialog}
        onConfirm={(room) => { setRooms((current) => current.filter((item) => item.id !== room.id)); closeDialog(); notify(t('studyRooms.deleted')); }}
      />
      <FeedbackToast message={toast} onClose={closeToast} />
    </>
  );
}
