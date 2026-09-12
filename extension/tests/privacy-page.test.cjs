'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const api = require('../privacy/page.js');
const source = fs.readFileSync(path.join(__dirname, '../privacy/page.js'), 'utf8');
const extensionId = 'abcdefghijklmnopabcdefghijklmnop';
const worker = { id: extensionId, url: `chrome-extension://${extensionId}/background.js` };
const plain = value => JSON.parse(JSON.stringify(value));

// Deliberately small native-prototype DOM facsimile. These are VM/controller
// checks, not browser coverage, screenshot evidence or a privacy certification.
class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, fn, capture) {
    assert.equal(capture, true);
    const list = this.listeners.get(type) || [];
    list.push(fn); this.listeners.set(type, list);
  }
  removeEventListener(type, fn, capture) {
    assert.equal(capture, true);
    this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item !== fn));
  }
  fire(type) { for (const fn of [...(this.listeners.get(type) || [])]) fn({ type }); }
  count() { return [...this.listeners.values()].reduce((total, list) => total + list.length, 0); }
}
class Element {
  constructor(tag = 'div', attributes = {}) {
    this.localName = tag;
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
    this.nodeType = 1;
    this.attributes = { ...attributes };
    this.isConnected = true;
    this.labels = [];
    this.form = null;
    this.parentElement = null;
    this.style = { display: 'block', visibility: 'visible', opacity: '1', contentVisibility: 'visible' };
    this.rect = { left: 10, top: 10, right: 210, bottom: 40, width: 200, height: 30 };
    this.reads = 0;
    this.raw = '';
  }
  getAttribute(name) { return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null; }
  hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
  getRootNode() { return this.root || this.ownerDocument; }
  getClientRects() { return this.noRect ? [] : [this.rect]; }
  getBoundingClientRect() { return this.rect; }
  get disabled() { return this.hasAttribute('disabled'); }
  get readOnly() { return this.hasAttribute('readonly'); }
  get type() { return this.getAttribute('type') || 'text'; }
  matches(selector) {
    assert.equal(selector, ':disabled');
    return this.disabled || this.parentElement?.disabled || false;
  }
  get textContent() { assert.fail('Subtree text must not be read'); }
  get innerText() { assert.fail('Page text must not be read'); }
  get files() { assert.fail('Files must not be read'); }
  get options() { assert.fail('Options must not be read'); }
  setAttribute() { assert.fail('No DOM modifications'); }
  dispatchEvent() { assert.fail('No page events'); }
}
class Input extends Element {
  constructor(attributes = {}) { super('input', attributes); }
  get value() { this.reads++; if (this.throwValue) throw new Error('PRIVATE EXCEPTION'); return this.raw; }
  set value(_) { assert.fail('No value writes'); }
}
class Textarea extends Element {
  constructor(attributes = {}) { super('textarea', attributes); }
  get value() { this.reads++; if (this.throwValue) throw new Error('PRIVATE EXCEPTION'); return this.raw; }
  set value(_) { assert.fail('No value writes'); }
}
const text = nodeValue => ({ nodeType: 3, nodeValue });
const label = value => ({ childNodes: [text(value)], get textContent() { assert.fail('No label subtree reads'); } });
function fixture(fields = [new Input({ autocomplete: 'name' })], options = {}) {
  const events = new Events();
  const messages = [];
  const listeners = [];
  const observers = [];
  const timers = new Map();
  let clock = 0;
  let nextTimer = 0;
  let queries = 0;
  const body = new Element('body');
  const document = {
    documentElement: body,
    querySelectorAll(selector) { queries++; assert.equal(selector, 'input, textarea'); return fields; },
    get textContent() { assert.fail('No document text'); },
    get cookie() { assert.fail('No cookies'); },
    createElement() { assert.fail('No DOM creation'); }
  };
  body.ownerDocument = document;
  for (const field of fields) { field.ownerDocument = document; field.parentElement = body; }
  class Observer {
    constructor(callback) { this.callback = callback; this.records = []; this.active = false; observers.push(this); }
    observe(target, opts) { assert.equal(target, document); this.options = plain(opts); this.active = true; }
    disconnect() { this.active = false; this.records = []; }
    takeRecords() { return this.records.splice(0); }
    queue() { if (this.active) this.records.push({ type: 'attributes' }); }
    deliver() { const records = this.takeRecords(); if (records.length && this.active) this.callback(records); }
  }
  const env = {
    document, chrome: { runtime: { id: extensionId,
      onMessage: { addListener(fn) { listeners.push(fn); } },
      sendMessage(message, callback) { messages.push(plain(message)); callback?.(); }
    } },
    crypto: webcrypto, TextEncoder, HTMLInputElement: Input, HTMLTextAreaElement: Textarea,
    MutationObserver: Observer, performance: { now: () => clock },
    location: { protocol: 'https:', href: 'https://example.test/private?token=NEVER_EXPORT' },
    innerWidth: 900, innerHeight: 600, devicePixelRatio: 2, scrollX: 0, scrollY: 0,
    visualViewport: Object.assign(new Events(), { width: 900, height: 600, scale: 1, offsetLeft: 0, offsetTop: 0 }),
    navigation: new Events(), getComputedStyle: node => node.style,
    addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events),
    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    fetch() { assert.fail('No network'); },
    get localStorage() { assert.fail('No storage'); },
    get indexedDB() { assert.fail('No storage'); },
    console: new Proxy({}, { get() { assert.fail('No logging'); } })
  };
  Object.defineProperty(env.chrome, 'storage', { get() { assert.fail('No extension storage'); } });
  if (options.crypto) env.crypto = options.crypto;
  const context = vm.createContext(env);
  vm.runInContext(options.subframe ? 'top = {}' : 'top = globalThis', context);
  const inject = () => vm.runInContext(source, context);
  inject();
  async function send(message, sender = worker) {
    let resolve;
    const response = new Promise(done => { resolve = done; });
    const accepted = listeners[0](message, sender, value => resolve(plain(value)));
    if (!accepted) return { ignored: true };
    return response;
  }
  return {
    env, fields, document, body, events, observers, timers, messages, listeners, inject, send,
    inspect: () => send({ type: 'PRIVACY_INSPECT' }),
    read: (generation, ids = ['field-1']) => send({ type: 'PRIVACY_READ', generation, ids }),
    check: generation => send({ type: 'PRIVACY_CHECK', generation }),
    setClock: value => { clock = value; }, queries: () => queries,
    expire: () => { for (const { fn } of [...timers.values()]) fn(); }
  };
}

