'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createArtist, deleteArtist, updateArtist } from '../api/artists.api';
import { artistDetailQueryOptions, artistKeys, artistsListQueryOptions } from '../api/artists.queries';
import type { ArtistListQuery } from '../schemas/artist.schema';

export function useArtists(query: ArtistListQuery, enabled = true) {
  return useQuery({
    ...artistsListQueryOptions(query),
    enabled,
  });
}

export function useArtistDetail(id: number | null) {
  return useQuery({
    ...artistDetailQueryOptions(id ?? 0),
    enabled: id !== null,
    gcTime: 0,
  });
}

export function useCreateArtist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => createArtist(body),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: artistKeys.all });
    },
  });
}

export function useUpdateArtist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: unknown }) => updateArtist(id, body),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: artistKeys.all });
    },
  });
}

export function useDeleteArtist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteArtist(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: artistKeys.all });
    },
  });
}
