'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { File } = require('node:buffer');
const { webcrypto } = require('node:crypto');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../content.js');

// Small native-prototype facsimiles: no external DOM package or browser claims.
class Element {
  constructor(tag, attributes = {}) {
    this.localName = tag;
    this.nodeType = 1;
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
    this.attributes = { ...attributes };
    this.children = [];
    this.parentElement = null;
    this.isConnected = true;
    this.labels = [];
    this.form = null;
    this.events = [];
    this._value = '';
    this._files = [];
    this.options = [];
    this.textContent = '';
    this.style = {};
  }
  get id() { return this.getAttribute('id') || ''; }
  get type() { return this.localName === 'select' ? (this.multiple ? 'select-multiple' : 'select-one') : this.getAttribute('type') || 'text'; }
  get disabled() { return this.hasAttribute('disabled'); }
  get readOnly() { return this.hasAttribute('readonly'); }
  get hidden() { return this.hasAttribute('hidden'); }
  get inert() { return this.hasAttribute('inert'); }
  get multiple() { return this.hasAttribute('multiple'); }
  get required() { return this.hasAttribute('required'); }
  get maxLength() { return this.hasAttribute('maxlength') ? Number(this.getAttribute('maxlength')) : -1; }
  get minLength() { return this.hasAttribute('minlength') ? Number(this.getAttribute('minlength')) : -1; }
  get selectedIndex() { return this.options.findIndex(option => option.value === this._value); }
  get validity() { return { valid: !this.required || Boolean(this._value) }; }
  get previousElementSibling() { const siblings = this.parentElement?.children || []; return siblings[siblings.indexOf(this) - 1] || null; }
  getAttribute(name) { return Object.hasOwn(this.attributes, name) ? String(this.attributes[name]) : null; }
  hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
  setAttribute(name, value) { this.attributes[name] = value; }
  getRootNode() { return this.ownerDocument; }
  getClientRects() { return this.noRect ? [] : [{}]; }
  matches(selector) {
    assert.equal(selector, ':disabled');
    for (let node = this; node; node = node.parentElement) if (node.disabled) return true;
    return false;
  }
  dispatchEvent(event) { this.events.push(event); if (this.onEvent) this.onEvent(event); return true; }
}
class Input extends Element {
  constructor(attributes) { super('input', attributes); }
  get value() { return this._value; }
  set value(value) { this._value = String(value); }
  get files() { return this._files; }
  set files(value) { this._files = Array.from(value); }
}
class Textarea extends Element {
  constructor(attributes) { super('textarea', attributes); }
  get value() { return this._value; }
  set value(value) { this._value = String(value); }
}
class Select extends Element {
  constructor(attributes) { super('select', attributes); }
  get value() { return this._value; }
  set value(value) { this._value = this.options.some(option => option.value === value) ? value : ''; }
}
class Transfer {
  constructor() { this.files = []; this.items = { add: file => this.files.push(file) }; }
}
function option(value, label = value, attributes = {}) {
  const element = new Element('option', attributes);
  element.value = value;
  element.label = label;
  return element;
}
function fixture(fields = []) {
  const html = new Element('html');
  const body = new Element('body');
  const all = [html, body, ...fields];
  html.children = [body]; body.parentElement = html; body.children = fields;
  fields.forEach(field => { field.parentElement = body; });
  const document = {
    querySelectorAll(selector) {
      if (selector === 'input, select, textarea') return fields.filter(field => field.isConnected);
      if (selector.startsWith('#')) return all.filter(element => element.isConnected && '#' + css.escape(element.id) === selector);
      return all.filter(element => element.isConnected && pathFor(element) === selector);
    },
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
    getElementById(id) { return all.find(element => element.id === id) || null; },
    createElement(tag) { return tag === 'input' ? new Input() : tag === 'textarea' ? new Textarea() : new Select(); }
  };
  const css = { escape(value) { return String(value).replace(/[^a-zA-Z0-9_-]/g, character => '\\' + character); } };
  function pathFor(element) {
    const parts = [];
    for (let node = element; node; node = node.parentElement) {
      const siblings = node.parentElement?.children || [node];
      parts.unshift(node.localName + ':nth-of-type(' + (siblings.filter(sibling => sibling.localName === node.localName).indexOf(node) + 1) + ')');
    }
    return parts.join(' > ');
  }
  all.forEach(element => { element.ownerDocument = document; });
  const env = {
    document, location: { href: 'https://example.test/form' }, CSS: css, crypto: webcrypto,
    getComputedStyle: element => element.style, HTMLInputElement: Input, HTMLTextAreaElement: Textarea,
    HTMLSelectElement: Select, File, DataTransfer: Transfer, Event, atob, btoa
  };
  env.top = env;
  return { env, document, body, fields, controller: api.createController(env) };
}
function request(scan, entries, file = null) { return { type: 'SS_FILL', token: scan.token, url: scan.url, entries, file }; }
function payload(name = 'resume.pdf', type = 'application/pdf', text = '%PDF-synthetic') {
  return { name, type, data: Buffer.from(text).toString('base64'), size: Buffer.byteLength(text) };
}
function fillOne(fixture, value) { const scan = fixture.controller.scan(); return fixture.controller.fill(request(scan, [{ selector: scan.fields[0].selector, value }])); }

