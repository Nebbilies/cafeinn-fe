import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countActiveFilters, emptyStudyRoomFilters, getCapacityOptions, nextStudyRoomCode, paginate, queryStudyRooms,
} from '../src/features/study-rooms/study-room-list.ts';
import { studyRoomFixtures } from '../src/features/study-rooms/fixtures/study-rooms.fixture.ts';
import { validateStudyRoomForm } from '../src/features/study-rooms/schemas/study-room.schema.ts';

const baseQuery = { search: '', filters: emptyStudyRoomFilters, sort: 'code-asc' as const };
const codes = (rooms: { code: string }[]) => rooms.map((room) => room.code);

test('fixtures follow the AD04 design sample', () => {
  assert.equal(studyRoomFixtures.length, 24);
  assert.deepEqual(studyRoomFixtures.slice(0, 3).map(({ code, name, capacity, hourlyRate, status }) => [code, name, capacity, hourlyRate, status]), [
    ['P01', 'Phòng Mộc', 6, 80_000, 'ACTIVE'],
    ['P02', 'Phòng Lá', 4, 60_000, 'ACTIVE'],
    ['P03', 'Phòng Nắng', 8, 100_000, 'MAINTENANCE'],
  ]);
  assert.equal(studyRoomFixtures[9].name, 'Phòng Gió 10');
});

test('searches code and name without case or Vietnamese accents', () => {
  assert.deepEqual(codes(queryStudyRooms(studyRoomFixtures, { ...baseQuery, search: 'phong moc' })), ['P01', 'P07', 'P13', 'P19']);
  assert.deepEqual(codes(queryStudyRooms(studyRoomFixtures, { ...baseQuery, search: ' p1' })).slice(0, 2), ['P10', 'P11']);
  assert.equal(queryStudyRooms(studyRoomFixtures, { ...baseQuery, search: 'ZZZ-000' }).length, 0);
});

test('combines capacity and status filters', () => {
  const result = queryStudyRooms(studyRoomFixtures, { ...baseQuery, filters: { capacity: 6, status: 'ACTIVE' } });
  assert.ok(result.length > 0);
  assert.ok(result.every((room) => room.capacity === 6 && room.status === 'ACTIVE'));
  assert.equal(countActiveFilters({ capacity: 6, status: null }), 1);
  assert.deepEqual(getCapacityOptions(studyRoomFixtures), [4, 6, 8]);
});

test('sorts codes numerically and breaks ties by code', () => {
  const rooms = [{ ...studyRoomFixtures[0], code: 'P10' }, { ...studyRoomFixtures[0], code: 'P9' }];
  assert.deepEqual(codes(queryStudyRooms(rooms, baseQuery)), ['P9', 'P10']);
  assert.deepEqual(codes(queryStudyRooms(rooms, { ...baseQuery, sort: 'code-desc' })), ['P10', 'P9']);
  assert.deepEqual(codes(queryStudyRooms(studyRoomFixtures, { ...baseQuery, sort: 'rate-desc' })).slice(0, 2), ['P03', 'P06']);
});

test('does not mutate the source list', () => {
  const before = codes(studyRoomFixtures);
  queryStudyRooms(studyRoomFixtures, { ...baseQuery, sort: 'code-desc' });
  assert.deepEqual(codes(studyRoomFixtures), before);
});

test('paginates and clamps out-of-range pages', () => {
  assert.deepEqual({ ...paginate(studyRoomFixtures, 3, 10), items: undefined }, { items: undefined, page: 3, pageCount: 3, start: 21, end: 24, total: 24 });
  assert.equal(paginate(studyRoomFixtures, 9, 10).page, 3);
  assert.deepEqual({ ...paginate([], 1, 10), items: undefined }, { items: undefined, page: 1, pageCount: 1, start: 0, end: 0, total: 0 });
});

test('generates the next room code', () => {
  assert.equal(nextStudyRoomCode(studyRoomFixtures), 'P25');
  assert.equal(nextStudyRoomCode([]), 'P01');
});

test('validates the room form against backend column limits', () => {
  const valid = validateStudyRoomForm({ name: '  Phòng Gió ', capacity: 4, hourlyRate: 60_000, amenities: '' });
  assert.deepEqual(valid.data, { name: 'Phòng Gió', capacity: 4, hourlyRate: 60_000, amenities: '' });
  const invalid = validateStudyRoomForm({ name: ' ', capacity: 0, hourlyRate: 1.5, amenities: 'x'.repeat(201) });
  assert.equal(invalid.data, null);
  assert.deepEqual(invalid.errors, { name: 'nameRequired', capacity: 'capacityInvalid', hourlyRate: 'hourlyRateInvalid', amenities: 'amenitiesTooLong' });
  assert.equal(validateStudyRoomForm({ name: 'A', capacity: '', hourlyRate: 1, amenities: '' }).errors.capacity, 'capacityInvalid');
});

test('validates numeric input before blur without treating an empty rate as zero', () => {
  const room = { name: 'Phòng Gió', amenities: '' };
  assert.deepEqual(validateStudyRoomForm({ ...room, capacity: '004', hourlyRate: '000' }).data, {
    ...room, capacity: 4, hourlyRate: 0,
  });
  assert.deepEqual(validateStudyRoomForm({ ...room, capacity: '', hourlyRate: '' }).errors, {
    capacity: 'capacityInvalid', hourlyRate: 'hourlyRateInvalid',
  });
  assert.deepEqual(validateStudyRoomForm({ ...room, capacity: '0256', hourlyRate: '04294967296' }).errors, {
    capacity: 'capacityInvalid', hourlyRate: 'hourlyRateInvalid',
  });
});
