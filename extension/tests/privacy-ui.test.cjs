'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Offline UI evidence: unchanged production JS, actual HTML, minimal DOM/Port.
// No browser, worker, PNG decoding, layout, native validity or accessibility proof.
// performance.now is injected; intervals are real and always cleared on teardown.
const source = readFileSync(path.join(__dirname, '../privacy/privacy.js'), 'utf8');
const html = readFileSync(path.join(__dirname, '../privacy/privacy.html'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const nodes = root => [root, ...root.children.flatMap(nodes)];
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
const TAG = 'ABCDEF0123456789ABCDEF0123456789';
const OMIT = 'SYNTHETIC_OMITTED_VALUE';
const RESTORED_NAME = '<img src=x onerror="alert(\'SYNTHETIC_NAME\')">';
const RESTORED_EMAIL = 'synthetic-contact@example.invalid';
const RESTORED_TITLE = '<b>SYNTHETIC_LOCAL_RESTORATION</b>';
const restoration = () => ({ type: 'restored', title: RESTORED_TITLE, remainingMs: 120000, slots: [
  { slot: 'field-a', label: 'applicant name', filled: true, value: RESTORED_NAME, unresolved: false },
  { slot: 'field-b', label: '<b>contact email</b>', filled: true, value: RESTORED_EMAIL, unresolved: false },
  { slot: 'field-c', label: 'address', filled: false, value: null, unresolved: true },
] });
const filled = () => ({ type: 'filled', results: [{ id: 'field-a', status: 'filled', message: 'Field updated.' }],
  warnings: ['Sites may autosave when fields change.'],
  message: 'Fill attempt finished. The extension never clicks Submit. Review the page yourself.' });
const inspection = () => ({ type: 'inspected', cropLimits: { width: 1600, height: 900, dpr: 2 }, candidates: [
  { id: 'field-a', label: 'applicant name', value: OMIT }, { id: 'field-b', label: '<b>contact email</b>', value: OMIT },
] });
const preview = () => ({ type: 'preview', preview: PNG, coverage: 'fully-masked', approvalTag: TAG, remainingMs: 120000,
  slots: [{ label: 'applicant name', filled: true, value: OMIT, token: OMIT, mask: OMIT, id: OMIT },
    { label: '<b>contact email</b>', filled: false }] });
class Target {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }
  dispatchEvent(event) {
    event.target = this; event.defaultPrevented = false;
    event.preventDefault = () => { event.defaultPrevented = true; };
    for (const fn of this.listeners.get(event.type) || []) fn(event);
    return event;
  }
}
class Element extends Target {
  constructor(tag, deny) {
    super(); Object.assign(this, { tagName: tag.toUpperCase(), deny, children: [], attributes: {}, parent: null,
      disabled: false, hidden: false, checked: false, value: '', _text: '', validity: '', onload: null, onerror: null });
  }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this.replaceChildren(); this._text = String(value); }
  append(...children) { for (const child of children) { child.parent = this; this.children.push(child); } }
  replaceChildren(...children) {
    for (const child of this.children) child.parent = null;
    this.children = []; this._text = ''; this.append(...children);
  }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  removeAttribute(key) { delete this.attributes[key]; }
  get src() { return this.getAttribute('src') || ''; }
  set src(value) { this.setAttribute('src', value); }
  get valueAsNumber() { return this.value === '' ? NaN : Number(this.value); }
  setCustomValidity(message) { this.validity = message; }
  reportValidity() {
    return nodes(this).filter(node => node.type === 'number').every(node => !node.validity &&
      Number.isFinite(node.valueAsNumber) && node.valueAsNumber >= Number(node.min) && node.valueAsNumber <= Number(node.max));
  }
  focus() { this.focused = true; }
  set innerHTML(_) { this.deny('innerHTML'); }
  set outerHTML(_) { this.deny('outerHTML'); }
  insertAdjacentHTML() { this.deny('insertAdjacentHTML'); }
}
function portEvent() {
  const listeners = new Set();
  return { listeners, addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn),
    emit: value => { for (const fn of [...listeners]) fn(value); } };
}
function harness(t) {
  let now = 1000, closes = 0, disconnects = 0;
  const calls = [], connections = [], violations = [], timers = new Set(), elements = new Map();
  const deny = name => { violations.push(name); throw new Error(`Forbidden operation: ${name}`); };
  const document = new Target(), window = new Target();
  document.body = new Element('body', deny);
  // Narrow tokenizer for this static body, not a general HTML parser or a synthetic page.
  const stack = [document.body], body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
  for (const part of body.matchAll(/<\/?[a-z][^>]*>|[^<]+/gi)) {
    const token = part[0];
    if (token.startsWith('</')) { assert.equal(stack.pop().tagName, token.slice(2, -1).toUpperCase()); continue; }
    if (!token.startsWith('<')) { stack.at(-1)._text += token; continue; }
    const [, tag, attrs] = token.match(/^<([a-z][\w-]*)\b([^>]*)>/i), node = new Element(tag, deny);
    for (const attr of attrs.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
      const [, key, value = ''] = attr; node.setAttribute(key, value);
      if (['disabled', 'hidden', 'checked', 'required'].includes(key)) node[key] = true;
      else node[key] = value;
    }
    if (node.id) { assert.equal(elements.has(node.id), false); elements.set(node.id, node); }
    stack.at(-1).append(node);
    if (!['input', 'img', 'br', 'hr'].includes(tag)) stack.push(node);
  }
  assert.equal(stack.length, 1);
  document.createElement = tag => new Element(tag, deny);
  document.getElementById = id => nodes(document.body).find(node => node.id === id) || null;
  document.querySelectorAll = selector => {
    assert.equal(selector, 'input'); return nodes(document.body).filter(node => node.tagName === 'INPUT');
  };
  window.close = () => { closes++; };
  const port = { onMessage: portEvent(), onDisconnect: portEvent(),
    postMessage(message) {
      if (!['inspect', 'capture', 'review', 'restore', 'fill', 'cancel'].includes(message.type)) deny('unexpected Port command');
      calls.push(plain(message));
    }, disconnect() { disconnects++; port.onDisconnect.emit(); } };
  const chrome = { runtime: { connect(options) { connections.push(plain(options)); return port; }, lastError: undefined } };
  const sandbox = { document, window, chrome, performance: { now: () => now },
    setInterval(fn, ms) { const timer = setInterval(fn, ms); timers.add(timer); return timer; },
    clearInterval(timer) { clearInterval(timer); timers.delete(timer); } };
  for (const target of [sandbox, window]) for (const key of ['fetch', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB', 'navigator']) {
    Object.defineProperty(target, key, { get: () => deny(key) });
  }
  for (const key of ['storage', 'tabs', 'scripting', 'downloads']) Object.defineProperty(chrome, key, { get: () => deny(`chrome.${key}`) });
  chrome.runtime.sendMessage = () => deny('runtime.sendMessage');
  sandbox.console = Object.fromEntries(['log', 'info', 'warn', 'error', 'debug'].map(key => [key, () => deny(`console.${key}`)]));
  t.after(() => { for (const timer of timers) clearInterval(timer); assert.deepEqual(violations, []); });
  vm.runInNewContext(source, sandbox, { filename: 'privacy.js', timeout: 1000 });
  const get = id => { assert.ok(elements.has(id), `Missing actual HTML id ${id}`); return elements.get(id); };
  return { get, document, window, port, calls, connections, timers, elements,
    get closes() { return closes; }, get disconnects() { return disconnects; },
    advance(ms) { now += ms; }, reply(message) { port.onMessage.emit(message); },
    // Dynamic fill checkboxes have no IDs. Dispatch their real listeners too;
    // checked changes remain explicit, with no emulated application behavior.
    fire(target, type = 'click', forced = false) {
      const node = typeof target === 'string' ? get(target) : target;
      assert.ok(nodes(document.body).includes(node), 'Event target must be attached');
      if (!forced) for (let parent = node; parent; parent = parent.parent) assert.equal(parent.disabled, false, `${node.id || node.tagName} is disabled`);
      assert.ok(node.listeners.get(type)?.length, `Missing production ${type} listener for ${node.id || node.tagName}`);
      return node.dispatchEvent({ type });
    },
  };
}
function inspect(h) { h.reply({ type: 'ready' }); h.fire('inspect'); }
function inspected(h) { inspect(h); h.reply(inspection()); }
function capture(h) { assert.equal(h.fire('crop-form', 'submit').defaultPrevented, true); }
function captured(h) { inspected(h); capture(h); }
function shown(h) { captured(h); h.reply(preview()); }
function checks(h) { return nodes(h.get('fields')).filter(node => node.type === 'checkbox'); }
function fillChecks(h) { return nodes(h.get('fill-fields')).filter(node => node.type === 'checkbox'); }
function changeCheck(h, target, checked) {
  const checkbox = typeof target === 'string' ? h.get(target) : target;
  checkbox.checked = checked; h.fire(checkbox, 'change');
}
function reviewed(h) {
  inspect(h);
  h.reply({ ...inspection(), candidates: restoration().slots.map(slot => ({ id: slot.slot, label: slot.label })) });
  for (const checkbox of checks(h)) checkbox.checked = true;
  capture(h);
  h.reply({ ...preview(), slots: restoration().slots.map(({ label, filled }) => ({ label, filled })) });
  h.get('preview-image').onload(); changeCheck(h, 'review-check', true); h.fire('confirm');
  h.reply({ type: 'reviewed' });
}
function restored(h) { reviewed(h); h.fire('restore'); h.reply(restoration()); }
function noRestoredOutbound(h) {
  const outbound = JSON.stringify(h.calls);
  for (const value of [RESTORED_NAME, RESTORED_EMAIL, RESTORED_TITLE, PNG]) assert.equal(outbound.includes(JSON.stringify(value).slice(1, -1)), false);
  noRaw(h);
}
function restorationScrubbed(h, cancels) {
  scrubbed(h, cancels);
  const dom = JSON.stringify(nodes(h.document.body).map(node => [node._text, node.attributes, node.value]));
  for (const value of [RESTORED_NAME, RESTORED_EMAIL, RESTORED_TITLE, PNG]) assert.equal(dom.includes(JSON.stringify(value).slice(1, -1)), false);
  // Retain old checkbox references to verify their input state was cleared too.
  for (const checkbox of fillChecks(h)) {
    assert.equal(checkbox.value, ''); assert.equal(checkbox.checked, false); assert.equal(checkbox.disabled, true);
  }
  noRestoredOutbound(h);
}
function noRaw(h) {
  const visible = nodes(h.document.body).map(node => [node._text, node.attributes, node.value]);
  assert.equal(JSON.stringify([visible, h.calls]).includes(OMIT), false, 'Excluded synthetic metadata must never enter DOM or commands');
}
function scrubbed(h, cancels = 1) {
  assert.equal(h.document.getElementById('privacy-root'), null);
  assert.match(h.document.body.textContent, /Local privacy session closed/);
  assert.equal(nodes(h.document.body).filter(node => node.tagName === 'INPUT' || node.tagName === 'IMG').length, 0);
  assert.equal(h.get('preview-image').getAttribute('src'), null);
  assert.equal(h.get('preview-image').onload, null); assert.equal(h.get('preview-image').onerror, null);
  for (const node of [...h.elements.values(), ...checks(h)].filter(node => node.tagName === 'INPUT')) {
    assert.equal(node.value, ''); assert.equal(node.checked, false); assert.equal(node.disabled, true);
  }
  assert.equal(h.port.onMessage.listeners.size, 0); assert.equal(h.port.onDisconnect.listeners.size, 0);
  assert.equal(h.disconnects, 1); assert.equal(h.timers.size, 0);
  assert.equal(h.calls.filter(call => call.type === 'cancel').length, cancels);
  assert.equal(nodes(h.document.body).at(-1).focused, true); noRaw(h);
}

test('actual HTML starts disabled; ready is inert until the explicit Inspect click', t => {
  const h = harness(t);
  assert.deepEqual(h.connections, [{ name: 'privacy-local' }]); assert.deepEqual(h.calls, []);
  for (const id of ['inspect', 'fields', 'crop-controls', 'capture', 'review-check', 'confirm', 'restore', 'fill', 'cancel', 'first-last', 'provider-mode', 'analyze-consent']) assert.equal(h.get(id).disabled, true);
  assert.equal(h.get('preview-section').hidden, true); assert.equal(h.get('outbound-section').hidden, true);
  assert.equal(h.get('restore-section').hidden, true); assert.equal(h.get('fill-section').hidden, true); assert.equal(h.get('preview-image').src, '');
  assert.equal(h.get('first-last').checked, false); assert.equal(h.get('analyze-consent').checked, false);
  assert.equal(h.timers.size, 0); h.reply({ type: 'ready' });
  assert.equal(h.get('inspect').disabled, false); assert.equal(h.get('cancel').disabled, false);
  assert.deepEqual(h.calls, []); h.fire('inspect'); assert.deepEqual(h.calls, [{ type: 'inspect' }]);
  assert.equal(h.get('inspect').disabled, true); assert.equal(h.get('crop-form').getAttribute('aria-busy'), 'true');
  assert.match(h.get('expiry').textContent, /120 seconds/); assert.equal(h.timers.size, 1);
});
test('inspection renders safe labels as text, leaves selection empty, sends only selected ids and crop', t => {
  const h = harness(t); inspected(h); noRaw(h);
  assert.equal(checks(h).length, 2); assert.ok(checks(h).every(node => !node.checked));
  assert.equal(nodes(h.get('fields')).some(node => node.tagName === 'B'), false);
  assert.match(h.get('fields').textContent, /<b>contact email<\/b>/);
  assert.equal(h.get('crop-width').value, '1024'); assert.equal(h.get('crop-height').value, '900');
  checks(h)[1].checked = true;
  for (const [key, value] of Object.entries({ x: 10, y: 20, width: 300, height: 200 })) h.get(`crop-${key}`).value = String(value);
  h.fire('crop-x', 'input'); capture(h);
  assert.deepEqual(h.calls, [{ type: 'inspect' }, { type: 'capture', ids: ['field-b'], crop: { x: 10, y: 20, width: 300, height: 200 } }]);
  for (const id of ['fields', 'crop-controls', 'capture', 'confirm']) assert.equal(h.get(id).disabled, true);
  noRaw(h);
});
test('form always prevents navigation and rejects fractional or out-of-bounds crops', t => {
  const h = harness(t); assert.equal(h.fire('crop-form', 'submit').defaultPrevented, true); assert.deepEqual(h.calls, []);
  inspected(h);
  for (const value of ['1.5', '-1', '1600', '']) { h.get('crop-x').value = value; capture(h); assert.equal(h.calls.length, 1); }
  h.get('crop-x').value = '0'; capture(h); assert.deepEqual(h.calls.at(-1).ids, []);
});
test('capture and late preview replies cannot extend the inspection deadline', t => {
  const h = harness(t); inspected(h); h.advance(30000); capture(h);
  assert.match(h.get('expiry').textContent, /90 seconds/);
  h.advance(10000); h.reply(preview()); assert.match(h.get('expiry').textContent, /80 seconds/);
  h.advance(80000); h.get('preview-image').onload(); scrubbed(h);
});
test('PNG load and checked consent jointly gate review with the exact approval tag; no transmission or auto-Fill', t => {
  const h = harness(t); shown(h); noRaw(h);
  assert.equal(h.get('preview-image').src, PNG); assert.equal(h.get('preview-section').hidden, false);
  assert.deepEqual(h.get('slots').children.map(node => node.textContent), [
    'applicant name — Filled: yes — Mask: ***', '<b>contact email</b> — Filled: no — Mask: ***']);
  assert.equal(h.get('review-check').disabled, true); assert.equal(h.get('confirm').disabled, true);
  assert.equal(h.get('restore-section').hidden, true); assert.equal(h.get('fill-section').hidden, true);
  h.get('review-check').checked = true; h.fire('confirm', 'click', true); assert.equal(h.calls.length, 2);
  h.get('review-check').checked = false; h.get('preview-image').onload();
  assert.equal(h.get('review-check').disabled, false); assert.equal(h.get('confirm').disabled, true);
  h.fire('confirm', 'click', true); assert.equal(h.calls.length, 2);
  h.get('review-check').checked = true; h.fire('review-check', 'change'); assert.equal(h.get('confirm').disabled, false);
  h.get('review-check').checked = false; h.fire('review-check', 'change'); assert.equal(h.get('confirm').disabled, true);
  h.get('review-check').checked = true; h.fire('review-check', 'change'); h.fire('confirm');
  assert.deepEqual(h.calls.at(-1), { type: 'review', approvalTag: TAG }); assert.equal(h.get('confirm').disabled, true);
  h.reply({ type: 'reviewed' });
  assert.match(h.get('status').textContent, /Restore is available/);
  assert.match(h.get('status').textContent, /Analyze\/upload\/Submit stay disabled/);
  assert.equal(h.get('restore-section').hidden, false); assert.equal(h.get('restore').disabled, false);
  assert.equal(h.get('fill-section').hidden, true); assert.equal(h.get('fill').disabled, true);
  const unavailable = nodes(h.document.body).filter(node => node.tagName === 'BUTTON' && ['Analyze', 'Upload image', 'Submit'].includes(node.textContent));
  assert.equal(unavailable.length, 3);
  for (const button of unavailable) { assert.equal(button.disabled, true); assert.equal(button.listeners.size, 0); }
  assert.deepEqual(h.calls.map(call => call.type), ['inspect', 'capture', 'review']); noRaw(h);
  assert.match(html, /connect-src 'none'/); assert.match(html, /form-action 'none'/);
});
test('Restore requires loaded preview, explicit review and host acknowledgement; review alone never restores', t => {
  const h = harness(t);
  const blocked = () => {
    const before = h.calls.length;
    assert.equal(h.get('restore').disabled, true);
    h.fire('restore', 'click', true);
    assert.equal(h.calls.length, before);
    assert.equal(h.get('restored-slots').children.length, 0);
  };
  blocked(); inspect(h); blocked(); h.reply(inspection()); blocked(); capture(h); blocked();
  h.reply(preview()); blocked(); h.get('preview-image').onload(); blocked();
  changeCheck(h, 'review-check', true); blocked(); h.fire('confirm'); blocked();
  assert.deepEqual(h.calls.map(call => call.type), ['inspect', 'capture', 'review']);
  h.reply({ type: 'reviewed' });
  assert.equal(h.get('restore').disabled, false);
  assert.equal(h.get('restore-section').hidden, false);
  assert.equal(h.get('fill-section').hidden, true);
  assert.equal(h.calls.length, 3);
  h.fire('restore'); assert.deepEqual(h.calls.at(-1), { type: 'restore' });
  assert.equal(h.get('crop-form').getAttribute('aria-busy'), 'true');
  blocked(); noRestoredOutbound(h);
});
test('host restoration renders hostile values as inert text and offers no unresolved or empty fill choice', t => {
  const h = harness(t); restored(h);
  assert.equal(h.get('restore-title-text').hidden, false);
  assert.equal(h.get('restore-title-text').textContent, RESTORED_TITLE);
  assert.deepEqual(h.get('restored-slots').children.map(node => node.textContent), [
    `applicant name: ${RESTORED_NAME}`, `<b>contact email</b>: ${RESTORED_EMAIL}`, 'address: unresolved (not filled)',
  ]);
  assert.deepEqual(fillChecks(h).map(node => node.parent.textContent), [
    `applicant name → ${RESTORED_NAME}`, `<b>contact email</b> → ${RESTORED_EMAIL}`,
  ]);
  for (const id of ['restore-title-text', 'restored-slots', 'fill-fields']) {
    assert.equal(nodes(h.get(id)).some(node => ['IMG', 'B', 'SCRIPT'].includes(node.tagName)), false);
    const attributes = JSON.stringify(nodes(h.get(id)).map(node => [node.attributes, node.value]));
    for (const value of [RESTORED_NAME, RESTORED_EMAIL, RESTORED_TITLE]) assert.equal(attributes.includes(JSON.stringify(value).slice(1, -1)), false);
  }
  assert.equal(h.get('restore').disabled, true);
  assert.equal(h.get('fill-section').hidden, false);
  assert.equal(h.get('fill-fields').disabled, false);
  assert.ok(fillChecks(h).every(node => !node.checked));
  assert.equal(h.get('fill-confirmation').checked, false); assert.equal(h.get('fill').disabled, true);
  assert.match(h.get('status').textContent, /Select fields and approve Fill separately/);
  noRestoredOutbound(h);

  const empty = harness(t); reviewed(empty); empty.fire('restore');
  empty.reply({ ...restoration(), slots: [restoration().slots[2],
    { slot: 'field-a', label: 'applicant name', filled: true, value: '', unresolved: false }] });
  assert.equal(fillChecks(empty).length, 0);
  assert.match(empty.get('fill-fields').textContent, /Unresolved fields stay manual/);
  for (const id of ['select-filled', 'clear-filled', 'fill-confirmation', 'fill']) assert.equal(empty.get(id).disabled, true);
  empty.get('fill-confirmation').checked = true; empty.fire('fill', 'click', true);
  assert.deepEqual(empty.calls.map(call => call.type), ['inspect', 'capture', 'review', 'restore']);
});
test('Fill needs explicit selection plus consent and sends only selected slot IDs once, never raw values', t => {
  const h = harness(t); restored(h);
  const blocked = () => {
    assert.equal(h.get('fill').disabled, true);
    h.fire('fill', 'click', true);
    assert.equal(h.calls.filter(call => call.type === 'fill').length, 0);
  };
  blocked();
  changeCheck(h, 'fill-confirmation', true); blocked(); // Consent without selection.
  changeCheck(h, 'fill-confirmation', false);
  changeCheck(h, fillChecks(h)[1], true); blocked(); // Selection without consent.
  changeCheck(h, 'fill-confirmation', true);
  assert.equal(h.get('fill').disabled, false);
  assert.equal(h.calls.filter(call => call.type === 'fill').length, 0); // Consent is not Fill.
  changeCheck(h, 'fill-confirmation', false); blocked();
  changeCheck(h, 'fill-confirmation', true); h.fire('fill');
  assert.deepEqual(h.calls.at(-1), { type: 'fill', confirmed: true, slots: ['field-b'] });
  assert.deepEqual(h.calls.map(call => call.type), ['inspect', 'capture', 'review', 'restore', 'fill']);
  for (const id of ['fill', 'fill-fields', 'select-filled', 'clear-filled', 'fill-confirmation', 'restore']) assert.equal(h.get(id).disabled, true);
  assert.equal(h.get('crop-form').getAttribute('aria-busy'), 'true');
  h.fire('fill', 'click', true); h.fire('restore', 'click', true);
  assert.equal(h.calls.length, 5); noRestoredOutbound(h);
});
test('individual checkbox changes, Select all and Clear selection invalidate previous Fill consent', t => {
  const h = harness(t); restored(h);
  const [first, second] = fillChecks(h);
  changeCheck(h, first, true);
  const approve = () => {
    changeCheck(h, 'fill-confirmation', true); assert.equal(h.get('fill').disabled, false);
  };
  const revoked = () => {
    assert.equal(h.get('fill-confirmation').checked, false); assert.equal(h.get('fill').disabled, true);
    h.fire('fill', 'click', true); assert.equal(h.calls.filter(call => call.type === 'fill').length, 0);
  };
  approve(); changeCheck(h, second, true); revoked();
  approve(); changeCheck(h, first, false); revoked(); // Another field remains selected.
  approve(); h.fire('select-filled'); revoked();
  assert.ok(fillChecks(h).every(node => node.checked));
  approve(); h.fire('select-filled'); revoked(); // Even when everything was selected already.
  approve(); h.fire('clear-filled'); revoked();
  assert.ok(fillChecks(h).every(node => !node.checked));
  h.fire('select-filled'); revoked(); approve();
  assert.equal(h.calls.length, 4); noRestoredOutbound(h);
});
test('terminal filled response removes restored text and PNG, clears inputs, and ignores queued replies without persistence', t => {
  const h = harness(t); restored(h);
  h.fire('select-filled'); changeCheck(h, 'fill-confirmation', true); h.fire('fill');
  assert.deepEqual(h.calls.at(-1), { type: 'fill', confirmed: true, slots: ['field-a', 'field-b'] });
  const stale = [...h.port.onMessage.listeners][0], load = h.get('preview-image').onload;
  const selection = fillChecks(h)[0], change = [...selection.listeners.get('change')][0];
  h.reply(filled()); restorationScrubbed(h, 0);
  assert.match(h.document.body.textContent, /field-a: filled — Field updated/);
  assert.match(h.document.body.textContent, /Sites may autosave/);
  assert.match(h.document.body.textContent, /never clicks Submit/);
  const terminal = h.document.body.textContent, commands = plain(h.calls);
  stale(restoration()); stale(filled()); load(); change(); h.window.dispatchEvent({ type: 'pagehide' });
  assert.equal(h.document.body.textContent, terminal); assert.deepEqual(h.calls, commands);
  assert.equal(h.connections.length, 1); restorationScrubbed(h, 0);
});
test('cancel during restoration, restored selection or pending Fill clears local data and rejects late results', t => {
  for (const phase of ['restoring', 'restored', 'filling']) {
    const h = harness(t); reviewed(h); h.fire('restore');
    if (phase !== 'restoring') {
      h.reply(restoration()); h.fire('select-filled'); changeCheck(h, 'fill-confirmation', true);
      if (phase === 'filling') h.fire('fill');
    }
    const stale = [...h.port.onMessage.listeners][0], load = h.get('preview-image').onload;
    h.fire('cancel'); restorationScrubbed(h, 1);
    assert.match(h.document.body.textContent, /Cancelled/);
    assert.deepEqual(h.calls.at(-1), { type: 'cancel' });
    const terminal = h.document.body.textContent, commands = plain(h.calls);
    stale(restoration()); stale(filled()); load();
    assert.equal(h.document.body.textContent, terminal); assert.deepEqual(h.calls, commands);
    assert.equal(h.calls.filter(call => call.type === 'fill').length, phase === 'filling' ? 1 : 0);
    restorationScrubbed(h, 1);
  }
});
const invalidPreviews = [
  ['non-PNG MIME', { preview: 'data:image/jpeg;base64,U1RVQg==' }], ['remote URL', { preview: 'https://example.invalid/preview.png' }],
  ['missing image', { preview: null }], ['wrong coverage', { coverage: 'partial' }], ['empty tag', { approvalTag: '' }],
  ['non-string tag', { approvalTag: 42 }], ['missing slots', { slots: null }], ['null slot', { slots: [null] }],
  ['non-string label', { slots: [{ label: 1, filled: true }] }], ['non-boolean filled', { slots: [{ label: 'name', filled: 'yes' }] }],
  ['expired', { remainingMs: 0 }], ['negative TTL', { remainingMs: -1 }], ['non-finite TTL', { remainingMs: Infinity }],
];
for (const [name, change] of invalidPreviews) test(`invalid preview fails closed: ${name}`, t => {
  const h = harness(t); captured(h); h.reply({ ...preview(), ...change }); scrubbed(h);
  assert.match(h.document.body.textContent, /Invalid or expired opaque preview/);
});
test('PNG decoding failure scrubs instead of permitting review', t => {
  const h = harness(t); shown(h); h.get('preview-image').onerror(); scrubbed(h);
  assert.match(h.document.body.textContent, /PNG could not be displayed/);
});
for (const phase of ['inspection pending', 'capture pending', 'preview']) test(`cancel scrubs ${phase} and ignores queued callbacks`, t => {
  const h = harness(t);
  if (phase === 'inspection pending') inspect(h); else if (phase === 'capture pending') captured(h); else shown(h);
  const stale = [...h.port.onMessage.listeners][0], load = h.get('preview-image').onload;
  h.fire('cancel'); scrubbed(h); const closed = h.document.body.textContent;
  stale(phase === 'inspection pending' ? inspection() : preview()); if (load) load();
  h.window.dispatchEvent({ type: 'pagehide' }); assert.equal(h.document.body.textContent, closed); scrubbed(h);
});
for (const phase of ['capture pending', 'preview']) test(`disconnect scrubs ${phase} without sending cancel or reconnecting`, t => {
  const h = harness(t); if (phase === 'preview') shown(h); else captured(h);
  const stale = [...h.port.onMessage.listeners][0]; h.port.onDisconnect.emit(); scrubbed(h, 0);
  stale(preview()); scrubbed(h, 0); assert.equal(h.connections.length, 1);
});
for (const phase of ['inspecting', 'capturing', 'reviewing']) test(`expiry wins before stale ${phase} response, without waiting for timer`, t => {
  const h = harness(t); let response;
  if (phase === 'inspecting') { inspect(h); response = inspection(); }
  else if (phase === 'capturing') { captured(h); response = preview(); }
  else {
    shown(h); h.get('preview-image').onload(); h.get('review-check').checked = true;
    h.fire('review-check', 'change'); h.fire('confirm'); response = { type: 'reviewed' };
  }
  h.advance(120000); h.reply(response); scrubbed(h); assert.match(h.document.body.textContent, /expired/);
});
test('worker may shorten deadline; reviewed state expires on the real interval using injected clock', async t => {
  const h = harness(t); captured(h); h.reply({ ...preview(), remainingMs: 10000 });
  assert.match(h.get('expiry').textContent, /10 seconds/);
  h.get('preview-image').onload(); h.get('review-check').checked = true; h.fire('review-check', 'change'); h.fire('confirm');
  h.reply({ type: 'reviewed' }); h.advance(10000);
  await new Promise((resolve, reject) => {
    const poll = setInterval(() => { if (!h.document.getElementById('privacy-root')) { clearInterval(poll); clearTimeout(timeout); resolve(); } }, 10);
    const timeout = setTimeout(() => { clearInterval(poll); reject(new Error('Real expiry interval did not scrub UI')); }, 2000);
  });
  scrubbed(h);
});
for (const action of ['pagehide', 'close', 'expired']) test(`${action} destroys local DOM and connection`, t => {
  const h = harness(t); shown(h);
  if (action === 'pagehide') h.window.dispatchEvent({ type: 'pagehide' });
  else if (action === 'close') h.fire('close'); else h.reply({ type: 'expired' });
  scrubbed(h, action === 'expired' ? 0 : 1); assert.equal(h.closes, action === 'close' ? 1 : 0);
});

// --- Extension UI Level 2 (issue 22): disclosure / renderer integration checks ---
// Does not enable Analyze/upload/provider transport. Does not edit vault/controller modules.
test('Level 2: preview shows outbound envelope without tokens/values; first-last and Analyze stay disabled', t => {
  const h = harness(t); shown(h); noRaw(h);
  assert.equal(h.get('outbound-section').hidden, false);
  assert.match(h.get('outbound-meta').textContent, /privacy-slots-1/);
  assert.match(h.get('outbound-meta').textContent, /transport: disabled/);
  assert.deepEqual(h.get('outbound-slots').children.map(node => node.textContent), [
    'applicant name — Filled: yes — Mask: *** — token: [vault-held, not shown]',
    '<b>contact email</b> — Filled: no — Mask: *** — token: [vault-held, not shown]',
  ]);
  assert.equal(h.get('first-last').disabled, true);
  assert.equal(h.get('first-last').checked, false);
  assert.equal(h.get('provider-mode').disabled, true);
  assert.equal(h.get('analyze-consent').disabled, true);
  assert.equal(h.get('analyze-consent').checked, false);
  const unavailable = nodes(h.document.body).filter(node => node.tagName === 'BUTTON' && ['Analyze', 'Upload image', 'Submit'].includes(node.textContent));
  assert.equal(unavailable.length, 3);
  for (const button of unavailable) { assert.equal(button.disabled, true); assert.equal(button.listeners.size, 0); }
  assert.match(html, /not labelled inherently private|still be a recipient/i);
  assert.match(html, /mocks\/privacy-ux-level-1/);
  noRaw(h);
});

test('Level 2: synthetic capture → preview → restore → Fill keeps Analyze off and local banner plain-text only', t => {
  const h = harness(t); restored(h); noRestoredOutbound(h);
  assert.equal(h.get('outbound-section').hidden, false);
  assert.equal(h.get('local-restore-banner').hidden, false);
  assert.match(h.get('local-restore-banner').textContent, /Local only/);
  assert.match(h.get('restore-help').textContent, /never.*innerHTML/i);
  assert.deepEqual(h.get('restored-slots').children.map(node => node.textContent), [
    `applicant name: ${RESTORED_NAME}`, `<b>contact email</b>: ${RESTORED_EMAIL}`, 'address: unresolved (not filled)',
  ]);
  // Hostile markup stays text; no element children under restored list.
  assert.equal(nodes(h.get('restored-slots')).some(node => ['IMG', 'B', 'SCRIPT'].includes(node.tagName)), false);
  for (const id of ['first-last', 'provider-mode', 'analyze-consent']) assert.equal(h.get(id).disabled, true);
  const unavailable = nodes(h.document.body).filter(node => node.tagName === 'BUTTON' && node.textContent === 'Analyze');
  assert.equal(unavailable.length, 1); assert.equal(unavailable[0].disabled, true);
  h.fire('select-filled'); changeCheck(h, 'fill-confirmation', true); h.fire('fill');
  assert.deepEqual(h.calls.at(-1), { type: 'fill', confirmed: true, slots: ['field-a', 'field-b'] });
  assert.equal(h.calls.some(call => ['analyze', 'upload', 'submit'].includes(call.type)), false);
  h.reply(filled()); restorationScrubbed(h, 0);
});

test('Level 2: provider-mode or first-last change events clear local approvals without enabling transport', t => {
  const h = harness(t); shown(h);
  h.get('preview-image').onload();
  changeCheck(h, 'review-check', true);
  assert.equal(h.get('confirm').disabled, false);
  // Force-fire disabled control contracts: approvals must clear; controls stay disabled.
  h.get('provider-mode').value = 'direct-remote';
  h.fire('provider-mode', 'change', true);
  assert.equal(h.get('provider-mode').value, '');
  assert.equal(h.get('provider-mode').disabled, true);
  assert.equal(h.get('review-check').checked, false);
  assert.equal(h.get('confirm').disabled, true);
  assert.match(h.get('status').textContent, /Provider\/mode/);
  changeCheck(h, 'review-check', true);
  h.get('first-last').checked = true;
  h.fire('first-last', 'change', true);
  assert.equal(h.get('first-last').checked, false);
  assert.equal(h.get('first-last').disabled, true);
  assert.equal(h.get('review-check').checked, false);
  assert.equal(h.calls.map(call => call.type).includes('analyze'), false);
  noRaw(h);
});

test('Level 2: analyze-consent cannot stick while Analyze remains unavailable', t => {
  const h = harness(t); reviewed(h);
  h.get('analyze-consent').checked = true;
  h.fire('analyze-consent', 'change', true);
  assert.equal(h.get('analyze-consent').checked, false);
  assert.equal(h.get('analyze-consent').disabled, true);
  assert.equal(h.calls.some(call => call.type === 'analyze'), false);
  noRestoredOutbound(h);
});

test('Level 2: cancel after outbound disclosure scrubs envelope and restored banner state', t => {
  const h = harness(t); restored(h);
  assert.equal(h.get('outbound-section').hidden, false);
  assert.equal(h.get('local-restore-banner').hidden, false);
  h.fire('cancel');
  restorationScrubbed(h, 1);
  assert.match(h.document.body.textContent, /Cancelled/);
});

test('Level 2: blocked capture during capturing ends with blocked chip and scrubs outbound', t => {
  const h = harness(t); captured(h);
  assert.equal(h.get('outbound-section').hidden, true);
  h.reply({
    type: 'expired',
    message: 'Privacy operation blocked or source changed. No data was transmitted. Reopen to inspect again.',
  });
  scrubbed(h, 0);
  assert.match(h.document.body.textContent, /Blocked capture/i);
  assert.match(h.document.body.textContent, /Privacy operation blocked/i);
  assert.match(h.document.body.textContent, /Analyze, upload, provider destination and Submit stayed disabled/i);
  const mains = nodes(h.document.body).filter(node => node.tagName === 'MAIN');
  assert.equal(mains.length, 1);
  assert.equal(mains[0].getAttribute('data-fail-closed') || mains[0].attributes['data-fail-closed'], 'blocked');
  assert.equal(nodes(h.document.body).some(node => ['Analyze', 'Upload image', 'Submit'].includes(node.textContent)), false);
  assert.equal(h.calls.some(call => ['analyze', 'upload', 'submit'].includes(call.type)), false);
});

test('Level 2: stale page-change during preview scrubs envelope and labels stale', t => {
  const h = harness(t); shown(h);
  assert.equal(h.get('outbound-section').hidden, false);
  h.reply({
    type: 'expired',
    message: 'The source page changed. Privacy state and preview were discarded.',
  });
  scrubbed(h, 0);
  assert.match(h.document.body.textContent, /Stale \/ page changed/i);
  assert.match(h.document.body.textContent, /source page changed/i);
  const mains = nodes(h.document.body).filter(node => node.tagName === 'MAIN');
  assert.equal(mains[0].getAttribute('data-fail-closed') || mains[0].attributes['data-fail-closed'], 'stale');
  assert.equal(h.calls.some(call => call.type === 'analyze'), false);
  noRaw(h);
});

test('Level 2: unavailable worker during inspect labels unavailable without enabling Analyze', t => {
  const h = harness(t); inspect(h);
  h.reply({
    type: 'expired',
    message: 'The local worker is unavailable. All session data have been cleared.',
  });
  scrubbed(h, 0);
  assert.match(h.document.body.textContent, /Unavailable/i);
  const mains = nodes(h.document.body).filter(node => node.tagName === 'MAIN');
  assert.equal(mains[0].getAttribute('data-fail-closed') || mains[0].attributes['data-fail-closed'], 'unavailable');
  assert.equal(h.calls.some(call => ['analyze', 'upload', 'submit'].includes(call.type)), false);
});

test('Level 2: provider-mode change after reviewed fail-closes and requires recapture', t => {
  const h = harness(t); reviewed(h);
  assert.equal(h.get('restore').disabled, false);
  h.get('provider-mode').value = 'direct-remote';
  h.fire('provider-mode', 'change', true);
  scrubbed(h, 1);
  assert.match(h.document.body.textContent, /invalidated the approved session|Recapture is required/i);
  assert.equal(h.calls.some(call => call.type === 'analyze'), false);
  assert.equal(h.calls.filter(call => call.type === 'cancel').length, 1);
});