test('sensitive metadata excludes credentials, OTP, payment, identity, bank, consent and deletion', () => {
  for (const name of ['password', 'one-time-code', 'verifyOTP', 'g-recaptcha', 'cardNumber', 'cc-csc', 'SSN', 'aadhaar', 'aadharNumber', 'bankAccount', 'IFSC', 'CVV', 'deleteAccount', 'close_account', 'acceptTerms', 'username', 'securityCode', 'cvvnumber', 'otpcode', 'paymentdetails', 'bankdetails', 'accountclose', 'termsofservice']) {
    assert.equal(api.isSensitive([name]), true, name);
  }
  for (const name of ['Full name', 'email', 'Phone', 'Address', 'Postal code', 'Resume']) assert.equal(api.isSensitive([name]), false, name);
});

test('sender must be the same extension, not a web tab, with matching provided origin and URL', () => {
  const id = 'abcdefghijklmnopabcdefghijklmnop';
  for (const sender of [{ id }, { id, url: `chrome-extension://${id}/background.js` }, { id, origin: `chrome-extension://${id}`, url: `chrome-extension://${id}/popup.html` }]) assert.equal(api.validSender(sender, id), true);
  for (const sender of [null, {}, { id: 'other' }, { id, tab: {} }, { id, url: 'https://example.test' }, { id, origin: 'null' }, { id, url: `chrome-extension://${id}.evil/file` }, { id, url: `chrome-extension://${id}/background.js`, origin: 'https://example.test' }, { id, url: '' }]) assert.equal(api.validSender(sender, id), false);
});

test('scan excludes unsafe types, read-only, hidden, disabled and fieldset controls without reading values', () => {
  const excluded = ['password', 'hidden', 'number', 'date', 'checkbox', 'radio', 'submit', 'button'].map(type => new Input({ type }));
  excluded.push(new Input({ readonly: '' }), new Input({ disabled: '' }), new Input({ hidden: '' }), new Input({ name: 'OTP' }), new Input({ autocomplete: 'cc-number' }));
  excluded.forEach(field => Object.defineProperty(field, 'value', { get() { assert.fail('Excluded value accessed'); } }));
  const safe = new Input({ id: 'full-name', placeholder: '  Full  name  ', required: '' }); safe.value = 'Sample';
  const f = fixture([...excluded, safe]);
  const scan = f.controller.scan();
  assert.equal(scan.fields.length, 1);
  assert.deepEqual(scan.fields[0], { selector: '#full-name', label: 'Full name', type: 'text', name: '', id: 'full-name', currentValue: 'Sample', required: true, options: [], accept: '', maxLength: -1 });
  assert.match(scan.token, /^[a-f0-9]{48}$/);
  assert.ok(scan.warnings.length >= 2);
  const blocked = new Input({ id: 'fieldset-child' }); const fieldset = new Element('fieldset', { disabled: '' });
  const g = fixture([blocked]); fieldset.parentElement = g.body; blocked.parentElement = fieldset;
  Object.defineProperty(blocked, 'value', { get() { assert.fail('Disabled fieldset value accessed'); } });
  assert.equal(g.controller.scan().fields.length, 0);
});

test('labels and aria metadata are bounded and sensitive fallback sources remain excluded', () => {
  const associated = new Input({ id: 'person', 'aria-label': 'Other' }); associated.labels = [{ textContent: ' Person name ' }];
  const sensitive = new Input({ id: 'safe', 'aria-label': 'OTP' }); sensitive.labels = [{ textContent: 'Name' }];
  const large = new Input({ name: 'x'.repeat(1025) });
  const longLabel = new Input({ name: 'x'.repeat(200), 'aria-label': 'y'.repeat(500) });
  const f = fixture([associated, sensitive, large, longLabel]);
  assert.deepEqual(f.controller.scan().fields.map(field => field.label), ['Person name', 'y'.repeat(240)]);
  assert.equal(f.controller.scan().fields[1].name.length, 128);
});

