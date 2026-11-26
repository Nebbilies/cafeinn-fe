'use client';

import { ActionIcon, Button, Menu, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon, type CafeIconName } from '@/shared/ui/cafe-icon';
import { studyRoomPageSizes, type PageSlice, type StudyRoomPageSize } from '../study-room-list.ts';
import classes from './study-rooms.module.css';

type StudyRoomPaginationProps = {
  slice: Omit<PageSlice<unknown>, 'items'>;
  pageSize: StudyRoomPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: StudyRoomPageSize) => void;
};

export function StudyRoomPagination({ slice, pageSize, onPageChange, onPageSizeChange }: StudyRoomPaginationProps) {
  const { t } = useTranslation();
  const { page, pageCount, start, end, total } = slice;
  const pageButton = (icon: CafeIconName, label: string, target: number, disabled: boolean) => (
    <ActionIcon variant="default" size={36} aria-label={label} disabled={disabled} onClick={() => onPageChange(target)}>
      <CafeIcon name={icon} />
    </ActionIcon>
  );

  return (
    <nav className={classes.pagination} aria-label={t('studyRooms.pagination.label')}>
      <Text size="sm" c="dimmed" className={classes.paginationSummary} aria-live="polite">
        {total ? t('studyRooms.pagination.summary', { start, end, total }) : t('studyRooms.pagination.empty')}
      </Text>
      <Menu position="top-end" withinPortal>
        <Menu.Target>
          <Button variant="default" size="sm" rightSection={<CafeIcon name="chevron-down" />} aria-label={`${t('studyRooms.pagination.pageSizeLabel')}: ${t('studyRooms.pagination.pageSize', { count: pageSize })}`}>
            {t('studyRooms.pagination.pageSize', { count: pageSize })}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {studyRoomPageSizes.map((size) => (
            <Menu.Item key={size} onClick={() => onPageSizeChange(size)} aria-current={size === pageSize || undefined} fw={size === pageSize ? 600 : undefined}>
              {t('studyRooms.pagination.pageSize', { count: size })}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      {pageButton('chevrons-left', t('studyRooms.pagination.first'), 1, page <= 1)}
      {pageButton('chevron-left', t('studyRooms.pagination.previous'), page - 1, page <= 1)}
      <Text size="sm" className={classes.pageLabel} aria-current="page">{t('studyRooms.pagination.page', { page, count: pageCount })}</Text>
      {pageButton('chevron-right', t('studyRooms.pagination.next'), page + 1, page >= pageCount)}
      {pageButton('chevrons-right', t('studyRooms.pagination.last'), pageCount, page >= pageCount)}
    </nav>
  );
}