test('IIFE installs once and remains passive until a trusted worker inspection', async () => {
  const f = fixture(); f.inject();
  assert.equal(f.listeners.length, 1);
  assert.equal(f.events.count(), 0); assert.equal(f.timers.size, 0); assert.equal(f.observers.length, 0);
  assert.equal(f.queries(), 0); assert.equal(f.fields[0].reads, 0);
  for (const sender of [null, {}, { id: extensionId }, { ...worker, id: 'foreign' }, { ...worker, tab: {} },
    { ...worker, tab: null }, { ...worker, origin: 'null' }, { ...worker, origin: 'https://example.test' },
    { ...worker, url: `chrome-extension://${extensionId}/popup.html` },
    { ...worker, url: worker.url + '?worker' }, { ...worker, url: worker.url + '#worker' },
    { ...worker, url: 'https://example.test/background.js' }]) {
    assert.deepEqual(await f.send({ type: 'PRIVACY_INSPECT' }, sender), { ignored: true });
  }
  assert.deepEqual(await f.send({ type: 'SS_SCAN' }), { ignored: true });
  assert.equal(f.queries(), 0);
  const result = await f.send({ type: 'PRIVACY_INSPECT' }, { ...worker, origin: `chrome-extension://${extensionId}` });
  assert.equal(result.candidates.length, 1);
  assert.equal(f.events.listeners.has('message'), false);
  assert.equal(fixture([], { subframe: true }).listeners.length, 0);
});

