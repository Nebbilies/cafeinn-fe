import { z } from 'zod';

export const programKinds = ['SPECIAL', 'RECURRING'] as const;
export const programStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED'] as const;
export const programSorts = ['startsAt.asc', 'startsAt.desc', 'name.asc', 'name.desc'] as const;
export const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export const DEFAULT_ACOUSTIC_AREA_ID = 2;
export const DEFAULT_HOLD_MINUTES = 30;
export const MAX_RECURRENCE_DAYS = 90;
export const VIETNAM_OFFSET = '+07:00';
export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export type ProgramKind = (typeof programKinds)[number];
export type ProgramStatus = (typeof programStatuses)[number];
export type ProgramSort = (typeof programSorts)[number];
export type Weekday = (typeof weekdays)[number];
export type ProgramDisplayState = 'DRAFT' | 'CANCELLED' | 'UPCOMING' | 'ONGOING' | 'ENDED';

const calendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const localTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const specialEventSchema = z.object({
  capacityLimit: z.number().int().min(1),
  surchargePerPerson: z.number().int().min(0),
  registrationDeadline: z.string(),
  cancellationDeadline: z.string(),
  holdMinutes: z.number().int().min(1),
  holdUntil: z.string(),
});

export type SpecialEvent = z.infer<typeof specialEventSchema>;

export const programSchema = z.object({
  id: z.number().int().positive(),
  areaId: z.number().int().positive(),
  name: z.string().min(1).max(150),
  description: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  revision: z.number().int().positive(),
  kind: z.enum(programKinds),
  startsAt: z.string(),
  endsAt: z.string(),
  status: z.enum(programStatuses),
  recurringBatchId: z.number().int().positive().nullable(),
  publishedScheduleVersionId: z.number().int().positive().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  specialEvent: specialEventSchema.nullable(),
  bookingAllowed: z.boolean(),
});

export type Program = z.infer<typeof programSchema>;

export const programPageSchema = z.object({
  items: z.array(programSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(50),
    totalItems: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export type ProgramPage = z.infer<typeof programPageSchema>;

export const recurringPreviewSchema = z.object({
  occurrences: z.array(
    z.object({
      date: z.string(),
      startsAt: z.string(),
      endsAt: z.string(),
      conflictProgramIds: z.array(z.number().int().positive()),
    }),
  ),
  candidateCount: z.number().int().min(0),
  validCount: z.number().int().min(0),
});

export type RecurringPreview = z.infer<typeof recurringPreviewSchema>;

export const recurringBatchCreatedSchema = z.object({
  batchId: z.number().int().positive(),
  createdCount: z.number().int().min(1),
  programIds: z.array(z.number().int().positive()),
});

export type RecurringBatchCreated = z.infer<typeof recurringBatchCreatedSchema>;

export type ProgramListQuery = {
  page: number;
  pageSize: number;
  search: string;
  kind: ProgramKind | null;
  status: ProgramStatus | null;
  from: string | null;
  to: string | null;
  sort: ProgramSort;
};

function isValidCoverUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.length > 2048) return false;
  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      !parsed.username &&
      !parsed.password
    );
  } catch {
    return false;
  }
}

const baseProgramFields = {
  areaId: z.number().int().min(1, 'events.programs.errors.areaIdRequired').max(2_147_483_647),
  name: z
    .string()
    .trim()
    .min(1, 'events.programs.errors.nameRequired')
    .max(150, 'events.programs.errors.nameTooLong'),
  description: z
    .string()
    .trim()
    .min(1, 'events.programs.errors.descriptionRequired')
    .max(16_000, 'events.programs.errors.descriptionTooLong'),
  coverImageUrl: z
    .string()
    .trim()
    .refine(isValidCoverUrl, 'events.programs.errors.coverImageUrlInvalid'),
  eventDate: z.string().regex(calendarDatePattern, 'events.programs.errors.dateRequired'),
  startTime: z.string().regex(localTimePattern, 'events.programs.errors.timeRequired'),
  endTime: z.string().regex(localTimePattern, 'events.programs.errors.timeRequired'),
};

