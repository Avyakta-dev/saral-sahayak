const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const privacy = require('../privacy/vault.js');
const { Vault } = privacy;
const binding = () => ({ origin: 'https://example.invalid', tabId: 1, frameId: 0, documentId: 'doc-1', pageVersion: 'generation-1' });
const entry = (extra = {}) => ({ slot: 'field-1', label: 'applicant name', value: 'Synthetic Person', ...extra });
const artifact = () => ({ artifactDigest: 'a'.repeat(64), payloadRevision: 0 });
const tokenPattern = /^\[\[SSP_[0-9A-F]{32}\]\]$/;
function harness(random) {
  let now = 0, sequence = 0;
  const vault = privacy.create({ clock: () => now, random: random || (bytes => {
    bytes.fill(0); new DataView(bytes.buffer).setUint32(12, ++sequence); return bytes;
  }) });
  return { vault, time: value => { now = value; } };
}
function rejected(vault, operation) {
  assert.throws(operation, error => error.message === 'VAULT_INVALIDATED' && !error.cause);
  assert.throws(() => vault.snapshot(binding()), /^Error: VAULT_INVALIDATED$/);
}

test('exports a private class and factory in CommonJS and classic script contexts', () => {
  assert.deepEqual(Object.keys(privacy).sort(), ['Vault', 'create']);
  assert.ok(Vault.create() instanceof Vault);
  const source = fs.readFileSync(require.resolve('../privacy/vault.js'), 'utf8');
  const context = vm.createContext({ URL, performance: { now: () => 0 }, crypto: {
    getRandomValues(bytes) { assert.equal(this, context.crypto); bytes.fill(1); return bytes; }
  } });
  for (const key of ['fetch', 'chrome', 'localStorage', 'indexedDB', 'XMLHttpRequest']) {
    Object.defineProperty(context, key, { get() { throw new Error('Forbidden side effect'); } });
  }
  vm.runInContext(source, context);
  assert.equal(typeof context.PrivacyVault.Vault, 'function');
  const result = vm.runInContext(`new PrivacyVault.Vault().begin({origin:'https://example.invalid',tabId:1,frameId:0,documentId:'doc-1',pageVersion:'gen-1'})`, context);
  assert.equal(result.expiresAt, 120000);
  assert.match(result.requestId, /^[0-9A-F]{32}$/);
});

test('complete local lifecycle returns only fixed masked metadata', () => {
  const { vault, time } = harness();
  assert.deepEqual(Reflect.ownKeys(vault), []);
  assert.equal(JSON.stringify(vault), '{}');
  const context = vault.begin(binding());
  assert.equal(context.expiresAt, 120000);
  assert.equal(vault.snapshot(binding()).stage, 'begun');
  time(100);
  const snapshot = vault.approve([entry(), entry({ slot: 'field-2', label: 'contact phone', value: '' })], binding());
  assert.deepEqual(Object.keys(snapshot).sort(), ['remainingMs', 'requestId', 'slots', 'stage']);
  assert.equal(snapshot.remainingMs, 119900);
  assert.equal(snapshot.stage, 'approved');
  assert.equal(snapshot.slots[0].filled, true);
  assert.equal(snapshot.slots[1].filled, false);
  for (const slot of snapshot.slots) {
    assert.deepEqual(Object.keys(slot).sort(), ['filled', 'label', 'mask', 'slot', 'token']);
    assert.equal(slot.mask, '***'); assert.match(slot.token, tokenPattern);
    assert.notEqual(slot.token.slice(6, -2), context.requestId);
  }
  const tag = vault.seal(artifact(), binding());
  assert.match(tag, /^[0-9A-F]{32}$/);
  assert.equal(vault.snapshot(binding()).stage, 'sealed');
  assert.equal(vault.markReviewed(tag, binding()).stage, 'reviewed');
  time(1000);
  assert.equal(vault.snapshot(binding()).remainingMs, 119000);
  assert.ok(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.slots[0]));
  assert.equal(JSON.stringify(snapshot).includes('Synthetic Person'), false);
  assert.deepEqual(vault.cancel('private reason never retained'), { stage: 'invalid', error: 'VAULT_INVALIDATED' });
  rejected(vault, () => vault.markReviewed(tag, binding()));
});

