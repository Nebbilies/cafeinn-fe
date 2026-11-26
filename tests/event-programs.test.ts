import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildProgramPatchPayload,
  canEditOrDeleteDraft,
  formatProgramCode,
  getProgramDisplayState,
  programPageSchema,
  programToRecurringFormValues,
  programToSpecialFormValues,
  recurringBatchFormSchema,
  specialProgramFormSchema,
  toCreateSpecialProgramPayload,
  toEditableSnapshotFromRecurring,
  toEditableSnapshotFromSpecial,
  toRecurringBatchInput,
  toVietnamDateAndTime,
  type Program,
} from '../src/features/events/schemas/program.schema.ts';

const sampleSpecialProgram: Program = {
  id: 12,
  areaId: 2,
  name: 'Đêm nhạc Acoustic Mùa Thu',
  description: 'Chương trình âm nhạc trực tiếp cuối tuần.',
  coverImageUrl: 'https://example.com/poster.jpg',
  revision: 3,
  kind: 'SPECIAL',
  startsAt: '2026-12-05T12:30:00.000Z', // 19:30 +07:00
  endsAt: '2026-12-05T14:30:00.000Z', // 21:30 +07:00
  status: 'DRAFT',
  recurringBatchId: null,
  publishedScheduleVersionId: null,
  createdAt: '2026-11-26T10:00:00.000Z',
  updatedAt: '2026-11-26T10:00:00.000Z',
  specialEvent: {
    capacityLimit: 60,
    surchargePerPerson: 80000,
    registrationDeadline: '2026-12-05T11:00:00.000Z', // 18:00 +07:00
    cancellationDeadline: '2026-12-05T10:00:00.000Z', // 17:00 +07:00
    holdMinutes: 30,
    holdUntil: '2026-12-05T13:00:00.000Z',
  },
  bookingAllowed: false,
};

test('formatProgramCode pads IDs with SK prefix and converts Vietnam time accurately', () => {
  assert.equal(formatProgramCode(1), 'SK001');
  assert.equal(formatProgramCode(12), 'SK012');
  assert.equal(formatProgramCode(1234), 'SK1234');

  assert.deepEqual(toVietnamDateAndTime('2026-12-05T12:30:00.000Z'), {
    date: '2026-12-05',
    time: '19:30',
  });
});

test('getProgramDisplayState derives DRAFT, CANCELLED, UPCOMING, ONGOING, and ENDED states', () => {
  const base = {
    startsAt: '2026-12-05T12:30:00.000Z',
    endsAt: '2026-12-05T14:30:00.000Z',
  };
  assert.equal(getProgramDisplayState({ ...base, status: 'DRAFT' }), 'DRAFT');
  assert.equal(getProgramDisplayState({ ...base, status: 'CANCELLED' }), 'CANCELLED');
  assert.equal(
    getProgramDisplayState({ ...base, status: 'PUBLISHED' }, new Date('2026-12-05T12:00:00.000Z')),
    'UPCOMING',
  );
  assert.equal(
    getProgramDisplayState({ ...base, status: 'PUBLISHED' }, new Date('2026-12-05T13:00:00.000Z')),
    'ONGOING',
  );
  assert.equal(
    getProgramDisplayState({ ...base, status: 'PUBLISHED' }, new Date('2026-12-05T14:30:00.000Z')),
    'ENDED',
  );
});

