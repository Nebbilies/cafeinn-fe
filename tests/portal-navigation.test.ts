import assert from 'node:assert/strict';
import test from 'node:test';
import { getPortalSection } from '../src/features/portal/portal-navigation.ts';

test('recognizes a known portal destination', () => {
  assert.equal(getPortalSection('/portal/sales')?.slug, 'sales');
});

test('keeps the parent destination active for nested pages and trailing slashes', () => {
  assert.equal(getPortalSection('/portal/study-rooms/room-1')?.slug, 'study-rooms');
  assert.equal(getPortalSection('/portal/events/')?.slug, 'events');
});

test('rejects unknown destinations and prefix collisions', () => {
  for (const path of ['/portal', '/portal/unknown', '/portal/sales-report', '/portal/events-extra', '/other/portal/sales']) {
    assert.equal(getPortalSection(path), undefined, path);
  }
});
