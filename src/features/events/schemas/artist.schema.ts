import { z } from 'zod';

export const artistKinds = ['SOLO', 'BAND'] as const;
export const artistStatuses = ['ACTIVE', 'INACTIVE'] as const;
export const artistSorts = ['id.asc', 'name.asc', 'name.desc'] as const;

export type ArtistKind = (typeof artistKinds)[number];
export type ArtistStatus = (typeof artistStatuses)[number];
export type ArtistSort = (typeof artistSorts)[number];

export const artistSchema = z.object({
  id: z.number().int().positive(),
  stageName: z.string().min(1).max(100),
  kind: z.enum(artistKinds),
  email: z.string().email().max(100),
  phone: z.string().max(15).nullable(),
  genre: z.string().max(50).nullable(),
  notes: z.string().max(1000).nullable(),
  status: z.enum(artistStatuses),
  invitationCount: z.number().int().min(0),
  assignmentCount: z.number().int().min(0),
  hasHistory: z.boolean(),
});

export type Artist = z.infer<typeof artistSchema>;

export const artistPageSchema = z.object({
  items: z.array(artistSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(50),
    totalItems: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export type ArtistPage = z.infer<typeof artistPageSchema>;

export type ArtistListQuery = {
  page: number;
  pageSize: number;
  search: string;
  status: ArtistStatus | null;
  kind: ArtistKind | null;
  sort: ArtistSort;
};

export const artistFormSchema = z.object({
  stageName: z
    .string()
    .trim()
    .min(1, 'events.artists.errors.stageNameRequired')
    .max(100, 'events.artists.errors.stageNameTooLong'),
  kind: z.enum(artistKinds),
  email: z
    .string()
    .trim()
    .min(1, 'events.artists.errors.emailRequired')
    .email('events.artists.errors.emailInvalid')
    .max(100, 'events.artists.errors.emailTooLong'),
  phone: z.string().trim().max(15, 'events.artists.errors.phoneTooLong'),
  genre: z.string().trim().max(50, 'events.artists.errors.genreTooLong'),
  notes: z.string().trim().max(1000, 'events.artists.errors.notesTooLong'),
  status: z.enum(artistStatuses),
});

export type ArtistFormValues = z.infer<typeof artistFormSchema>;

export function formatArtistCode(id: number): string {
  return 'NS' + String(id).padStart(3, '0');
}

export function canDeleteArtist(artist: Pick<Artist, 'hasHistory'>): boolean {
  return !artist.hasHistory;
}

function normalizeOptionalField(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function toArtistPayload(values: ArtistFormValues) {
  return {
    stageName: values.stageName.trim(),
    kind: values.kind,
    email: values.email.trim().toLowerCase(),
    phone: normalizeOptionalField(values.phone),
    genre: normalizeOptionalField(values.genre),
    notes: normalizeOptionalField(values.notes),
    status: values.status,
  };
}
