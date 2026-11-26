'use client';

import { Button, Menu, Popover, Select, Text, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import { studyRoomStatuses } from '../types/study-room.types.ts';
import { countActiveFilters, studyRoomSorts, type StudyRoomFilters, type StudyRoomSort } from '../study-room-list.ts';
import classes from './study-rooms.module.css';

type StudyRoomToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: StudyRoomSort;
  onSortChange: (value: StudyRoomSort) => void;
  filters: StudyRoomFilters;
  onFiltersChange: (value: StudyRoomFilters) => void;
  capacityOptions: number[];
};

const allValue = 'all';

export function StudyRoomToolbar({ search, onSearchChange, sort, onSortChange, filters, onFiltersChange, capacityOptions }: StudyRoomToolbarProps) {
  const { t } = useTranslation();
  const activeFilters = countActiveFilters(filters);
  const capacityLabel = filters.capacity === null ? t('studyRooms.all') : String(filters.capacity);
  const statusLabel = filters.status === null ? t('studyRooms.all') : t(`studyRooms.status.${filters.status}`);

  return (
    <div className={classes.toolbar}>
      <Menu position="bottom-start" withinPortal>
        <Menu.Target>
          <Button variant="default" size="sm" rightSection={<CafeIcon name="chevron-down" />}>{t('studyRooms.sort')}</Button>
        </Menu.Target>
        <Menu.Dropdown>
          {studyRoomSorts.map((option) => (
            <Menu.Item key={option} onClick={() => onSortChange(option)} aria-current={option === sort || undefined} fw={option === sort ? 600 : undefined}>
              {t(`studyRooms.sortOptions.${option}`)}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <div className={classes.toolbarSpacer} />
      <Popover position="bottom-end" withinPortal trapFocus>
        <Popover.Target>
          <Button variant="default" size="sm" rightSection={<CafeIcon name="chevron-down" />}>
            {activeFilters ? t('studyRooms.filterWithCount', { count: activeFilters }) : t('studyRooms.filter')}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <div className={classes.filterPanel}>
            <Text size="sm" c="dimmed">{t('studyRooms.filterSummary', { capacity: capacityLabel, status: statusLabel })}</Text>
            <Select
              size="sm"
              label={t('studyRooms.columns.capacity')}
              allowDeselect={false}
              comboboxProps={{ withinPortal: false }}
              value={filters.capacity === null ? allValue : String(filters.capacity)}
              data={[{ value: allValue, label: t('studyRooms.all') }, ...capacityOptions.map((value) => ({ value: String(value), label: String(value) }))]}
              onChange={(value) => onFiltersChange({ ...filters, capacity: !value || value === allValue ? null : Number(value) })}
            />
            <Select
              size="sm"
              label={t('studyRooms.columns.status')}
              allowDeselect={false}
              comboboxProps={{ withinPortal: false }}
              value={filters.status ?? allValue}
              data={[{ value: allValue, label: t('studyRooms.all') }, ...studyRoomStatuses.map((value) => ({ value, label: t(`studyRooms.status.${value}`) }))]}
              onChange={(value) => onFiltersChange({ ...filters, status: studyRoomStatuses.find((status) => status === value) ?? null })}
            />
            <Button variant="default" size="sm" disabled={!activeFilters} onClick={() => onFiltersChange({ capacity: null, status: null })}>
              {t('studyRooms.clearFilters')}
            </Button>
          </div>
        </Popover.Dropdown>
      </Popover>
      <TextInput
        className={classes.search}
        size="sm"
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        placeholder={t('studyRooms.searchPlaceholder')}
        aria-label={t('studyRooms.searchLabel')}
      />
    </div>
  );
}