test('scan caps fields and select options, and avoids collecting oversized current values', () => {
  const fields = Array.from({ length: 81 }, (_, index) => new Input({ id: 'field' + index }));
  const f = fixture(fields); const scan = f.controller.scan();
  assert.equal(scan.fields.length, 80); assert.ok(scan.warnings.some(warning => warning.includes('first 80')));
  const select = new Select(); select.options = Array.from({ length: 101 }, (_, index) => option(String(index)));
  const long = new Input(); long.value = 'x'.repeat(2001);
  assert.equal(fixture([select, long]).controller.scan().fields.length, 0);
});

test('selectors use escaped unique IDs or deterministic nth-of-type paths for duplicates', () => {
  const a = new Input({ id: 'duplicate' }); const b = new Input({ id: 'duplicate' }); const c = new Textarea({ id: 'a:b' });
  const f = fixture([a, b, c]); const scan = f.controller.scan();
  assert.deepEqual(scan.fields.map(field => field.selector), ['html:nth-of-type(1) > body:nth-of-type(1) > input:nth-of-type(1)', 'html:nth-of-type(1) > body:nth-of-type(1) > input:nth-of-type(2)', '#a\\:b']);
  for (const field of scan.fields) assert.equal(f.document.querySelectorAll(field.selector).length, 1);
});

test('allowlist, stale token/URL and duplicates reject entire preflight and consume the token', () => {
  for (const failure of ['selector', 'duplicate', 'token', 'url', 'value', 'metadata', 'form', 'replacement']) {
    const first = new Input({ id: 'first' }); const second = new Input({ id: 'second' });
    const f = fixture([first, second]); const scan = f.controller.scan();
    const entries = [{ selector: '#first', value: 'Alice' }, { selector: '#second', value: 'Bob' }];
    const message = request(scan, entries);
    if (failure === 'selector') entries[1].selector = 'body';
    if (failure === 'duplicate') entries[1].selector = '#first';
    if (failure === 'token') message.token = 'wrong';
    if (failure === 'url') f.env.location.href += '?changed';
    if (failure === 'value') second.value = 'edited';
    if (failure === 'metadata') second.setAttribute('placeholder', 'Changed');
    if (failure === 'form') second.form = new Element('form');
    if (failure === 'replacement') { second.isConnected = false; const replacement = new Input({ id: 'second' }); f.fields.push(replacement); }
    const response = f.controller.fill(message);
    assert.ok(response.results.every(result => result.status === 'skipped'), failure);
    assert.equal(first.value, '', failure);
    assert.equal(first.events.length, 0, failure);
    assert.ok(f.controller.fill(request(scan, [{ selector: '#first', value: 'Retry' }])).results.every(result => result.status === 'skipped'));
  }
});

test('new scan replaces prior token; disconnected document and subframes are refused', () => {
  const f = fixture([new Input({ id: 'name' })]); const old = f.controller.scan(); const latest = f.controller.scan();
  assert.notEqual(old.token, latest.token);
  assert.equal(f.controller.fill(request(old, [{ selector: '#name', value: 'A' }])).results[0].status, 'skipped');
  f.env.top = {}; assert.equal(f.controller.scan().token, null);
  f.env.top = f.env; f.env.location.href = 'chrome://settings'; assert.equal(f.controller.scan().fields.length, 0);
});

test('native prototype setters bypass own setter and emit bubbling composed untrusted events', () => {
  const input = new Input({ id: 'name' });
  Object.defineProperty(input, 'value', { get() { return this._value; }, set() { assert.fail('Own setter called'); } });
  const f = fixture([input]); const response = fillOne(f, 'Synthetic Person');
  assert.equal(response.results[0].status, 'filled'); assert.equal(input.value, 'Synthetic Person');
  assert.deepEqual(input.events.map(event => [event.type, event.bubbles, event.composed, event.isTrusted]), [['input', true, true, false], ['change', true, true, false]]);
  const textarea = new Textarea({ id: 'address' }); assert.equal(fillOne(fixture([textarea]), 'Line one\nLine two').results[0].status, 'filled');
});