export const recurringProgramEditSchema = z
  .object(baseProgramFields)
  .refine((v) => v.startTime < v.endTime, {
    path: ['endTime'],
    message: 'events.programs.errors.endBeforeStart',
  });

export type RecurringProgramEditValues = z.infer<typeof recurringProgramEditSchema>;

export const specialProgramFormSchema = z
  .object({
    ...baseProgramFields,
    capacityLimit: z
      .number()
      .int('events.programs.errors.capacityInvalid')
      .min(1, 'events.programs.errors.capacityInvalid')
      .max(65_535, 'events.programs.errors.capacityInvalid'),
    surchargePerPerson: z
      .number()
      .int('events.programs.errors.surchargeInvalid')
      .min(0, 'events.programs.errors.surchargeInvalid')
      .max(4_294_967_295, 'events.programs.errors.surchargeInvalid'),
    registrationDeadlineDate: z
      .string()
      .regex(calendarDatePattern, 'events.programs.errors.deadlineRequired'),
    registrationDeadlineTime: z
      .string()
      .regex(localTimePattern, 'events.programs.errors.deadlineRequired'),
    cancellationDeadlineDate: z
      .string()
      .regex(calendarDatePattern, 'events.programs.errors.deadlineRequired'),
    cancellationDeadlineTime: z
      .string()
      .regex(localTimePattern, 'events.programs.errors.deadlineRequired'),
    holdMinutes: z
      .number()
      .int('events.programs.errors.holdMinutesInvalid')
      .min(1, 'events.programs.errors.holdMinutesInvalid')
      .max(65_535, 'events.programs.errors.holdMinutesInvalid'),
  })
  .superRefine((values, ctx) => {
    if (values.startTime >= values.endTime) {
      ctx.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'events.programs.errors.endBeforeStart',
      });
    }
    const startsAtMs = Date.parse(toVietnamIso(values.eventDate, values.startTime));
    const regMs = Date.parse(
      toVietnamIso(values.registrationDeadlineDate, values.registrationDeadlineTime),
    );
    const cancelMs = Date.parse(
      toVietnamIso(values.cancellationDeadlineDate, values.cancellationDeadlineTime),
    );
    if (!Number.isNaN(startsAtMs) && !Number.isNaN(regMs) && regMs > startsAtMs) {
      ctx.addIssue({
        code: 'custom',
        path: ['registrationDeadlineDate'],
        message: 'events.programs.errors.deadlineAfterStart',
      });
    }
    if (!Number.isNaN(startsAtMs) && !Number.isNaN(cancelMs) && cancelMs > startsAtMs) {
      ctx.addIssue({
        code: 'custom',
        path: ['cancellationDeadlineDate'],
        message: 'events.programs.errors.deadlineAfterStart',
      });
    }
  });

export type SpecialProgramFormValues = z.infer<typeof specialProgramFormSchema>;

export const recurringBatchFormSchema = z
  .object({
    areaId: baseProgramFields.areaId,
    name: baseProgramFields.name,
    description: baseProgramFields.description,
    coverImageUrl: baseProgramFields.coverImageUrl,
    fromDate: z.string().regex(calendarDatePattern, 'events.programs.errors.dateRequired'),
    toDate: z.string().regex(calendarDatePattern, 'events.programs.errors.dateRequired'),
    weekdays: z.array(z.enum(weekdays)).min(1, 'events.programs.errors.weekdaysRequired'),
    startTime: baseProgramFields.startTime,
    endTime: baseProgramFields.endTime,
  })
  .superRefine((values, ctx) => {
    if (values.startTime >= values.endTime) {
      ctx.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'events.programs.errors.endBeforeStart',
      });
    }
    if (values.fromDate > values.toDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['toDate'],
        message: 'events.programs.errors.dateRangeInvalid',
      });
      return;
    }
    const days = (Date.parse(values.toDate) - Date.parse(values.fromDate)) / 86_400_000;
    if (days >= MAX_RECURRENCE_DAYS) {
      ctx.addIssue({
        code: 'custom',
        path: ['toDate'],
        message: 'events.programs.errors.dateRangeTooLong',
      });
    }
  });