test('inspection returns only opaque IDs, registry labels, viewport limits and string generation', async () => {
  const name = new Input({ autocomplete: 'name', id: 'private-person-123', title: 'PRIVATE_TITLE' }); name.raw = 'PRIVATE_VALUE';
  const email = new Input({ type: 'email', autocomplete: 'email' });
  const phone = new Input({ type: 'tel', autocomplete: 'tel' });
  const address = new Textarea({ autocomplete: 'street-address' });
  const f = fixture([name, email, phone, address]);
  const result = await f.inspect();
  assert.deepEqual(Object.keys(result).sort(), ['candidates', 'cropLimits', 'generation', 'policy']);
  assert.match(result.generation, /^[a-f0-9]{32}-\d+$/);
  assert.deepEqual(result.candidates, Object.keys(api.VALUE_LIMITS).map((label, index) => ({ id: `field-${index + 1}`, label })));
  assert.deepEqual(result.cropLimits, { width: 900, height: 600, dpr: 2 });
  assert.equal(result.policy, 'opaque-only');
  assert.ok(!JSON.stringify(result).includes('PRIVATE')); assert.ok(!JSON.stringify(result).includes('NEVER_EXPORT'));
  assert.ok(f.fields.every(field => field.reads === 0));
  assert.deepEqual(f.observers[0].options, { subtree: true, childList: true, attributes: true, characterData: true });
  assert.deepEqual([...f.timers.values()].map(timer => timer.delay), [120000]);
});

test('only exact plain normalized label/name/id evidence or exact autocomplete is accepted', async () => {
  const attrs = [
    { name: ' FULL   NAME ' }, { 'aria-label': 'Contact email' }, { id: 'phone number' }, { id: 'street address' },
    { id: 'full_name' }, { id: 'fullName' }, { id: 'prefix-email' }, { placeholder: 'Name' },
    { autocomplete: 'section-one name' }, { autocomplete: 'billing name' }, { autocomplete: 'off', name: 'name' },
    { autocomplete: 'given-name' }, { autocomplete: 'name', 'aria-label': 'Email' },
    { type: 'tel', autocomplete: 'name' }, { autocomplete: 'name', 'aria-labelledby': 'external' },
    { autocomplete: 'name', 'aria-describedby': 'external' }, { autocomplete: 'name', role: 'combobox' },
    { id: 'constructor' }, { id: 'toString' }, { id: '__proto__' }
  ];
  const fields = attrs.map(attributes => new Input(attributes));
  const associated = new Input(); associated.labels = [label('Applicant name')]; fields.push(associated);
  const f = fixture(fields);
  assert.deepEqual((await f.inspect()).candidates.map(candidate => candidate.label), [...Object.keys(api.VALUE_LIMITS), 'applicant name']);
  assert.ok(fields.every(field => field.reads === 0));
});

test('sensitive clues in every local evidence source deny before any value access', async () => {
  const clues = ['password', 'verifyOTP', 'UANNumber', 'Aadhaar', 'PAN', 'bankName', 'claimID', 'dateOfBirth', 'cc-name', 'cvv',
    'accountContact', 'memberEmail', 'passport', 'pin', 'apiKey', 'sessionToken', 'recoveryCode', 'healthID', 'governmentID', 'यू ए एन'];
  for (const key of ['name', 'id', 'aria-label', 'placeholder', 'title', 'autocomplete']) {
    const fields = clues.map(clue => new Input({ autocomplete: 'name', [key]: clue }));
    const f = fixture(fields);
    assert.deepEqual((await f.inspect()).candidates, [], key);
    assert.ok(fields.every(field => field.reads === 0));
  }
  const byLabel = new Input({ autocomplete: 'name' }); byLabel.labels = [label('Name'), label('OTP')];
  const byForm = new Input({ autocomplete: 'email' }); byForm.form = new Element('form', { id: 'bank' });
  assert.deepEqual((await fixture([byLabel, byForm]).inspect()).candidates, []);
});

