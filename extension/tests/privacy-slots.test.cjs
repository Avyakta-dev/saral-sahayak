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
