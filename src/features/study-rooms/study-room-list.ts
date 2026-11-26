import type { StudyRoom, StudyRoomStatus } from './types/study-room.types.ts';

export const studyRoomSorts = [
  'code-asc', 'code-desc', 'name-asc', 'capacity-asc', 'capacity-desc', 'rate-asc', 'rate-desc',
] as const;
export type StudyRoomSort = (typeof studyRoomSorts)[number];

export const studyRoomPageSizes = [10, 25, 50] as const;
export type StudyRoomPageSize = (typeof studyRoomPageSizes)[number];

export type StudyRoomFilters = { capacity: number | null; status: StudyRoomStatus | null };
export const emptyStudyRoomFilters: StudyRoomFilters = { capacity: null, status: null };

export type StudyRoomQuery = { search: string; filters: StudyRoomFilters; sort: StudyRoomSort };

/** Case- and accent-insensitive text for Vietnamese search ("phong moc" matches "Phòng Mộc"). */
export function normalizeSearchText(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('vi').trim();
}

const collator = new Intl.Collator('vi', { numeric: true, sensitivity: 'base' });

const comparators: Record<StudyRoomSort, (a: StudyRoom, b: StudyRoom) => number> = {
  'code-asc': (a, b) => collator.compare(a.code, b.code),
  'code-desc': (a, b) => collator.compare(b.code, a.code),
  'name-asc': (a, b) => collator.compare(a.name, b.name) || collator.compare(a.code, b.code),
  'capacity-asc': (a, b) => a.capacity - b.capacity || collator.compare(a.code, b.code),
  'capacity-desc': (a, b) => b.capacity - a.capacity || collator.compare(a.code, b.code),
  'rate-asc': (a, b) => a.hourlyRate - b.hourlyRate || collator.compare(a.code, b.code),
  'rate-desc': (a, b) => b.hourlyRate - a.hourlyRate || collator.compare(a.code, b.code),
};

export function queryStudyRooms(rooms: readonly StudyRoom[], { search, filters, sort }: StudyRoomQuery) {
  const term = normalizeSearchText(search);
  return rooms
    .filter((room) => !term || normalizeSearchText(room.code).includes(term) || normalizeSearchText(room.name).includes(term))
    .filter((room) => filters.capacity === null || room.capacity === filters.capacity)
    .filter((room) => filters.status === null || room.status === filters.status)
    .sort(comparators[sort]);
}

export function countActiveFilters(filters: StudyRoomFilters) {
  return Number(filters.capacity !== null) + Number(filters.status !== null);
}

export function getCapacityOptions(rooms: readonly StudyRoom[]) {
  return [...new Set(rooms.map((room) => room.capacity))].sort((a, b) => a - b);
}

export type PageSlice<T> = { items: T[]; page: number; pageCount: number; start: number; end: number; total: number };

/** Returns one page, clamping the requested page into range (an empty list has one empty page). */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): PageSlice<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const offset = (current - 1) * pageSize;
  const pageItems = items.slice(offset, offset + pageSize);
  return { items: pageItems, page: current, pageCount, start: total ? offset + 1 : 0, end: offset + pageItems.length, total };
}

/** Next sequential code in the `P01` format used by the design fixtures. */
export function nextStudyRoomCode(rooms: readonly StudyRoom[]) {
  const highest = rooms.reduce((max, room) => {
    const match = /^P(\d+)$/.exec(room.code);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `P${String(highest + 1).padStart(2, '0')}`;
}