test('labels never recursively read nested controls, textarea contents, options or hidden text', async () => {
  const safe = new Textarea(); safe.raw = 'PRIVATE_ADDRESS'; safe.labels = [{ childNodes: [text('Postal address'), safe] }];
  const nested = new Input({ autocomplete: 'name' }); nested.labels = [{ childNodes: [text('Name'), new Textarea()] }];
  const rich = new Input({ autocomplete: 'name' }); rich.labels = [{ childNodes: [new Element('span')] }];
  const huge = new Input({ autocomplete: 'name' }); huge.labels = [label('a'.repeat(1025))];
  const many = new Input({ autocomplete: 'name' }); many.labels = Array.from({ length: 9 }, () => label('Name'));
  const hugeAttr = new Input({ autocomplete: 'name', id: 'a'.repeat(1025) });
  const f = fixture([safe, nested, rich, huge, many, hugeAttr]);
  assert.deepEqual((await f.inspect()).candidates, [{ id: 'field-1', label: 'postal address' }]);
  assert.ok(f.fields.every(field => field.reads === 0));
});

test('unsupported, hidden, disabled, read-only, shadow and foreign-document fields are ignored', async () => {
  const fields = ['password', 'file', 'hidden', 'date', 'number', 'url', 'search', 'checkbox', 'radio', 'submit'].map(type => new Input({ type, autocomplete: 'name' }));
  fields.push(new Element('select', { autocomplete: 'name' }));
  for (const attribute of ['disabled', 'readonly', 'hidden', 'inert']) fields.push(new Input({ autocomplete: 'name', [attribute]: '' }));
  const f = fixture(fields);
  function add(change) { const field = new Input({ autocomplete: 'name' }); field.ownerDocument = f.document; field.parentElement = f.body; change(field); fields.push(field); }
  add(field => { field.isConnected = false; });
  add(field => { field.ownerDocument = {}; });
  add(field => { field.root = {}; });
  add(field => { field.noRect = true; });
  add(field => { field.rect.left = 901; });
  add(field => { field.rect.width = 0; });
  add(field => { field.style.opacity = '0'; });
  add(field => { field.style.visibility = 'hidden'; });
  add(field => { field.attributes['aria-hidden'] = 'true'; });
  add(field => { field.attributes['aria-disabled'] = 'true'; });
  add(field => { field.attributes['aria-readonly'] = 'true'; });
  add(field => { field.parentElement = new Element('fieldset', { disabled: '' }); });
  assert.deepEqual((await f.inspect()).candidates, []);
  assert.ok(fields.every(field => field.reads === 0));
});

test('candidate and examination budgets bound metadata work without reading any values', async () => {
  const fields = Array.from({ length: 21 }, () => new Input({ autocomplete: 'name' }));
  const f = fixture(fields);
  fields[20].getAttribute = () => assert.fail('Do not inspect a 21st eligible candidate');
  assert.equal((await f.inspect()).candidates.length, 20);
  const unknowns = Array.from({ length: 1001 }, () => new Input());
  const g = fixture(unknowns);
  unknowns[1000].getAttribute = () => assert.fail('Do not exceed the examination budget');
  assert.deepEqual((await g.inspect()).candidates, []);
  assert.ok([...fields, ...unknowns].every(field => field.reads === 0));
});