test('empty, missing and reviewed requests inherit the absolute deadline', () => {
  for (const mode of ['begun', 'empty', 'missing', 'reviewed']) {
    const { vault, time } = harness();
    vault.begin(binding());
    time(119999);
    if (mode !== 'begun') vault.approve(mode === 'missing' ? [entry({ value: '' })] : [], binding());
    if (mode === 'reviewed') vault.markReviewed(vault.seal(artifact(), binding()), binding());
    assert.equal(vault.snapshot(binding()).remainingMs, 1);
    time(120000);
    rejected(vault, () => vault.snapshot(binding()));
  }
});

test('expiry is checked before argument inspection or value access', () => {
  const { vault, time } = harness(); let inspected = false;
  vault.begin(binding()); time(120000);
  const hostile = new Proxy({}, { getPrototypeOf() { inspected = true; throw Error('private'); } });
  rejected(vault, () => vault.approve(hostile, hostile));
  assert.equal(inspected, false);
});

test('clock rollback, invalid clocks and expiry during randomness fail closed', () => {
  for (const bad of [-1, NaN, Infinity, '10', 9]) {
    const { vault, time } = harness(); time(10); vault.begin(binding()); time(bad);
    rejected(vault, () => vault.approve([entry()], binding()));
  }
  let now = 0;
  const vault = new Vault({ clock: () => now, random: bytes => { now = 120000; bytes.fill(1); return bytes; } });
  rejected(vault, () => vault.begin(binding()));
});

test('every exact binding component is mandatory and mismatches destroy consent', () => {
  const changes = { origin: 'https://example.invalid:444', tabId: 2, frameId: 1, documentId: 'doc-2', pageVersion: 'generation-2' };
  for (const [key, value] of Object.entries(changes)) {
    for (const method of ['approve', 'snapshot', 'seal', 'markReviewed']) {
      const { vault } = harness(); vault.begin(binding());
      if (['seal', 'markReviewed'].includes(method)) vault.approve([], binding());
      const tag = method === 'markReviewed' ? vault.seal(artifact(), binding()) : null;
      const changed = { ...binding(), [key]: value };
      const args = { approve: [[], changed], snapshot: [changed], seal: [artifact(), changed], markReviewed: [tag, changed] };
      rejected(vault, () => vault[method](...args[method]));
    }
    const { vault } = harness(); const missing = binding(); delete missing[key];
    vault.begin(binding()); rejected(vault, () => vault.snapshot(missing));
  }
});

test('binding validation rejects unknown props, URLs, bad types and inherited data', () => {
  const invalid = [null, [], { ...binding(), extra: true }, Object.create(binding()),
    ...['null', 'file:///tmp', 'https://example.invalid/', 'https://user:pass@example.invalid', 'https://EXAMPLE.invalid'].map(origin => ({ ...binding(), origin })),
    ...[-1, 1.5, '1', NaN].map(tabId => ({ ...binding(), tabId })),
    ...['', 'private value', null, {}].map(pageVersion => ({ ...binding(), pageVersion })),
    { ...binding(), documentId: '' }, { ...binding(), [Symbol('hidden')]: true }];
  for (const bad of invalid) { const { vault } = harness(); rejected(vault, () => vault.begin(bad)); }
});

test('strict value schema refuses prohibited labels, selectors, extras and coercions', () => {
  const invalid = [null, {}, new Array(1), [entry(), entry()],
    ...['password', 'OTP', 'UAN', 'Aadhaar', 'PAN', 'bank account', 'claim ID', 'api key', 'toString', 'Applicant name'].map(label => [entry({ label })]),
    ...['#name', 'applicant-name', 'field-', 'field-12345678901'].map(slot => [entry({ slot })]),
    ...[null, undefined, 1, {}, ['private']].map(value => [entry({ value })]),
    [entry({ extra: 'private' })], [entry({ [Symbol('private')]: true })]];
  const accessor = entry(); let read = false;
  Object.defineProperty(accessor, 'value', { get() { read = true; return 'private'; } });
  invalid.push([accessor]);
  const array = [entry()]; array.extra = true; invalid.push(array);
  for (const bad of invalid) {
    const { vault } = harness(); vault.begin(binding()); rejected(vault, () => vault.approve(bad, binding()));
  }
  assert.equal(read, false);
});

test('all four limits count Unicode code points and never truncate originals', () => {
  for (const [label, limit] of Object.entries({ 'applicant name': 200, 'contact email': 254, 'contact phone': 60, 'postal address': 1000 })) {
    for (const unit of ['x', '\u{1F9EA}']) {
      const { vault } = harness(); vault.begin(binding());
      assert.equal(vault.approve([entry({ label, value: unit.repeat(limit) })], binding()).slots[0].filled, true);
      vault.begin(binding());
      rejected(vault, () => vault.approve([entry({ label, value: unit.repeat(limit + 1) })], binding()));
    }
  }
});

