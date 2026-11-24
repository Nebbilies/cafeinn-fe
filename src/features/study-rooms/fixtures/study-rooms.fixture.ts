import type { StudyRoom } from '../types/study-room.types.ts';

// Design fixture "Dữ liệu mẫu · AD04" (Figma 8900:999), used until the study-room API exists.
// Amenities and usage history are illustrative; they only drive the UI states from the design.
const names = ['Phòng Mộc', 'Phòng Lá', 'Phòng Nắng', 'Phòng Gió', 'Phòng Trúc', 'Phòng Mây'];
const capacities = [6, 4, 8];
const hourlyRates = [80_000, 60_000, 100_000];
const amenities = ['Bảng viết · Wi-Fi · Điều hòa', 'Bảng viết · Wi-Fi', 'Máy chiếu · Bảng viết · Wi-Fi · Điều hòa'];
const maintenanceCodes = new Set(['P03', 'P10', 'P17', 'P24']);
const unusedCodes = new Set(['P10']);

export const studyRoomFixtures: StudyRoom[] = Array.from({ length: 24 }, (_, index) => {
  const number = index + 1;
  const code = `P${String(number).padStart(2, '0')}`;
  return {
    id: number,
    code,
    name: index < names.length ? names[index] : `${names[index % names.length]} ${number}`,
    capacity: capacities[index % 3],
    hourlyRate: hourlyRates[index % 3],
    amenities: amenities[index % 3],
    status: maintenanceCodes.has(code) ? 'MAINTENANCE' : 'ACTIVE',
    hasUsageHistory: !unusedCodes.has(code),
  };
});