test('single-use READ returns only selected exact fields including blanks, then CHECK reads no values', async () => {
  const name = new Input({ autocomplete: 'name' }); name.raw = 'Synthetic Applicant';
  const email = new Input({ autocomplete: 'email' }); email.raw = '';
  const unselected = new Input({ autocomplete: 'tel' }); unselected.throwValue = true;
  const f = fixture([name, email, unselected]); const scan = await f.inspect();
  assert.deepEqual(await f.read(scan.generation, ['field-2', 'field-1']), [
    { slot: 'field-2', label: 'contact email', value: '' }, { slot: 'field-1', label: 'applicant name', value: 'Synthetic Applicant' }
  ]);
  assert.deepEqual(await f.check(scan.generation), { valid: true, generation: scan.generation });
  assert.deepEqual(f.fields.map(field => field.reads), [1, 1, 0]);
  assert.deepEqual(await f.read(scan.generation), { error: 'PRIVACY_STALE' });
  assert.deepEqual(f.fields.map(field => field.reads), [1, 1, 0]);
  assert.equal(f.timers.size, 0);
});

test('native getters bypass own page-defined accessors without writes or events', async () => {
  const field = new Input({ autocomplete: 'name' }); field.raw = 'Synthetic';
  Object.defineProperty(field, 'value', { get() { assert.fail('Page own getter called'); }, set() { assert.fail('Page own setter called'); } });
  const f = fixture([field]); const scan = await f.inspect();
  assert.equal((await f.read(scan.generation))[0].value, 'Synthetic');
});

test('READ enforces each Unicode code-point ceiling without truncation or value retention', async () => {
  for (const [autocomplete, limit] of [['name', 200], ['email', 254], ['tel', 60], ['street-address', 1000]]) {
    for (const oversize of [false, true]) {
      const field = new Input({ autocomplete }); field.raw = '\u{1F642}'.repeat(limit + Number(oversize));
      const f = fixture([field]); const scan = await f.inspect();
      const response = await f.read(scan.generation);
      if (oversize) {
        assert.deepEqual(response, { error: 'PRIVACY_VALUE_REJECTED' });
        assert.equal(f.timers.size, 0);
      } else assert.equal(response[0].value, field.raw);
      assert.equal(field.reads, 1);
    }
  }
  for (const raw of [null, 123, {}, ['value']]) {
    const field = new Input({ autocomplete: 'name' }); field.raw = raw;
    const f = fixture([field]); const scan = await f.inspect();
    assert.deepEqual(await f.read(scan.generation), { error: 'PRIVACY_VALUE_REJECTED' });
  }
});

test('invalid READ selections consume approval and never read any value', async () => {
  for (const ids of [null, 'field-1', ['field-1', 'field-1'], ['#name'], ['field-2'], [1], Array(21).fill('field-1')]) {
    const f = fixture(); const scan = await f.inspect();
    assert.deepEqual(await f.read(scan.generation, ids), { error: 'PRIVACY_INVALID_REQUEST' });
    assert.deepEqual(await f.read(scan.generation), { error: 'PRIVACY_STALE' });
    assert.equal(f.fields[0].reads, 0);
  }
  const f = fixture(); const scan = await f.inspect();
  assert.deepEqual(await f.read(scan.generation, []), []);
  assert.deepEqual(await f.read(scan.generation, []), { error: 'PRIVACY_STALE' });
});

test('strict messages reject extra fields and non-string generations using fixed safe errors', async () => {
  for (const message of [
    { type: 'PRIVACY_INSPECT', selector: 'PRIVATE' }, { type: 'PRIVACY_RESET', value: 'PRIVATE' },
    { type: 'PRIVACY_CHECK' }, { type: 'PRIVACY_CHECK', generation: 1 },
    { type: 'PRIVACY_READ', generation: {}, ids: [] }, { type: 'PRIVACY_READ', generation: 'a'.repeat(97), ids: [] }
  ]) {
    const f = fixture(); await f.inspect();
    assert.deepEqual(await f.send(message), { error: 'PRIVACY_INVALID_REQUEST' });
    assert.equal(f.timers.size, 0); assert.equal(f.fields[0].reads, 0);
  }
});