test('20 slots allowed including duplicate values and labels, but not duplicate IDs', () => {
  const { vault } = harness(); vault.begin(binding());
  const entries = Array.from({ length: 20 }, (_, i) => entry({ slot: `field-${i}` }));
  const snapshot = vault.approve(entries, binding());
  assert.equal(new Set(snapshot.slots.map(slot => slot.token)).size, 20);
  vault.begin(binding()); rejected(vault, () => vault.approve([...entries, entry({ slot: 'field-20' })], binding()));
});

test('random failures, nonce/token/tag collisions and cross-request reuse fail closed', () => {
  for (const random of [() => { throw Error('private callback error'); }, bytes => bytes, bytes => new Uint8Array(16)]) {
    const { vault } = harness(random); rejected(vault, () => vault.begin(binding()));
  }
  for (const sequence of [[1, 1], [1, 2, 2], [1, 2, 1], [1, 2, 3, 1]]) {
    const { vault } = harness(bytes => { bytes.fill(sequence.shift()); return bytes; });
    vault.begin(binding());
    if (sequence.length === 1) rejected(vault, () => vault.approve([entry()], binding()));
    else if (sequence.length === 2) rejected(vault, () => vault.approve([entry(), entry({ slot: 'field-2' })], binding()));
    else {
      vault.approve([entry()], binding()); vault.seal(artifact(), binding());
      rejected(vault, () => vault.begin(binding()));
    }
  }
  const { vault } = harness(bytes => { bytes.fill(1); return bytes; });
  vault.begin(binding()); vault.cancel(); rejected(vault, () => vault.begin(binding()));
});

test('supersession replaces tokens and old tags never authorize the new request', () => {
  const { vault } = harness(); const first = vault.begin(binding());
  const old = vault.approve([entry()], binding()); const tag = vault.seal(artifact(), binding());
  const second = vault.begin(binding()); const current = vault.approve([entry()], binding());
  assert.notEqual(first.requestId, second.requestId);
  assert.notEqual(old.slots[0].token, current.slots[0].token);
  vault.seal(artifact(), binding()); rejected(vault, () => vault.markReviewed(tag, binding()));
  rejected(new Vault(), () => new Vault().snapshot(binding()));
});

test('immutable approval requires ordered transitions, exact tag and strict artifact', () => {
  const badArtifacts = [null, artifact().artifactDigest, { ...artifact(), extra: true },
    { ...artifact(), artifactDigest: 'private' }, { ...artifact(), payloadRevision: -1 }];
  for (const bad of badArtifacts) {
    const { vault } = harness(); vault.begin(binding()); vault.approve([], binding());
    rejected(vault, () => vault.seal(bad, binding()));
  }
  for (const operation of ['earlySeal', 'earlyReview', 'doubleApprove', 'doubleSeal', 'doubleReview', 'badTag']) {
    const { vault } = harness(); vault.begin(binding());
    if (operation === 'earlySeal') { rejected(vault, () => vault.seal(artifact(), binding())); continue; }
    if (operation === 'earlyReview') { rejected(vault, () => vault.markReviewed('private', binding())); continue; }
    vault.approve([], binding());
    if (operation === 'doubleApprove') { rejected(vault, () => vault.approve([], binding())); continue; }
    const tag = vault.seal(artifact(), binding());
    if (operation === 'doubleSeal') rejected(vault, () => vault.seal(artifact(), binding()));
    if (operation === 'badTag') rejected(vault, () => vault.markReviewed({}, binding()));
    if (operation === 'doubleReview') { vault.markReviewed(tag, binding()); rejected(vault, () => vault.markReviewed(tag, binding())); }
  }
});

test('private fragments, HTML and token-like literals are never exported or interpreted', () => {
  for (const value of ['Q', 'SecretFirstMiddleLast', '\u{1F9EA}e\u0301', '<img src=x onerror=alert(1)>', '[[SSP_' + 'F'.repeat(32) + ']]']) {
    const { vault } = harness(); vault.begin(binding());
    const snapshot = vault.approve([entry({ value })], binding());
    assert.equal(snapshot.slots[0].mask, '***');
    assert.equal(JSON.stringify(snapshot).includes(value), false);
    assert.equal(JSON.stringify(vault), '{}');
    for (const method of ['restore', 'read', 'getValue', 'export', 'send']) assert.equal(vault[method], undefined);
  }
});

