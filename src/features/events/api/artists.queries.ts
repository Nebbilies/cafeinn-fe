import { queryOptions } from '@tanstack/react-query';
import { getArtist, listArtists } from './artists.api';
import type { ArtistListQuery } from '../schemas/artist.schema';

export const artistKeys = {
  all: ['private', 'artists'] as const,
  list: (query: ArtistListQuery) => [...artistKeys.all, 'list', query] as const,
  detail: (id: number) => [...artistKeys.all, 'detail', id] as const,
};

export function artistsListQueryOptions(query: ArtistListQuery) {
  return queryOptions({
    queryKey: artistKeys.list(query),
    queryFn: ({ signal }) => listArtists(query, signal),
    retry: false,
  });
}

export function artistDetailQueryOptions(id: number) {
  return queryOptions({
    queryKey: artistKeys.detail(id),
    queryFn: ({ signal }) => getArtist(id, signal),
    retry: false,
  });
}