test('specialProgramFormSchema enforces interval, deadline, and cover URL constraints', () => {
  const valid = specialProgramFormSchema.safeParse({
    areaId: 2,
    name: 'Đêm nhạc đặc biệt',
    description: 'Biểu diễn acoustic live',
    coverImageUrl: 'https://example.com/cover.png',
    eventDate: '2026-12-05',
    startTime: '19:30',
    endTime: '21:30',
    capacityLimit: 50,
    surchargePerPerson: 50000,
    registrationDeadlineDate: '2026-12-05',
    registrationDeadlineTime: '18:00',
    cancellationDeadlineDate: '2026-12-05',
    cancellationDeadlineTime: '17:00',
    holdMinutes: 30,
  });
  assert.equal(valid.success, true);

  if (valid.success) {
    const payload = toCreateSpecialProgramPayload(valid.data);
    assert.equal(payload.kind, 'SPECIAL');
    assert.equal(payload.startsAt, '2026-12-05T19:30:00+07:00');
    assert.equal(payload.endsAt, '2026-12-05T21:30:00+07:00');
    assert.equal(payload.specialEvent.registrationDeadline, '2026-12-05T18:00:00+07:00');
  }

  const deadlineAfterStart = specialProgramFormSchema.safeParse({
    areaId: 2,
    name: 'Đêm nhạc',
    description: 'Mô tả',
    coverImageUrl: '',
    eventDate: '2026-12-05',
    startTime: '19:30',
    endTime: '21:30',
    capacityLimit: 50,
    surchargePerPerson: 0,
    registrationDeadlineDate: '2026-12-05',
    registrationDeadlineTime: '20:00',
    cancellationDeadlineDate: '2026-12-05',
    cancellationDeadlineTime: '18:00',
    holdMinutes: 30,
  });
  assert.equal(deadlineAfterStart.success, false);

  const badUrl = specialProgramFormSchema.safeParse({
    areaId: 2,
    name: 'Đêm nhạc',
    description: 'Mô tả',
    coverImageUrl: 'ftp://example.com/file.jpg',
    eventDate: '2026-12-05',
    startTime: '19:30',
    endTime: '21:30',
    capacityLimit: 50,
    surchargePerPerson: 0,
    registrationDeadlineDate: '2026-12-05',
    registrationDeadlineTime: '18:00',
    cancellationDeadlineDate: '2026-12-05',
    cancellationDeadlineTime: '18:00',
    holdMinutes: 30,
  });
  assert.equal(badUrl.success, false);
});

test('buildProgramPatchPayload includes revision and only changed fields', () => {
  const baseline = toEditableSnapshotFromSpecial(programToSpecialFormValues(sampleSpecialProgram));
  assert.equal(buildProgramPatchPayload(baseline, { ...baseline }, 3), null);

  const renamed = toEditableSnapshotFromSpecial({
    ...programToSpecialFormValues(sampleSpecialProgram),
    name: 'Đêm nhạc Acoustic Mùa Đông',
  });
  const patch = buildProgramPatchPayload(baseline, renamed, 3);
  assert.deepEqual(patch, {
    revision: 3,
    name: 'Đêm nhạc Acoustic Mùa Đông',
  });

  const recurring: Program = {
    ...sampleSpecialProgram,
    kind: 'RECURRING',
    specialEvent: null,
  };
  const recBase = toEditableSnapshotFromRecurring(programToRecurringFormValues(recurring));
  const recNext = toEditableSnapshotFromRecurring({
    ...programToRecurringFormValues(recurring),
    description: 'Cập nhật mô tả định kỳ',
  });
  assert.deepEqual(buildProgramPatchPayload(recBase, recNext, 3), {
    revision: 3,
    description: 'Cập nhật mô tả định kỳ',
  });
});

test('recurringBatchFormSchema validates range, weekdays, and builds batch payload', () => {
  const valid = recurringBatchFormSchema.safeParse({
    areaId: 2,
    name: 'Acoustic Thứ 6',
    description: 'Miễn phí hàng tuần',
    coverImageUrl: '',
    fromDate: '2026-12-01',
    toDate: '2026-12-31',
    weekdays: ['FRI', 'SAT'],
    startTime: '19:30',
    endTime: '21:30',
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.deepEqual(toRecurringBatchInput(valid.data), {
      areaId: 2,
      name: 'Acoustic Thứ 6',
      description: 'Miễn phí hàng tuần',
      coverImageUrl: null,
      fromDate: '2026-12-01',
      toDate: '2026-12-31',
      weekdays: ['FRI', 'SAT'],
      startTime: '19:30',
      endTime: '21:30',
    });
  }

  const tooLong = recurringBatchFormSchema.safeParse({
    areaId: 2,
    name: 'Acoustic',
    description: 'Mô tả',
    coverImageUrl: '',
    fromDate: '2026-01-01',
    toDate: '2026-06-01',
    weekdays: ['FRI'],
    startTime: '19:30',
    endTime: '21:30',
  });
  assert.equal(tooLong.success, false);
});

test('canEditOrDeleteDraft and programPageSchema match backend contract', () => {
  assert.equal(canEditOrDeleteDraft({ status: 'DRAFT', publishedScheduleVersionId: null }), true);
  assert.equal(canEditOrDeleteDraft({ status: 'PUBLISHED', publishedScheduleVersionId: 1 }), false);
  assert.equal(canEditOrDeleteDraft({ status: 'CANCELLED', publishedScheduleVersionId: null }), false);

  const parsed = programPageSchema.parse({
    items: [sampleSpecialProgram],
    pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 },
  });
  assert.equal(parsed.items[0]?.id, 12);
});
