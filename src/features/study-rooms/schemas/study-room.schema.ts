import { z } from 'zod';

// Client-side checks for the form only; limits follow the backend schema
// (name VARCHAR(50), capacity UNSIGNED TINYINT, hourly rate UNSIGNED INT).
// The backend remains the authority once the API exists.
// Messages are translation keys under `studyRooms.errors`.
export const studyRoomFormSchema = z.object({
  name: z.string().trim().min(1, { error: 'nameRequired' }).max(50, { error: 'nameTooLong' }),
  capacity: z.number({ error: 'capacityInvalid' }).int({ error: 'capacityInvalid' }).min(1, { error: 'capacityInvalid' }).max(255, { error: 'capacityInvalid' }),
  hourlyRate: z.number({ error: 'hourlyRateInvalid' }).int({ error: 'hourlyRateInvalid' }).min(0, { error: 'hourlyRateInvalid' }).max(4_294_967_295, { error: 'hourlyRateInvalid' }),
  amenities: z.string().trim().max(200, { error: 'amenitiesTooLong' }),
});

export type StudyRoomFormField = keyof z.infer<typeof studyRoomFormSchema>;
export type StudyRoomFormErrors = Partial<Record<StudyRoomFormField, string>>;

export function validateStudyRoomForm(values: Record<StudyRoomFormField, unknown>) {
  const result = studyRoomFormSchema.safeParse(values);
  if (result.success) return { data: result.data, errors: {} as StudyRoomFormErrors };
  const errors: StudyRoomFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as StudyRoomFormField;
    errors[field] ??= issue.message;
  }
  return { data: null, errors };
}
