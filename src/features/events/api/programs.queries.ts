import { queryOptions } from '@tanstack/react-query';
import { getProgram, listPrograms } from './programs.api';
import type { ProgramListQuery } from '../schemas/program.schema';

export const programKeys = {
  all: ['private', 'programs'] as const,
  list: (query: ProgramListQuery) => [...programKeys.all, 'list', query] as const,
  detail: (id: number) => [...programKeys.all, 'detail', id] as const,
};

export function programsListQueryOptions(query: ProgramListQuery) {
  return queryOptions({
    queryKey: programKeys.list(query),
    queryFn: ({ signal }) => listPrograms(query, signal),
    retry: false,
  });
}

export function programDetailQueryOptions(id: number) {
  return queryOptions({
    queryKey: programKeys.detail(id),
    queryFn: ({ signal }) => getProgram(id, signal),
    retry: false,
  });
}
