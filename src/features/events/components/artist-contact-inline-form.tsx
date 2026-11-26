'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import { artistErrorKey } from '../api/artists.api';
import { useCreateArtist, useUpdateArtist } from '../hooks/use-artists';
import {
  artistFormSchema,
  artistKinds,
  artistStatuses,
  formatArtistCode,
  toArtistPayload,
  type Artist,
  type ArtistFormValues,
  type ArtistKind,
  type ArtistStatus,
} from '../schemas/artist.schema';

type ArtistContactInlineFormProps = {
  opened: boolean;
  artist?: Artist | null;
  onClose: () => void;
  onSaved?: (artist: Artist) => void;
};

type FormFieldErrors = Partial<Record<keyof ArtistFormValues, string>>;

function ArtistFormBody({
  artist,
  onClose,
  onSaved,
  onPendingChange,
}: {
  artist?: Artist | null;
  onClose: () => void;
  onSaved?: (artist: Artist) => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateArtist();
  const updateMutation = useUpdateArtist();
  const mountedRef = useRef(true);

  const [stageName, setStageName] = useState(artist?.stageName ?? '');
  const [kind, setKind] = useState<ArtistKind>(artist?.kind ?? 'BAND');
  const [email, setEmail] = useState(artist?.email ?? '');
  const [phone, setPhone] = useState(artist?.phone ?? '');
  const [genre, setGenre] = useState(artist?.genre ?? '');
  const [notes, setNotes] = useState(artist?.notes ?? '');
  const [status, setStatus] = useState<ArtistStatus>(artist?.status ?? 'ACTIVE');
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const pending = createMutation.isPending || updateMutation.isPending;
  const serverError = artist ? updateMutation.error : createMutation.error;

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
    const parsed = artistFormSchema.safeParse({
      stageName,
      kind,
      email,
      phone,
      genre,
      notes,
      status,
    });
    if (!parsed.success) {
      const nextErrors: FormFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ArtistFormValues | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    const payload = toArtistPayload(parsed.data);
    try {
      const saved = artist
        ? await updateMutation.mutateAsync({ id: artist.id, body: payload })
        : await createMutation.mutateAsync(payload);
      if (!mountedRef.current) return;
      onSaved?.(saved);
      onClose();
    } catch {
      // Mutation error state is rendered inline in the form alert.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="md">
        {serverError && (
          <Alert color="error" role="alert" icon={<CafeIcon name="info" />}>
            {t(artistErrorKey(serverError), { defaultValue: t('auth.errors.generic') })}
          </Alert>
        )}

        {artist && (
          <Text size="sm" c="dimmed">
            {t('events.artists.fields.code')}: <strong>{formatArtistCode(artist.id)}</strong>
          </Text>
        )}

        {artist?.hasHistory && (
          <Alert color="info" icon={<CafeIcon name="info" />}>
            {t('events.artists.historyPreservedNote')}
          </Alert>
        )}

        <TextInput
          label={t('events.artists.fields.stageName')}
          placeholder={t('events.artists.placeholders.stageName')}
          required
          maxLength={100}
          value={stageName}
          error={fieldErrors.stageName ? t(fieldErrors.stageName) : undefined}
          onChange={(e) => setStageName(e.currentTarget.value)}
          data-autofocus
        />

        <Group grow align="flex-start">
          <Select
            label={t('events.artists.fields.kind')}
            required
            allowDeselect={false}
            value={kind}
            data={artistKinds.map((value) => ({
              value,
              label: t(`events.artists.kinds.${value}`),
            }))}
            onChange={(value) => {
              if (value === 'SOLO' || value === 'BAND') setKind(value);
            }}
            comboboxProps={{ withinPortal: false }}
          />

          <TextInput
            label={t('events.artists.fields.genre')}
            placeholder={t('events.artists.placeholders.genre')}
            maxLength={50}
            value={genre}
            error={fieldErrors.genre ? t(fieldErrors.genre) : undefined}
            onChange={(e) => setGenre(e.currentTarget.value)}
          />
        </Group>

        <Group grow align="flex-start">
          <TextInput
            label={t('events.artists.fields.email')}
            placeholder={t('events.artists.placeholders.email')}
            type="email"
            required
            maxLength={100}
            value={email}
            error={fieldErrors.email ? t(fieldErrors.email) : undefined}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <TextInput
            label={t('events.artists.fields.phone')}
            placeholder={t('events.artists.placeholders.phone')}
            maxLength={15}
            value={phone}
            error={fieldErrors.phone ? t(fieldErrors.phone) : undefined}
            onChange={(e) => setPhone(e.currentTarget.value)}
          />
        </Group>

        {artist && (
          <Select
            label={t('events.artists.fields.status')}
            allowDeselect={false}
            value={status}
            data={artistStatuses.map((value) => ({
              value,
              label: t(`events.artists.status.${value}`),
            }))}
            onChange={(value) => {
              if (value === 'ACTIVE' || value === 'INACTIVE') setStatus(value);
            }}
            comboboxProps={{ withinPortal: false }}
          />
        )}

        <Textarea
          label={t('events.artists.fields.notes')}
          placeholder={t('events.artists.placeholders.notes')}
          maxLength={1000}
          minRows={2}
          autosize
          value={notes}
          error={fieldErrors.notes ? t(fieldErrors.notes) : undefined}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />

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

/**
 * Reusable inline modal form for creating or editing an artist/band contact within events.
 */
export function ArtistContactInlineForm({
  opened,
  artist,
  onClose,
  onSaved,
}: ArtistContactInlineFormProps) {
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
      size={560}
      centered
      title={t(artist ? 'events.artists.editTitle' : 'events.artists.createTitle')}
      closeButtonProps={{ 'aria-label': t('auth.closeDialog'), disabled: saving }}
    >
      {opened && (
        <ArtistFormBody
          key={artist ? `edit-${artist.id}` : 'create'}
          artist={artist}
          onClose={onClose}
          onSaved={onSaved}
          onPendingChange={setSaving}
        />
      )}
    </Modal>
  );
}
