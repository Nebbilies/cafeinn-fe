import assert from 'node:assert/strict';
import test from 'node:test';
import { getAccountInitial } from '../src/features/portal/portal-account.ts';

test('uppercases the first grapheme without losing Vietnamese diacritics', () => {
  assert.equal(getAccountInitial('  đặng Minh'), 'Đ');
  assert.equal(getAccountInitial('a\u0301nh'), 'A\u0301');
  assert.equal(getAccountInitial('👩‍🍳 Linh'), '👩‍🍳');
  assert.equal(getAccountInitial('Minh'), 'M');
  assert.equal(getAccountInitial('  '), '');
});