test('values obey length, required and exact enabled select option constraints', () => {
  for (const [attributes, value] of [[{ maxlength: '2' }, 'long'], [{ minlength: '3' }, 'ab'], [{ required: '' }, ''], [{}, 'a'.repeat(2001)]]) {
    const input = new Input(attributes); assert.equal(fillOne(fixture([input]), value).results[0].status, 'skipped');
  }
  for (const value of ['disabled', 'unknown', 'group-disabled']) {
    const select = new Select({ id: 'country' });
    const groupDisabled = option('group-disabled'); groupDisabled.parentElement = new Element('optgroup', { disabled: '' });
    select.options = [option('ok', 'Allowed'), option('disabled', 'Disabled', { disabled: '' }), groupDisabled];
    const f = fixture([select]); assert.deepEqual(f.controller.scan().fields[0].options, [{ value: 'ok', label: 'Allowed' }]);
    assert.equal(fillOne(f, value).results[0].status, 'skipped');
  }
  const select = new Select({ id: 'country' }); select.options = [option('ok')];
  assert.equal(fillOne(fixture([select]), 'ok').results[0].status, 'filled');
});

test('select option changes invalidate preflight', () => {
  const select = new Select({ id: 'choice' }); select.options = [option('a'), option('b')];
  const f = fixture([select]); const scan = f.controller.scan(); select.options[1].label = 'Changed';
  assert.equal(f.controller.fill(request(scan, [{ selector: '#choice', value: 'b' }])).results[0].status, 'skipped');
});

test('site handlers changing later fields cause skips; earlier rejections are detected', () => {
  const first = new Input({ id: 'first' }); const second = new Input({ id: 'second' });
  const f = fixture([first, second]); const scan = f.controller.scan();
  first.onEvent = event => { if (event.type === 'input') second.value = 'site change'; };
  let response = f.controller.fill(request(scan, [{ selector: '#first', value: 'one' }, { selector: '#second', value: 'two' }]));
  assert.deepEqual(response.results.map(result => result.status), ['filled', 'skipped']); assert.equal(second.value, 'site change');
  first.onEvent = null; second.onEvent = () => { first.value = 'rejected'; };
  const again = f.controller.scan(); response = f.controller.fill(request(again, [{ selector: '#first', value: 'one' }, { selector: '#second', value: 'two' }]));
  assert.deepEqual(response.results.map(result => result.status), ['failed', 'filled']);
  assert.equal(first.value, 'rejected');
});

test('URL change stops remaining writes and prevents claiming prior success', () => {
  const first = new Input({ id: 'first' }); const second = new Input({ id: 'second' }); const f = fixture([first, second]); const scan = f.controller.scan();
  first.onEvent = () => { f.env.location.href = 'https://example.test/next'; };
  const response = f.controller.fill(request(scan, [{ selector: '#first', value: 'one' }, { selector: '#second', value: 'two' }]));
  assert.deepEqual(response.results.map(result => result.status), ['failed', 'skipped']); assert.equal(second.value, '');
});

test('attachment validation rejects malformed base64, mismatched MIME/extensions, oversized and unsafe names', () => {
  const env = { File, atob, btoa };
  const valid = payload(); const file = api.decodeFile(valid, env);
  assert.equal(file.name, valid.name); assert.equal(file.size, valid.size);
  for (const change of [{ size: 0 }, { size: 2 * 1024 * 1024 + 1 }, { size: valid.size + 1 }, { data: 'not base64' }, { data: 'data:application/pdf;base64,' + valid.data }, { name: '../resume.pdf' }, { name: 'resume.exe' }, { type: 'image/png' }, { type: 'text/html', name: 'resume.html' }, { type: '__proto__' }]) assert.throws(() => api.decodeFile({ ...valid, ...change }, env));
  assert.throws(() => api.decodeFile({ name: 'x.txt', type: 'text/plain', size: 1, data: 'YR==' }, env));
  assert.equal(api.fileMatchesAccept(file, '.pdf, image/*'), true);
  assert.equal(api.fileMatchesAccept(file, 'application/pdf'), true);
  assert.equal(api.fileMatchesAccept(file, '.png'), false);
  assert.equal(api.fileMatchesAccept(file, '*/*'), false);
  const max = payload('max.txt', 'text/plain', 'a'.repeat(2 * 1024 * 1024));
  assert.equal(api.decodeFile(max, env).size, 2 * 1024 * 1024);
});

