'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const slots = require('../privacy/slots.js');

const tokenA = '[[SSP_00000000000000000000000000000001]]';
const tokenB = '[[SSP_00000000000000000000000000000002]]';
const registry = [
  { slot: 'field-1', label: 'applicant name', token: tokenA, filled: true, mask: '***' },
  { slot: 'field-2', label: 'contact phone', token: tokenB, filled: false, mask: '***' }
];
const snapshot = { requestId: '0000000000000000000000000000000A', slots: registry };

test('outbound envelope exposes only tokens, filled flags and safe labels', () => {
  const envelope = slots.outboundEnvelope(snapshot);
  assert.equal(envelope.schema_version, slots.SCHEMA);
  assert.equal(envelope.template_id, slots.TEMPLATE_ID);
  assert.deepEqual(Object.keys(envelope.slots[0]).sort(), ['filled', 'label', 'slot', 'token']);
  assert.equal(JSON.stringify(envelope).includes('Synthetic'), false);
});

test('host echo + validate + one-pass restore rejects forged and misplaced tokens', () => {
  const echo = slots.hostEchoResponse(snapshot);
  const validated = slots.validateSlotResponse(echo, registry);
  const restored = slots.restoreLocal(validated, new Map([[tokenA, 'Synthetic Person']]));
  assert.equal(restored[0].value, 'Synthetic Person');
  assert.equal(restored[1].value, null);
  assert.equal(restored[1].filled, false);

  for (const bad of [
    { ...echo, slots: [{ slot: 'field-1', label: 'applicant name', token: '[[SSP_FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF]]' }, echo.slots[1]] },
    { ...echo, slots: [{ slot: 'field-1', label: 'contact email', token: tokenA }, echo.slots[1]] },
    { ...echo, slots: [{ slot: 'field-1', label: 'applicant name', token: tokenA }, { slot: 'field-2', label: 'contact phone', token: tokenA }] },
    { schema_version: slots.SCHEMA, template_id: slots.TEMPLATE_ID, slots: [{ slot: 'field-1', label: 'applicant name', token: tokenA, extra: true }, echo.slots[1]] },
    { schema_version: slots.SCHEMA, template_id: slots.TEMPLATE_ID, slots: [{ slot: 'field-1', label: 'applicant name', token: 'Synthetic Person' }, echo.slots[1]] }
  ]) {
    assert.throws(() => slots.validateSlotResponse(bad, registry), /SLOT_REJECTED/);
  }
});

test('outbound rejects duplicate identities and value-shaped request IDs', () => {
  for (const entries of [[registry[0], registry[0]], [registry[0], { ...registry[1], token: tokenA }]]) {
    assert.throws(() => slots.outboundEnvelope({ ...snapshot, slots: entries }), /SLOT_REJECTED/);
  }
  assert.throws(() => slots.outboundEnvelope({ ...snapshot, requestId: 'Synthetic private name' }), /SLOT_REJECTED/);
});

test('slot arrays reject accessors without invoking them and reject sparse/extra entries', () => {
  let calls = 0;
  const getterArray = [registry[0]];
  Object.defineProperty(getterArray, '0', { enumerable: true, get() { calls++; return registry[0]; } });
  assert.throws(() => slots.outboundEnvelope({ ...snapshot, slots: getterArray }), /SLOT_REJECTED/);
  assert.equal(calls, 0);
  const sparse = new Array(1);
  const extra = [registry[0]]; extra.secret = 'private';
  for (const entries of [sparse, extra]) assert.throws(() => slots.outboundEnvelope({ ...snapshot, slots: entries }), /SLOT_REJECTED/);
});

test('response validation rejects duplicate registry tokens even for unfilled slots', () => {
  const duplicate = registry.map(item => ({ ...item, filled: false, token: tokenA }));
  const response = { schema_version: slots.SCHEMA, template_id: slots.TEMPLATE_ID,
    slots: duplicate.map(item => ({ slot: item.slot, label: item.label, token: null })) };
  assert.throws(() => slots.validateSlotResponse(response, duplicate), /SLOT_REJECTED/);
});

test('restoration rejects invalid structure before consulting any private values', () => {
  let reads = 0;
  class ObservedMap extends Map { get(key) { reads++; return super.get(key); } }
  const values = new ObservedMap([[tokenA, 'Synthetic Person']]);
  const valid = { slot: 'field-1', label: 'applicant name', token: tokenA };
  for (const invalid of [
    { slot: 'field-2', label: 'password', token: null },
    { slot: 'field-2', label: 'contact phone', token: null, extra: true },
    { ...valid },
    { slot: 'field-2', label: 'contact phone', token: tokenA }
  ]) {
    reads = 0;
    assert.throws(() => slots.restoreLocal([valid, invalid], values), /SLOT_REJECTED/);
    assert.equal(reads, 0);
  }
});

test('literal token-like values are not recursively substituted', () => {
  const echo = slots.hostEchoResponse({
    requestId: snapshot.requestId,
    slots: [{ slot: 'field-1', label: 'applicant name', token: tokenA, filled: true, mask: '***' }]
  });
  const validated = slots.validateSlotResponse(echo, [{ slot: 'field-1', label: 'applicant name', token: tokenA, filled: true, mask: '***' }]);
  const literal = '[[SSP_DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD]]';
  const restored = slots.restoreLocal(validated, new Map([[tokenA, literal]]));
  assert.equal(restored[0].value, literal);
});
