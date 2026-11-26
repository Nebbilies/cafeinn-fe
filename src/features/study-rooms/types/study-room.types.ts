export const studyRoomStatuses = ['ACTIVE', 'MAINTENANCE'] as const;
export type StudyRoomStatus = (typeof studyRoomStatuses)[number];

/**
 * UI model for a study room. It mirrors the backend `StudyRoom` fields used by the
 * design until the API contract exists. `amenities` comes from the design and has no
 * backend column yet; `hasUsageHistory` stands in for the backend's delete eligibility.
 */
export type StudyRoom = {
  id: number;
  code: string;
  name: string;
  capacity: number;
  hourlyRate: number;
  amenities: string;
  status: StudyRoomStatus;
  hasUsageHistory: boolean;
};

export type StudyRoomInput = Pick<StudyRoom, 'name' | 'capacity' | 'hourlyRate' | 'amenities'>;
