import { ApiError } from '@/shared/api/api-error';
import { errorKey, staffRequest } from '@/features/auth/api/auth.api';
import {
  artistPageSchema,
  artistSchema,
  type Artist,
  type ArtistListQuery,
  type ArtistPage,
} from '../schemas/artist.schema';

const artistDomainErrorCodes = new Set([
  'ARTIST_EMAIL_EXISTS',
  'ARTIST_HAS_HISTORY',
  'ARTIST_NOT_FOUND',
]);

export function artistErrorKey(error: unknown): string {
  if (error instanceof ApiError && error.code && artistDomainErrorCodes.has(error.code)) {
    return 'events.artists.errors.' + error.code;
  }
  return errorKey(error);
}

export async function listArtists(query: ArtistListQuery, signal: AbortSignal): Promise<ArtistPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sort: query.sort,
  });
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);
  if (query.kind) params.set('kind', query.kind);
  return artistPageSchema.parse(await staffRequest('/artists?' + params, 'GET', undefined, signal));
}

export async function getArtist(id: number, signal: AbortSignal): Promise<Artist> {
  return artistSchema.parse(await staffRequest('/artists/' + id, 'GET', undefined, signal));
}

export async function createArtist(body: unknown): Promise<Artist> {
  return artistSchema.parse(await staffRequest('/artists', 'POST', body));
}

export async function updateArtist(id: number, body: unknown): Promise<Artist> {
  return artistSchema.parse(await staffRequest('/artists/' + id, 'PATCH', body));
}

export async function deleteArtist(id: number): Promise<void> {
  await staffRequest('/artists/' + id, 'DELETE');
}
