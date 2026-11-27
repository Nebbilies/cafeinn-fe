'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Combobox,
  Group,
  InputBase,
  Loader,
  Stack,
  Text,
  useCombobox,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import { useArtistDetail, useArtists } from '../hooks/use-artists';
import { formatArtistCode, type Artist } from '../schemas/artist.schema';
import { ArtistContactInlineForm } from './artist-contact-inline-form';

type ArtistContactPickerProps = {
  value: number | null;
  onChange: (artist: Artist | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  onModalOpenChange?: (opened: boolean) => void;
};

/**
 * Searchable inline artist contact selector for event invitation and schedule forms.
 * Allows selecting an active contact or creating a new reusable contact without leaving the event context.
 */
export function ArtistContactPicker({
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled = false,
  onModalOpenChange,
}: ArtistContactPickerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState<{ opened: boolean; artist: Artist | null }>({
    opened: false,
    artist: null,
  });
  const pickerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onModalOpenChange?.(formState.opened);
  }, [formState.opened, onModalOpenChange]);

  useEffect(() => {
    return () => {
      onModalOpenChange?.(false);
    };
  }, [onModalOpenChange]);

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
  });

  const handleContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && pickerContainerRef.current?.contains(nextTarget)) {
      return;
    }
    combobox.closeDropdown();
  };

  const activeList = useArtists(
    {
      page: 1,
      pageSize: 20,
      search: search.trim(),
      status: 'ACTIVE',
      kind: null,
      sort: 'name.asc',
    },
    !disabled,
  );

  const items = activeList.data?.items ?? [];
  const listedMatch = value !== null ? items.find((item) => item.id === value) ?? null : null;
  const detailQuery = useArtistDetail(value !== null && !listedMatch ? value : null);
  const selectedArtist = listedMatch ?? detailQuery.data ?? null;
  const isLoadingSelected = value !== null && !selectedArtist && detailQuery.isPending;

  const displayValue = selectedArtist
    ? `${formatArtistCode(selectedArtist.id)} · ${selectedArtist.stageName}`
    : isLoadingSelected
      ? t('auth.loading')
      : '';

  return (
    <Stack gap="xs">
      <div ref={pickerContainerRef} onBlur={handleContainerBlur}>
        <Combobox
          store={combobox}
          withinPortal={false}
          onOptionSubmit={(optionValue) => {
            if (optionValue === '__create__') {
              combobox.closeDropdown();
              setFormState({ opened: true, artist: null });
              return;
            }
            const picked = items.find((item) => String(item.id) === optionValue) ?? null;
            onChange(picked);
            setSearch('');
            combobox.closeDropdown();
          }}
        >
          <Combobox.Target>
            <InputBase
              label={label ?? t('events.artists.pickerLabel')}
              placeholder={placeholder ?? t('events.artists.pickerPlaceholder')}
              value={combobox.dropdownOpened ? search : displayValue}
              disabled={disabled}
              error={error}
              rightSection={
                isLoadingSelected ? (
                  <Loader size={14} aria-label={t('auth.loading')} />
                ) : selectedArtist && !disabled ? (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    aria-label={t('events.artists.editSelected')}
                    title={t('events.artists.editSelected')}
                    onClick={(event) => {
                      event.stopPropagation();
                      setFormState({ opened: true, artist: selectedArtist });
                    }}
                  >
                    <CafeIcon name="pencil" size={14} />
                  </ActionIcon>
                ) : (
                  <Combobox.Chevron />
                )
              }
              rightSectionPointerEvents={selectedArtist && !disabled && !isLoadingSelected ? 'auto' : 'none'}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                combobox.openDropdown();
                combobox.updateSelectedOptionIndex();
              }}
            />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              {activeList.isPending ? (
                <Combobox.Empty>{t('auth.loading')}</Combobox.Empty>
              ) : items.length === 0 ? (
                <Combobox.Empty>{t('events.artists.empty')}</Combobox.Empty>
              ) : (
                items.map((item) => (
                  <Combobox.Option key={item.id} value={String(item.id)} active={item.id === value}>
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Text size="sm" fw={500} truncate>
                          {formatArtistCode(item.id)} · {item.stageName}
                        </Text>
                        <Text size="xs" c="dimmed" truncate>
                          {item.email}
                          {item.phone ? ` · ${item.phone}` : ''}
                        </Text>
                      </div>
                      <Badge variant="light" size="sm" tt="none">
                        {t(`events.artists.kinds.${item.kind}`)}
                      </Badge>
                    </Group>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>

            <Combobox.Footer>
              <Button
                variant="subtle"
                size="xs"
                fullWidth
                leftSection={<CafeIcon name="plus" size={14} />}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  combobox.closeDropdown();
                  setFormState({ opened: true, artist: null });
                }}
              >
                {t('events.artists.addInline')}
              </Button>
            </Combobox.Footer>
          </Combobox.Dropdown>
        </Combobox>
      </div>

      <ArtistContactInlineForm
        opened={formState.opened}
        artist={formState.artist}
        onClose={() => setFormState({ opened: false, artist: null })}
        onSaved={(saved) => {
          onChange(saved);
          setSearch('');
        }}
      />
    </Stack>
  );
}
