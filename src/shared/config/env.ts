import { z } from 'zod';

const apiUrl = z.url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol));
export const publicEnvironment = {
  apiBaseUrl: z.union([z.literal('/api/v1'), apiUrl]).parse(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  ).replace(/\/+$/, ''),
};
