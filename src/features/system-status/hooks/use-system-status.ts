'use client';

import { useQuery } from '@tanstack/react-query';
import { getSystemStatus } from '../api/system-status.api';

export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: ({ signal }) => getSystemStatus(signal),
    retry: 1,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