test('pending and delivered mutations invalidate with a data-free notification', async () => {
  for (const deliver of [false, true]) {
    const f = fixture(); const scan = await f.inspect(); const observer = f.observers[0];
    observer.queue(); if (deliver) observer.deliver();
    const check = await f.check(scan.generation);
    assert.equal(check.valid, false); assert.notEqual(check.generation, scan.generation);
    assert.deepEqual(f.messages, [{ type: 'PRIVACY_INVALIDATED' }]);
    assert.equal(observer.active, false); assert.equal(f.timers.size, 0); assert.equal(f.events.count(), 0);
    assert.deepEqual(await f.read(scan.generation), { error: 'PRIVACY_STALE' });
    assert.equal(f.fields[0].reads, 0);
  }
});

test('lifecycle, capture-phase field/scroll events and navigation invalidate, never scan', async () => {
  for (const event of ['pageshow', 'pagehide', 'scroll', 'resize', 'input', 'change', 'popstate', 'hashchange']) {
    const f = fixture(); const scan = await f.inspect(); const queries = f.queries();
    f.events.fire(event);
    assert.equal((await f.check(scan.generation)).valid, false, event);
    assert.equal(f.queries(), queries); assert.equal(f.fields[0].reads, 0);
    assert.equal(f.timers.size, 0); assert.equal(f.events.count(), 0);
    assert.deepEqual(f.messages, [{ type: 'PRIVACY_INVALIDATED' }]);
  }
  for (const [target, event] of [['visualViewport', 'resize'], ['visualViewport', 'scroll'], ['navigation', 'navigate'], ['navigation', 'currententrychange']]) {
    const f = fixture(); const scan = await f.inspect(); f.env[target].fire(event);
    assert.equal((await f.check(scan.generation)).valid, false);
    assert.equal(f.env[target].count(), 0);
  }
});

test('binding rechecks catch changes without observer delivery before any selected value read', async () => {
  const changes = [
    field => { field.attributes.id = 'new-id'; }, field => { field.attributes.autocomplete = 'name'; },
    field => { field.attributes.placeholder = 'OTP'; }, field => { field.labels = [label('New label')]; },
    field => { field.form = new Element('form'); }, field => { field.isConnected = false; },
    field => { field.ownerDocument = {}; }, field => { field.root = {}; },
    field => { field.attributes.readonly = ''; }, field => { field.style.visibility = 'hidden'; }
  ];
  for (const change of changes) {
    const fields = [new Input({ autocomplete: 'name' }), new Input({ autocomplete: 'email' })];
    const f = fixture(fields); const scan = await f.inspect(); change(fields[1]);
    // Even an unselected candidate's changed binding invalidates the complete generation.
    assert.deepEqual(await f.read(scan.generation), { error: 'PRIVACY_STALE' });
    assert.ok(fields.every(field => field.reads === 0));
  }
});

test('CHECK verifies URL, viewport, DPR, scroll and exact field metadata without value snapshots', async () => {
  for (const change of [
    f => { f.env.location.href += '#changed'; }, f => { f.env.innerWidth++; }, f => { f.env.innerHeight++; },
    f => { f.env.devicePixelRatio = 1; }, f => { f.env.scrollY++; }, f => { f.env.scrollX++; },
    f => { f.env.visualViewport.scale = 2; }, f => { f.fields[0].attributes.id = 'changed'; }
  ]) {
    const f = fixture(); const scan = await f.inspect(); change(f);
    assert.equal((await f.check(scan.generation)).valid, false);
    assert.equal(f.fields[0].reads, 0);
  }
  const f = fixture(); const scan = await f.inspect();
  f.fields[0].raw = 'Current value, not a retained snapshot';
  assert.equal((await f.check(scan.generation)).valid, true);
  assert.equal(f.fields[0].reads, 0);
  assert.equal((await f.read(scan.generation))[0].value, f.fields[0].raw);
});

