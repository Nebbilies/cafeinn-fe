import { z } from 'zod';
import { requestJson } from '@/shared/api/http-client';
import { publicEnvironment } from '@/shared/config/env';

const healthSchema = z.object({ status: z.literal('ok'), service: z.literal('cafeinn-be') });

export async function getSystemStatus(signal?: AbortSignal) {
  return healthSchema.parse(await requestJson(
    publicEnvironment.apiBaseUrl + '/health', { signal },
  ));
}