test('approved file is attached with DataTransfer and events; scan reveals no fake path', () => {
  const input = new Input({ id: 'resume', type: 'file', accept: '.pdf' }); input._value = 'C:\\fakepath\\old.pdf';
  Object.defineProperty(input, 'value', { get() { assert.fail('File path must not be read'); } });
  const f = fixture([input]); const scan = f.controller.scan(); assert.equal(scan.fields[0].currentValue, '');
  const file = payload(); const response = f.controller.fill(request(scan, [{ selector: '#resume', value: file.name }], file));
  assert.equal(response.results[0].status, 'filled'); assert.equal(input.files.length, 1); assert.equal(input.files[0].name, 'resume.pdf');
  assert.deepEqual(input.events.map(event => event.type), ['input', 'change']);
});

test('file validation failure blocks text writes; file replacement and attachment rejection are detected', () => {
  for (const mode of ['accept', 'missing', 'wrongname', 'changedfiles', 'transfer']) {
    const name = new Input({ id: 'name' }); const upload = new Input({ id: 'resume', type: 'file', accept: mode === 'accept' ? '.png' : '.pdf' });
    const f = fixture([name, upload]); const scan = f.controller.scan(); const file = payload();
    if (mode === 'changedfiles') upload.files = [new File(['changed'], 'changed.pdf', { type: 'application/pdf' })];
    if (mode === 'transfer') f.env.DataTransfer = class { constructor() { throw new Error('private exception'); } };
    const response = f.controller.fill(request(scan, [{ selector: '#name', value: 'Person' }, { selector: '#resume', value: mode === 'wrongname' ? 'other.pdf' : file.name }], mode === 'missing' ? null : file));
    assert.ok(response.results.every(result => result.status === 'skipped'), mode); assert.equal(name.value, '');
    assert.ok(!JSON.stringify(response).includes('private exception'));
  }
  const input = new Input({ id: 'resume', type: 'file' }); const f = fixture([input]); const scan = f.controller.scan(); const file = payload();
  input.onEvent = () => { input.files = []; };
  assert.equal(f.controller.fill(request(scan, [{ selector: '#resume', value: file.name }], file)).results[0].status, 'failed');
});

test('reset releases scan approval while allowing a fresh scan', () => {
  const f = fixture([new Input({ id: 'name' })]);
  const scan = f.controller.scan();
  assert.deepEqual(f.controller.reset(), { reset: true });
  assert.equal(f.controller.fill(request(scan, [{ selector: '#name', value: 'Person' }])).results[0].status, 'skipped');
  assert.equal(fillOne(f, 'New person').results[0].status, 'filled');
});

test('IIFE installs once, validates sender, responds asynchronously and sanitizes errors', async () => {
  const f = fixture([new Input({ id: 'name' })]); const listeners = [];
  f.env.chrome = { runtime: { id: 'ownid', onMessage: { addListener: listener => listeners.push(listener) } } };
  f.env.URL = URL; f.env.Uint8Array = Uint8Array;
  const context = vm.createContext(f.env);
  vm.runInContext('top = globalThis', context);
  const source = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');
  vm.runInContext(source, context); vm.runInContext(source, context);
  assert.equal(listeners.length, 1);
  assert.equal(listeners[0]({ type: 'SS_SCAN' }, { id: 'other' }, () => assert.fail('External sender answered')), false);
  const scan = await new Promise(resolve => assert.equal(listeners[0]({ type: 'SS_SCAN' }, { id: 'ownid', url: 'chrome-extension://ownid/background.js' }, resolve), true));
  assert.equal(scan.fields.length, 1);
  assert.equal(listeners[0]({ type: 'SS_RESET' }, { id: 'other' }, () => assert.fail('External reset answered')), false);
  const reset = await new Promise(resolve => listeners[0]({ type: 'SS_RESET' }, { id: 'ownid' }, resolve));
  assert.equal(reset.reset, true);
  const stale = await new Promise(resolve => listeners[0](request(scan, [{ selector: '#name', value: 'Person' }]), { id: 'ownid' }, resolve));
  assert.equal(stale.results[0].status, 'skipped');
  f.env.document.querySelectorAll = () => { throw new Error('SECRET PAGE TEXT'); };
  const error = await new Promise(resolve => listeners[0]({ type: 'SS_SCAN' }, { id: 'ownid' }, resolve));
  assert.equal(error.token, null); assert.equal(error.fields.length, 0); assert.ok(!JSON.stringify(error).includes('SECRET'));
});