test('absolute TTL checked on operations and pure timer cleanup does not inspect the page', async () => {
  const f = fixture(); const scan = await f.inspect();
  f.setClock(119999); assert.equal((await f.check(scan.generation)).valid, true);
  assert.equal(f.timers.size, 1);
  f.setClock(120000); assert.equal((await f.check(scan.generation)).valid, false);
  assert.equal(f.timers.size, 0); assert.equal(f.fields[0].reads, 0);
  const g = fixture(); const second = await g.inspect(); const queries = g.queries();
  g.document.querySelectorAll = () => assert.fail('Cleanup may not scan');
  g.env.getComputedStyle = () => assert.fail('Cleanup may not inspect geometry');
  g.expire();
  assert.equal(g.queries(), queries); assert.equal(g.fields[0].reads, 0);
  assert.equal(g.timers.size, 0); assert.equal(g.events.count(), 0);
  assert.equal((await g.check(second.generation)).valid, false);
  const backwards = fixture(); const prior = await backwards.inspect(); backwards.setClock(-1);
  assert.equal((await backwards.check(prior.generation)).valid, false);
});

test('RESET disconnects and clears, INSPECT reinstalls monitors with a fresh generation', async () => {
  const f = fixture(); const first = await f.inspect();
  assert.deepEqual(await f.send({ type: 'PRIVACY_RESET' }), { reset: true });
  assert.equal(f.observers[0].active, false); assert.equal(f.events.count(), 0); assert.equal(f.timers.size, 0);
  assert.equal((await f.check(first.generation)).valid, false);
  const second = await f.inspect();
  assert.notEqual(second.generation, first.generation);
  assert.equal(f.observers[1].active, true); assert.equal(f.timers.size, 1);
  const third = await f.inspect();
  assert.notEqual(third.generation, second.generation);
  assert.equal(f.observers[1].active, false); assert.equal(f.observers[2].active, true); assert.equal(f.timers.size, 1);
  assert.deepEqual(await f.read(first.generation), { error: 'PRIVACY_STALE' });
  assert.equal(f.fields[0].reads, 0);
});

test('failures expose only fixed errors and release observers and bindings', async () => {
  const f = fixture(); f.document.querySelectorAll = () => { throw new Error('PRIVATE PAGE CONTENT'); };
  assert.deepEqual(await f.inspect(), { error: 'PRIVACY_UNAVAILABLE' });
  assert.equal(f.timers.size, 0); assert.equal(f.events.count(), 0);
  const field = new Input({ autocomplete: 'name' }); field.throwValue = true;
  const g = fixture([field]); const scan = await g.inspect();
  assert.deepEqual(await g.read(scan.generation), { error: 'PRIVACY_UNAVAILABLE' });
  assert.equal(g.timers.size, 0); assert.equal((await g.check(scan.generation)).valid, false);
  const restricted = fixture(); restricted.env.location.protocol = 'file:';
  assert.deepEqual(await restricted.inspect(), { error: 'PRIVACY_UNAVAILABLE' });
  assert.equal(restricted.queries(), 0);
});

test('mutation during asynchronous fingerprinting cannot produce a stale inspection or READ', async () => {
  let hook = () => {};
  const crypto = { getRandomValues: bytes => webcrypto.getRandomValues(bytes), subtle: {
    async digest(...args) { const result = await webcrypto.subtle.digest(...args); hook(); return result; }
  } };
  const f = fixture(undefined, { crypto });
  hook = () => { f.observers.at(-1).queue(); hook = () => {}; };
  assert.deepEqual(await f.inspect(), { error: 'PRIVACY_STALE' });
  const scan = await f.inspect();
  hook = () => { f.events.fire('input'); hook = () => {}; };
  assert.deepEqual(await f.read(scan.generation), { error: 'PRIVACY_STALE' });
  assert.equal(f.fields[0].reads, 0);
});

test('concurrent authorized READ attempts cannot read the same generation twice', async () => {
  const f = fixture(); const scan = await f.inspect();
  const results = await Promise.all([f.read(scan.generation), f.read(scan.generation)]);
  assert.ok(results.every(result => result.error === 'PRIVACY_STALE'));
  assert.equal(f.fields[0].reads, 0);
});
