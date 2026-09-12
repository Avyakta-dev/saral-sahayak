'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { initial, transition: step, canAnalyze, localMask, boundary, destinations } = require('./mock.js');
const captured = () => step(initial(), 'capture');
const result = () => step(step(captured(), 'review', true), 'analyze');

test('initial state does not capture, analyze, restore or fill', () => {
  const s = initial();
  assert.equal(canAnalyze(s), false);
  for (const action of ['analyze', 'fill', 'review', 'reveal']) assert.deepEqual(step(s, action, true), s);
});
test('capture, review, Analyze and Fill are distinct user gates', () => {
  let s = captured();
  assert.equal(s.result, false);
  assert.equal(canAnalyze(s), false);
  s = step(s, 'review', true);
  assert.equal(canAnalyze(s), true);
  s = step(s, 'analyze');
  assert.equal(s.result, true);
  assert.equal(step(s, 'fill').filled, false);
  s = step(step(s, 'fill-review', true), 'fill');
  assert.equal(s.filled, true);
  assert.equal(s.fillReview, false);
  assert.deepEqual(step(s, 'fill'), s);
});
test('first/last is opt-in for long fictional non-sensitive category only', () => {
  assert.equal(localMask(captured()), '***');
  assert.equal(localMask(step(captured(), 'reveal', true)), 'P***n');
  for (const category of ['short', 'sensitive', 'unknown']) {
    const s = step(step(captured(), 'category', category), 'reveal', true);
    assert.equal(localMask(s), '***');
    assert.equal(s.reveal, false);
  }
  assert.doesNotMatch(boundary, /Paper Lantern|P\*\*\*n|Mira|length|base64/);
});
test('mask/crop edits revoke approval and result; unknown coverage blocks review', () => {
  for (const treatment of ['mask', 'crop', 'unresolved']) {
    let s = step(result(), 'treatment', treatment);
    assert.equal(s.result, false);
    assert.equal(s.reviewed, false);
    s = step(s, 'review', true);
    assert.equal(canAnalyze(s), treatment !== 'unresolved');
  }
});
test('restricted, unsupported and unknown coverage scenarios block capture', () => {
  for (const scenario of ['restricted', 'unsupported', 'blocked']) {
    const s = step(initial(), 'scenario', scenario);
    assert.equal(step(s, 'capture').captured, false);
    assert.equal(canAnalyze(step(s, 'review', true)), false);
  }
});
test('cancel, expiry, recapture, scenario and mode changes clear downstream state', () => {
  for (const [action, value] of [['cancel'], ['stale'], ['capture'], ['mode', 'local'], ['scenario', 'inaccessible']]) {
    const s = step({ ...result(), reveal: true, fillReview: true, filled: true }, action, value);
    for (const key of ['reveal', 'reviewed', 'result', 'fillReview', 'filled']) assert.equal(s[key], false, `${action}: ${key}`);
  }
});
test('mode disclosure is honest and uses same illustrated model boundary', () => {
  for (const mode of Object.keys(destinations)) {
    const s = step(initial(), 'mode', mode);
    assert.equal(s.mode, mode);
    assert.equal(s.captured, false);
  }
  assert.match(destinations.local, /not inherently private.*forward.*log.*LAN/);
  assert.match(destinations.companion, /Not installed or connected/);
});
test('mock stays outside runtime with no network, storage, permissions or HTML injection', () => {
  const js = readFileSync(join(__dirname, 'mock.js'), 'utf8');
  const html = readFileSync(join(__dirname, 'index.html'), 'utf8');
  const manifest = readFileSync(join(__dirname, '../../../extension/manifest.json'), 'utf8');
  assert.doesNotMatch(js, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|chrome|browser)\s*[.(]|innerHTML|postMessage|require\(/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.doesNotMatch(html, /<form|type="(?:file|password|text)"|(?:src|href)="https?:/);
  assert.doesNotMatch(manifest, /docs\/mocks|privacy-flow/);
  assert.match(html, /No model ran and no response was validated/);
});
