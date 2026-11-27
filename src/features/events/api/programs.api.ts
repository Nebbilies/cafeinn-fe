import { ApiError } from '@/shared/api/api-error';
import { errorKey, staffRequest } from '@/features/auth/api/auth.api';
import {
  programPageSchema,
  programSchema,
  recurringBatchCreatedSchema,
  recurringPreviewSchema,
  type Program,
  type ProgramListQuery,
  type ProgramPage,
  type RecurringBatchCreated,
  type RecurringPreview,
} from '../schemas/program.schema';

const programDomainErrorCodes = new Set([
  'PROGRAM_NOT_FOUND',
  'AREA_NOT_FOUND',
  'AREA_UNAVAILABLE',
  'PROGRAM_TIME_CONFLICT',
  'STALE_PROGRAM',
  'PROGRAM_CHANGE_REQUIRES_COORDINATION',
  'PREVIEW_STALE',
  'RECURRING_BATCH_NOT_FOUND',
]);

export function programErrorKey(error: unknown): string {
  if (error instanceof ApiError && error.code && programDomainErrorCodes.has(error.code)) {
    return 'events.programs.errors.' + error.code;
  }
  return errorKey(error);
}

export async function listPrograms(
  query: ProgramListQuery,
  signal: AbortSignal,
): Promise<ProgramPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sort: query.sort,
  });
  if (query.search) params.set('search', query.search);
  if (query.kind) params.set('kind', query.kind);
  if (query.status) params.set('status', query.status);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  return programPageSchema.parse(
    await staffRequest('/programs?' + params, 'GET', undefined, signal),
  );
}

export async function getProgram(id: number, signal: AbortSignal): Promise<Program> {
  return programSchema.parse(await staffRequest('/programs/' + id, 'GET', undefined, signal));
}

export async function createProgram(body: unknown): Promise<Program> {
  return programSchema.parse(await staffRequest('/programs', 'POST', body));
}

export async function updateProgram(id: number, body: unknown): Promise<Program> {
  return programSchema.parse(await staffRequest('/programs/' + id, 'PATCH', body));
}

export async function deleteProgram(id: number, revision: number): Promise<void> {
  await staffRequest('/programs/' + id, 'DELETE', { revision });
}

export async function previewRecurringBatch(body: unknown): Promise<RecurringPreview> {
  return recurringPreviewSchema.parse(
    await staffRequest('/recurring-batches/preview', 'POST', body),
  );
}

export async function createRecurringBatch(body: unknown): Promise<RecurringBatchCreated> {
  return recurringBatchCreatedSchema.parse(await staffRequest('/recurring-batches', 'POST', body));
}
