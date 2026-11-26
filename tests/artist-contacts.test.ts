import assert from 'node:assert/strict';
import test from 'node:test';
import {
  artistFormSchema,
  artistPageSchema,
  artistToFormValues,
  buildArtistPatchPayload,
  canDeleteArtist,
  formatArtistCode,
  toArtistPayload,
} from '../src/features/events/schemas/artist.schema.ts';

test('formatArtistCode pads artist IDs with NS prefix', () => {
  assert.equal(formatArtistCode(1), 'NS001');
  assert.equal(formatArtistCode(12), 'NS012');
  assert.equal(formatArtistCode(1234), 'NS1234');
});

test('artistFormSchema validates required fields and rejects invalid email or blank stageName', () => {
  const valid = artistFormSchema.safeParse({
    stageName: 'Ban nhạc Mộc',
    kind: 'BAND',
    email: 'Moc.Band@Example.com',
    phone: '0901234567',
    genre: 'Acoustic',
    notes: 'Chuyên đêm thứ 7',
    status: 'ACTIVE',
  });
  assert.equal(valid.success, true);

  const blankName = artistFormSchema.safeParse({
    stageName: '   ',
    kind: 'SOLO',
    email: 'solo@example.com',
    phone: '',
    genre: '',
    notes: '',
    status: 'ACTIVE',
  });
  assert.equal(blankName.success, false);
  assert.equal(blankName.error.issues[0]?.message, 'events.artists.errors.stageNameRequired');

  const badEmail = artistFormSchema.safeParse({
    stageName: 'Minh Anh',
    kind: 'SOLO',
    email: 'invalid-email',
    phone: '',
    genre: '',
    notes: '',
    status: 'ACTIVE',
  });
  assert.equal(badEmail.success, false);
  assert.equal(badEmail.error.issues[0]?.message, 'events.artists.errors.emailInvalid');
});

test('toArtistPayload normalizes email, trims strings, and turns blank optional fields into null', () => {
  const payload = toArtistPayload({
    stageName: '  Ban nhạc Mộc  ',
    kind: 'BAND',
    email: '  MOC@Example.COM  ',
    phone: '   ',
    genre: ' Acoustic ',
    notes: '',
    status: 'INACTIVE',
  });

  assert.deepEqual(payload, {
    stageName: 'Ban nhạc Mộc',
    kind: 'BAND',
    email: 'moc@example.com',
    phone: null,
    genre: 'Acoustic',
    notes: null,
    status: 'INACTIVE',
  });
});

test('canDeleteArtist respects event history per QD12 and artistPageSchema parses paginated API responses', () => {
  assert.equal(canDeleteArtist({ hasHistory: false }), true);
  assert.equal(canDeleteArtist({ hasHistory: true }), false);

  const parsed = artistPageSchema.parse({
    items: [
      {
        id: 1,
        stageName: 'Ban nhạc Mộc',
        kind: 'BAND',
        email: 'moc@example.com',
        phone: null,
        genre: 'Acoustic',
        notes: null,
        status: 'ACTIVE',
        invitationCount: 2,
        assignmentCount: 1,
        hasHistory: true,
      },
    ],
    pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 },
  });
  assert.equal(parsed.items[0]?.hasHistory, true);
});

test('buildArtistPatchPayload sends only modified fields so concurrent edits to other fields are preserved', () => {
  const baseline = toArtistPayload(
    artistToFormValues({
      id: 7,
      stageName: 'Ban nhạc Mộc',
      kind: 'BAND',
      email: 'moc@example.com',
      phone: '0901234567',
      genre: 'Acoustic',
      notes: 'Ghi chú cũ',
      status: 'ACTIVE',
      invitationCount: 0,
      assignmentCount: 0,
      hasHistory: false,
    }),
  );

  const unchanged = buildArtistPatchPayload(baseline, { ...baseline });
  assert.deepEqual(unchanged, {});

  const notesOnly = buildArtistPatchPayload(
    baseline,
    toArtistPayload({
      stageName: '  Ban nhạc Mộc ',
      kind: 'BAND',
      email: 'MOC@Example.com',
      phone: '0901234567',
      genre: 'Acoustic',
      notes: 'Ghi chú mới',
      status: 'ACTIVE',
    }),
  );
  assert.deepEqual(notesOnly, { notes: 'Ghi chú mới' });
  assert.equal('phone' in notesOnly, false);
});
