import { z } from 'zod';
import { requestStaffJson } from '@/shared/api/http-client';
import { publicEnvironment } from '@/shared/config/env';
import { ApiError } from '@/shared/api/api-error';

export async function staffRequest(path: string, method = 'GET', body?: unknown, signal?: AbortSignal) {
  return requestStaffJson(publicEnvironment.apiBaseUrl + path, method, body, signal);
}
const identity = z.object({
  id: z.number().int(),
  fullName: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});
export const sessionQuery = {
  queryKey: ['private', 'session'] as const,
  retry: false,
  queryFn: async ({ signal }: { signal: AbortSignal }) => {
    try {
      return identity.parse(await staffRequest('/auth/session', 'GET', undefined, signal));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
};
export async function signIn(identifier: string, password: string) {
  return identity.parse(await staffRequest('/auth/login', 'POST', { identifier, password }));
}
export function errorKey(error: unknown) {
  return error instanceof ApiError ? 'auth.errors.' + error.code : 'auth.errors.generic';
}
