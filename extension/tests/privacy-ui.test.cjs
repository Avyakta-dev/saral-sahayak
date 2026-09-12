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
      if (!['inspect', 'capture', 'review', 'cancel'].includes(message.type)) deny('unexpected Port command');
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
    fire(id, type = 'click', forced = false) {
      const node = get(id);
      if (!forced) for (let parent = node; parent; parent = parent.parent) assert.equal(parent.disabled, false, `${id} is disabled`);
      assert.ok(node.listeners.get(type)?.length, `Missing production ${type} listener for ${id}`);
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
  for (const id of ['inspect', 'fields', 'crop-controls', 'capture', 'review-check', 'confirm', 'cancel']) assert.equal(h.get(id).disabled, true);
  assert.equal(h.get('preview-section').hidden, true); assert.equal(h.get('preview-image').src, '');
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
test('PNG load and checked consent jointly gate review with the exact approval tag; no transmission or Fill', t => {
  const h = harness(t); shown(h); noRaw(h);
  assert.equal(h.get('preview-image').src, PNG); assert.equal(h.get('preview-section').hidden, false);
  assert.deepEqual(h.get('slots').children.map(node => node.textContent), [
    'applicant name — Filled: yes — Mask: ***', '<b>contact email</b> — Filled: no — Mask: ***']);
  assert.equal(h.get('review-check').disabled, true); assert.equal(h.get('confirm').disabled, true);
  h.get('review-check').checked = true; h.fire('confirm', 'click', true); assert.equal(h.calls.length, 2);
  h.get('review-check').checked = false; h.get('preview-image').onload();
  assert.equal(h.get('review-check').disabled, false); assert.equal(h.get('confirm').disabled, true);
  h.fire('confirm', 'click', true); assert.equal(h.calls.length, 2);
  h.get('review-check').checked = true; h.fire('review-check', 'change'); assert.equal(h.get('confirm').disabled, false);
  h.get('review-check').checked = false; h.fire('review-check', 'change'); assert.equal(h.get('confirm').disabled, true);
  h.get('review-check').checked = true; h.fire('review-check', 'change'); h.fire('confirm');
  assert.deepEqual(h.calls.at(-1), { type: 'review', approvalTag: TAG }); assert.equal(h.get('confirm').disabled, true);
  h.reply({ type: 'reviewed' }); assert.match(h.get('status').textContent, /Nothing was transmitted, restored, or filled/);
  const unavailable = nodes(h.document.body).filter(node => node.tagName === 'BUTTON' && ['Analyze', 'Restore', 'Fill'].includes(node.textContent));
  assert.equal(unavailable.length, 3);
  for (const button of unavailable) { assert.equal(button.disabled, true); assert.equal(button.listeners.size, 0); }
  assert.deepEqual(h.calls.map(call => call.type), ['inspect', 'capture', 'review']); noRaw(h);
  assert.match(html, /connect-src 'none'/); assert.match(html, /form-action 'none'/);
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