export type RecurringBatchFormValues = z.infer<typeof recurringBatchFormSchema>;

export function formatProgramCode(id: number): string {
  return 'SK' + String(id).padStart(3, '0');
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

export function toVietnamIso(date: string, time: string): string {
  return `${date}T${time}:00${VIETNAM_OFFSET}`;
}

export function toVietnamDateAndTime(iso: string): { date: string; time: string } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  );
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${hour}:${parts.minute}`,
  };
}

export function formatVietnamDateTime(iso: string): string {
  const { date, time } = toVietnamDateAndTime(iso);
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time}`;
}

export function formatVietnamTime(iso: string): string {
  return toVietnamDateAndTime(iso).time;
}

export function getProgramDisplayState(
  program: Pick<Program, 'status' | 'startsAt' | 'endsAt'>,
  now: Date = new Date(),
): ProgramDisplayState {
  if (program.status === 'DRAFT') return 'DRAFT';
  if (program.status === 'CANCELLED') return 'CANCELLED';
  const nowMs = now.getTime();
  const startMs = Date.parse(program.startsAt);
  const endMs = Date.parse(program.endsAt);
  if (nowMs < startMs) return 'UPCOMING';
  if (nowMs < endMs) return 'ONGOING';
  return 'ENDED';
}

export function canEditOrDeleteDraft(
  program: Pick<Program, 'status' | 'publishedScheduleVersionId'>,
): boolean {
  return program.status === 'DRAFT' && program.publishedScheduleVersionId === null;
}