test('input mutation cannot alter binding, approved slots or sealed digest', () => {
  const { vault } = harness(); const supplied = binding(); vault.begin(supplied); supplied.tabId = 99;
  const values = [entry()]; vault.approve(values, binding()); values[0].slot = 'field-99'; values[0].value = '';
  const seal = artifact(); const tag = vault.seal(seal, binding()); seal.artifactDigest = 'private';
  assert.equal(vault.markReviewed(tag, binding()).slots[0].slot, 'field-1');
  assert.equal(vault.snapshot(binding()).slots[0].filled, true);
  vault.cancel({ toString() { throw Error('must not inspect'); } });
  rejected(vault, () => vault.snapshot(binding()));
});

test('reentrant cancellation and callback exceptions cannot resurrect state', () => {
  let vault;
  vault = new Vault({ clock: () => 0, random: bytes => { vault.cancel(); bytes.fill(1); return bytes; } });
  rejected(vault, () => vault.begin(binding()));
  vault = new Vault({ clock: () => { throw Error('private'); } });
  rejected(vault, () => vault.begin(binding()));
  assert.throws(() => new Vault({ extra: 'private' }), /^Error: VAULT_INVALIDATED$/);
});

test('restoreLocal exports values once after review and blocks early consumeFill', () => {
  const { vault } = harness();
  vault.begin(binding());
  vault.approve([entry()], binding());
  assert.throws(() => vault.restoreLocal(binding()), /VAULT_INVALIDATED/);
  const { vault: early } = harness();
  early.begin(binding());
  early.approve([entry()], binding());
  early.markReviewed(early.seal(artifact(), binding()), binding());
  assert.throws(() => early.consumeFill(['field-1'], binding()), /VAULT_INVALIDATED/);
  const { vault: ready } = harness();
  ready.begin(binding());
  ready.approve([entry(), entry({ slot: 'field-2', label: 'contact phone', value: '' })], binding());
  ready.markReviewed(ready.seal(artifact(), binding()), binding());
  const restored = ready.restoreLocal(binding());
  assert.equal(restored.stage, 'restored');
  assert.equal(restored.slots[0].value, 'Synthetic Person');
  assert.equal(restored.slots[1].value, null);
  assert.equal(ready.snapshot(binding()).stage, 'restored');
  assert.throws(() => ready.restoreLocal(binding()), /VAULT_INVALIDATED/);
});

test('consumeFill releases selected filled slots once and blocks empty or duplicate selection', () => {
  const { vault } = harness();
  vault.begin(binding());
  vault.approve([
    entry(),
    entry({ slot: 'field-2', label: 'contact email', value: 'person@example.invalid' }),
    entry({ slot: 'field-3', label: 'contact phone', value: '' })
  ], binding());
  vault.markReviewed(vault.seal(artifact(), binding()), binding());
  vault.restoreLocal(binding());
  assert.throws(() => vault.consumeFill([], binding()), /VAULT_INVALIDATED/);
  const { vault: vault2 } = harness();
  vault2.begin(binding());
  vault2.approve([
    entry(),
    entry({ slot: 'field-2', label: 'contact email', value: 'person@example.invalid' }),
    entry({ slot: 'field-3', label: 'contact phone', value: '' })
  ], binding());
  vault2.markReviewed(vault2.seal(artifact(), binding()), binding());
  vault2.restoreLocal(binding());
  assert.throws(() => vault2.consumeFill(['field-1', 'field-1'], binding()), /VAULT_INVALIDATED/);
  const { vault: vault3 } = harness();
  vault3.begin(binding());
  vault3.approve([
    entry(),
    entry({ slot: 'field-2', label: 'contact email', value: 'person@example.invalid' }),
    entry({ slot: 'field-3', label: 'contact phone', value: '' })
  ], binding());
  vault3.markReviewed(vault3.seal(artifact(), binding()), binding());
  vault3.restoreLocal(binding());
  assert.throws(() => vault3.consumeFill(['field-3'], binding()), /VAULT_INVALIDATED/);
  const { vault: vault4 } = harness();
  vault4.begin(binding());
  vault4.approve([
    entry(),
    entry({ slot: 'field-2', label: 'contact email', value: 'person@example.invalid' })
  ], binding());
  vault4.markReviewed(vault4.seal(artifact(), binding()), binding());
  vault4.restoreLocal(binding());
  const released = vault4.consumeFill(['field-2', 'field-1'], binding());
  assert.deepEqual(released.map(item => item.slot), ['field-2', 'field-1']);
  assert.equal(released[0].value, 'person@example.invalid');
  assert.throws(() => vault4.snapshot(binding()), /VAULT_INVALIDATED/);
});
