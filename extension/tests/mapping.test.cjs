const { test } = require('node:test');
const assert = require('node:assert/strict');
const mapping = require('../mapping.js');
const profile = { name: 'Asha Example', email: 'asha@example.invalid', phone: '+91 99999 00000', address: '12 Sample Road, Mysuru' };
const fields = [
  { selector: '#name', label: 'Name', type: 'text', currentValue: '', maxLength: 200, options: [] },
  { selector: '#city', label: 'City', type: 'select-one', currentValue: '', options: [{ value: 'Mysuru', label: 'Mysuru' }] },
  { selector: '#upload', label: 'Resume', type: 'file', currentValue: '', options: [] }
];
const item = (extra = {}) => ({ selector: '#name', value: 'Asha Example', source: 'name', confidence: 'high', reason: 'Full name supplied.', ...extra });
const file = { name: 'resume.txt', type: 'text/plain', size: 4, data: 'dGVzdA==' };

test('validates blank optional data, email and profile bounds', () => {
  assert.deepEqual(mapping.validateProfile(profile), profile);
  assert.throws(() => mapping.validateProfile({ ...profile, email: 'bad' }));
  assert.throws(() => mapping.validateProfile({ ...profile, name: 'a'.repeat(201) }));
});

test('allows only literal personal data and phone punctuation, never inventions', () => {
  assert.equal(mapping.isGrounded('Asha', 'name', profile), true);
  assert.equal(mapping.isGrounded('sha', 'name', profile), false);
  assert.equal(mapping.isGrounded('Mysuru', 'address', profile), true);
  assert.equal(mapping.isGrounded('India', 'address', profile), false);
  assert.equal(mapping.isGrounded('+919999900000', 'phone', profile), true);
  assert.equal(mapping.isGrounded('+919999900001', 'phone', profile), false);
  assert.equal(mapping.isGrounded('different@example.invalid', 'email', profile), false);
});

test('validated AI output is review data, uncertain/overwrite/file rows are not preselected', () => {
  const result = mapping.validatePlan({ mappings: [item()] }, fields, profile, null);
  assert.equal(result[0].selected, true);
  const medium = mapping.validatePlan({ mappings: [item({ confidence: 'medium' })] }, fields, profile, null);
  assert.equal(medium[0].selected, false);
  const existing = mapping.validatePlan({ mappings: [item()] }, [{ ...fields[0], currentValue: 'Existing' }], profile, null);
  assert.equal(existing[0].selected, false);
  const upload = mapping.validatePlan({ mappings: [item({ selector: '#upload', value: '__ATTACH_FILE__', source: 'file' })] }, fields, profile, file);
  assert.equal(upload[0].selected, false);
});

test('rejects unknown or duplicate selectors, fabricated values and confidence', () => {
  for (const bad of [item({ selector: 'body' }), item({ value: 'Invented User' }), item({ confidence: 'sure' }), item({ source: 'password' }), item({ value: '__ATTACH_FILE__', source: 'file' })]) {
    assert.throws(() => mapping.validatePlan({ mappings: [bad] }, fields, profile, file));
  }
  assert.throws(() => mapping.validatePlan({ mappings: [item(), item()] }, fields, profile, file));
  assert.throws(() => mapping.validatePlan({ mappings: [item({ selector: '#city', value: 'Bengaluru', source: 'address' })] }, fields, profile, null));
});

test('validates file type, extension, size and actual base64 bytes', () => {
  assert.deepEqual(mapping.validateFile(file), file);
  for (const invalid of [{ ...file, size: 6 }, { ...file, name: '../resume.txt' }, { ...file, name: 'file.exe' }, { ...file, type: 'text/html' }, { ...file, data: '!!!!' }, { ...file, size: 0 }, { ...file, size: 2097153 }]) assert.throws(() => mapping.validateFile(invalid));
});

test('review edits must target approved selectors and valid options', () => {
  const plan = mapping.validatePlan({ mappings: [item()] }, fields, profile, null);
  assert.deepEqual(mapping.validateEntries([{ selector: '#name', value: 'Reviewed name' }], plan), [{ selector: '#name', value: 'Reviewed name' }]);
  assert.throws(() => mapping.validateEntries([{ selector: 'button[type=submit]', value: 'go' }], plan));
  assert.throws(() => mapping.validateEntries([], plan));
  assert.throws(() => mapping.validateEntries([{ selector: '#name', value: 'A' }, { selector: '#name', value: 'B' }], plan));
});