function normalizeCoverUrl(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export type EditableProgramSnapshot = {
  areaId: number;
  name: string;
  description: string;
  coverImageUrl: string | null;
  startsAt: string;
  endsAt: string;
  specialEvent?: {
    capacityLimit: number;
    surchargePerPerson: number;
    registrationDeadline: string;
    cancellationDeadline: string;
    holdMinutes: number;
  };
};

export function toCreateSpecialProgramPayload(values: SpecialProgramFormValues) {
  return {
    areaId: values.areaId,
    name: values.name.trim(),
    description: values.description.trim(),
    coverImageUrl: normalizeCoverUrl(values.coverImageUrl),
    kind: 'SPECIAL' as const,
    startsAt: toVietnamIso(values.eventDate, values.startTime),
    endsAt: toVietnamIso(values.eventDate, values.endTime),
    specialEvent: {
      capacityLimit: values.capacityLimit,
      surchargePerPerson: values.surchargePerPerson,
      registrationDeadline: toVietnamIso(
        values.registrationDeadlineDate,
        values.registrationDeadlineTime,
      ),
      cancellationDeadline: toVietnamIso(
        values.cancellationDeadlineDate,
        values.cancellationDeadlineTime,
      ),
      holdMinutes: values.holdMinutes,
    },
  };
}

export function toEditableSnapshotFromSpecial(
  values: SpecialProgramFormValues,
): EditableProgramSnapshot {
  const payload = toCreateSpecialProgramPayload(values);
  return {
    areaId: payload.areaId,
    name: payload.name,
    description: payload.description,
    coverImageUrl: payload.coverImageUrl,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    specialEvent: payload.specialEvent,
  };
}

export function toEditableSnapshotFromRecurring(
  values: RecurringProgramEditValues,
): EditableProgramSnapshot {
  return {
    areaId: values.areaId,
    name: values.name.trim(),
    description: values.description.trim(),
    coverImageUrl: normalizeCoverUrl(values.coverImageUrl),
    startsAt: toVietnamIso(values.eventDate, values.startTime),
    endsAt: toVietnamIso(values.eventDate, values.endTime),
  };
}

export function programToSpecialFormValues(program: Program): SpecialProgramFormValues {
  const start = toVietnamDateAndTime(program.startsAt);
  const end = toVietnamDateAndTime(program.endsAt);
  const reg = program.specialEvent
    ? toVietnamDateAndTime(program.specialEvent.registrationDeadline)
    : start;
  const cancel = program.specialEvent
    ? toVietnamDateAndTime(program.specialEvent.cancellationDeadline)
    : start;
  return {
    areaId: program.areaId,
    name: program.name,
    description: program.description ?? '',
    coverImageUrl: program.coverImageUrl ?? '',
    eventDate: start.date,
    startTime: start.time,
    endTime: end.time,
    capacityLimit: program.specialEvent?.capacityLimit ?? 30,
    surchargePerPerson: program.specialEvent?.surchargePerPerson ?? 0,
    registrationDeadlineDate: reg.date,
    registrationDeadlineTime: reg.time,
    cancellationDeadlineDate: cancel.date,
    cancellationDeadlineTime: cancel.time,
    holdMinutes: program.specialEvent?.holdMinutes ?? DEFAULT_HOLD_MINUTES,
  };
}

export function programToRecurringFormValues(program: Program): RecurringProgramEditValues {
  const start = toVietnamDateAndTime(program.startsAt);
  const end = toVietnamDateAndTime(program.endsAt);
  return {
    areaId: program.areaId,
    name: program.name,
    description: program.description ?? '',
    coverImageUrl: program.coverImageUrl ?? '',
    eventDate: start.date,
    startTime: start.time,
    endTime: end.time,
  };
}

/**
 * Builds a minimal PATCH payload with required `revision` and only changed fields.
 * Returns null if no editable fields differ from baseline.
 */
export function buildProgramPatchPayload(
  baseline: EditableProgramSnapshot,
  next: EditableProgramSnapshot,
  revision: number,
): (Partial<EditableProgramSnapshot> & { revision: number }) | null {
  const patch: Partial<EditableProgramSnapshot> = {};

  if (next.areaId !== baseline.areaId) patch.areaId = next.areaId;
  if (next.name !== baseline.name) patch.name = next.name;
  if (next.description !== baseline.description) patch.description = next.description;
  if (next.coverImageUrl !== baseline.coverImageUrl) patch.coverImageUrl = next.coverImageUrl;
  if (Date.parse(next.startsAt) !== Date.parse(baseline.startsAt)) patch.startsAt = next.startsAt;
  if (Date.parse(next.endsAt) !== Date.parse(baseline.endsAt)) patch.endsAt = next.endsAt;

  if (next.specialEvent && baseline.specialEvent) {
    const changed =
      next.specialEvent.capacityLimit !== baseline.specialEvent.capacityLimit ||
      next.specialEvent.surchargePerPerson !== baseline.specialEvent.surchargePerPerson ||
      Date.parse(next.specialEvent.registrationDeadline) !==
        Date.parse(baseline.specialEvent.registrationDeadline) ||
      Date.parse(next.specialEvent.cancellationDeadline) !==
        Date.parse(baseline.specialEvent.cancellationDeadline) ||
      next.specialEvent.holdMinutes !== baseline.specialEvent.holdMinutes;
    if (changed) patch.specialEvent = next.specialEvent;
  }

  if (Object.keys(patch).length === 0) return null;
  return { revision, ...patch };
}

export function toRecurringBatchInput(values: RecurringBatchFormValues) {
  return {
    areaId: values.areaId,
    name: values.name.trim(),
    description: values.description.trim(),
    coverImageUrl: normalizeCoverUrl(values.coverImageUrl),
    fromDate: values.fromDate,
    toDate: values.toDate,
    weekdays: values.weekdays,
    startTime: values.startTime,
    endTime: values.endTime,
  };
}
