'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProgram,
  createRecurringBatch,
  deleteProgram,
  previewRecurringBatch,
  updateProgram,
} from '../api/programs.api';
import {
  programDetailQueryOptions,
  programKeys,
  programsListQueryOptions,
} from '../api/programs.queries';
import type { ProgramListQuery } from '../schemas/program.schema';

export function usePrograms(query: ProgramListQuery, enabled = true) {
  return useQuery({
    ...programsListQueryOptions(query),
    enabled,
  });
}

export function useProgramDetail(id: number | null) {
  return useQuery({
    ...programDetailQueryOptions(id ?? 0),
    enabled: id !== null,
    gcTime: 0,
  });
}

export function useCreateProgram() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => createProgram(body),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

export function useUpdateProgram() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: unknown }) => updateProgram(id, body),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

export function useDeleteProgram() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, revision }: { id: number; revision: number }) =>
      deleteProgram(id, revision),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

export function usePreviewRecurringBatch() {
  return useMutation({
    mutationFn: (body: unknown) => previewRecurringBatch(body),
  });
}

export function useCreateRecurringBatch() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => createRecurringBatch(body),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}
