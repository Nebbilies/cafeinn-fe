import test from 'node:test';
import assert from 'node:assert/strict';
import { permittedSections } from '../src/features/portal/portal-navigation.ts';
test('sales precedes events for a multi-role employee', () => {
  assert.deepEqual(
    permittedSections(['events.manage', 'sales.manage']).map((s) => s.slug),
    ['sales', 'preparation', 'study-room-bookings', 'shifts', 'events', 'event-check-in'],
  );
  assert.deepEqual(permittedSections([]), []);
});
