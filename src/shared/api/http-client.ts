import { ApiError } from './api-error.ts';

export async function requestJson(url: string, options: RequestInit = {}): Promise<unknown> {
  const response = await fetch(url, options);
  const body = await response.text();
  let data: unknown;
  try {
    data = body ? JSON.parse(body) : undefined;
  } catch (error) {
    if (response.ok) throw error;
  }
  if (!response.ok) {
    let code: string | undefined;
    if (typeof data === 'object' && data !== null && 'error' in data) {
      const detail = data.error;
      if (typeof detail === 'object' && detail !== null && 'code' in detail &&
          typeof detail.code === 'string' && /^[A-Z0-9_]{1,64}$/.test(detail.code)) {
        code = detail.code;
      }
    }
    throw new ApiError(response.status, code);
  }
  return data;
}
