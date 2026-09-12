'use strict';
// Offline issue 17 regression evidence: real controller/vault, synthetic page responses.
// Raster stub bytes are NOT a rendered PNG; canvas call evidence is separate, not browser/pixel proof.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { webcrypto, createHash } = require('node:crypto');
const { cropPolicy } = require('../privacy/raster.js');
const source = name => fs.readFileSync(require.resolve(`../privacy/${name}.js`), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const flush = async () => { await new Promise(setImmediate); await new Promise(setImmediate); };
const crop = { x: 0, y: 0, width: 100, height: 60 };
const limits = { width: 800, height: 600, dpr: 1 };
const artifact = { preview: 'data:image/png;base64,U1RVQg==', digest: 'a'.repeat(64), coverage: 'fully-masked', transport: 'disabled' };
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
function event() {
  const listeners = new Set();
  return { addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn), emit: (...args) => { for (const fn of listeners) fn(...args); } };
}
function harness(t) {
  let now = 0, timerId = 0, context;
  const timers = new Map(), forbidden = [], messages = [], injections = [], rasters = [], ports = [], vaults = [], bindings = [], windows = [];
  const holds = {}, contexts = [], contextQueries = [];
  const tab = { id: 7, windowId: 3, url: 'https://example.invalid/form', active: true };
  const inspection = { generation: 'generation-1', candidates: [{ id: 'field-1', label: 'applicant name' }, { id: 'field-2', label: 'contact email' }], cropLimits: limits, policy: 'opaque-only' };
  const realm = value => vm.runInContext(`JSON.parse(${JSON.stringify(JSON.stringify(value))})`, context);
  const deny = name => { forbidden.push(name); throw Error('Forbidden side effect'); };
  const chrome = {
    runtime: { id: 'synthetic-extension', getURL: path => `chrome-extension://synthetic-extension/${path}`, onConnect: event(),
      getContexts: async filter => {
        contextQueries.push(plain(filter)); if (holds.contexts) await holds.contexts.promise;
        return plain(contexts.filter(item => filter.documentIds.includes(item.documentId) && filter.windowIds.includes(item.windowId)));
      }
    },
    tabs: {
      query: async () => [plain(tab)], get: async () => { if (holds.get) await holds.get.promise; return plain(tab); },
      onRemoved: event(), onUpdated: event(), onActivated: event(),
      sendMessage: async (id, message, options) => {
        messages.push(plain({ id, message, options }));
        if (holds[message.type]) await holds[message.type].promise;
        switch (message.type) {
          case 'PRIVACY_INSPECT': return realm(inspection);
          case 'PRIVACY_CHECK': return realm({ valid: true });
          case 'PRIVACY_READ': return realm(message.ids.map(slot => ({ slot, label: 'applicant name', value: 'Synthetic Person' })));
          case 'PRIVACY_RESET': return realm({ reset: true });
          case 'PRIVACY_FILL': return realm({
            results: message.entries.map(entry => ({ id: entry.id, status: 'filled', message: 'Applied locally. Review the page; the extension never submits.' })),
            warnings: ['Sites may autosave when fields change. The extension never clicks Submit or requestSubmit.']
          });
          default: return deny(`page action ${message.type}`);
        }
      }
    },
    windows: {
      onRemoved: event(),
      create: async options => { windows.push(plain(options)); if (holds.create) await holds.create.promise; return { id: 9 }; },
      remove: async id => { windows.push({ removed: id }); }
    },
    scripting: { executeScript: async options => { injections.push(plain(options)); if (holds.script) await holds.script.promise; return [{ documentId: 'doc-1', frameId: 0 }]; } }
  };
  for (const name of ['storage', 'downloads']) Object.defineProperty(chrome, name, { get: () => deny(name) });
  for (const name of ['update', 'create']) chrome.tabs[name] = () => deny(`tabs.${name}`);
  context = vm.createContext({ chrome, URL, crypto: webcrypto, performance: { now: () => now },
    setTimeout: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, at: now + ms }); return id; },
    clearTimeout: id => timers.delete(id),
    PrivacyRaster: { cropPolicy, opaqueRaster: async (...args) => { rasters.push(plain(args)); if (holds.raster) await holds.raster.promise; return realm(artifact); } }
  });
  for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB', 'navigator']) {
    Object.defineProperty(context, name, { get: () => deny(name) });
  }
  context.console = Object.fromEntries(['log', 'warn', 'error', 'debug', 'info'].map(name => [name, () => deny(`console.${name}`)]));
  vm.runInContext(source('vault'), context);
  vm.runInContext(source('slots'), context);
  // Observe real instances without replacing their validation, randomness, or private storage.
  const begin = context.PrivacyVault.Vault.prototype.begin;
  context.PrivacyVault.Vault.prototype.begin = function (binding) { vaults.push(this); bindings.push(binding); return begin.call(this, binding); };
  vm.runInContext(source('controller'), context);
  const api = context.LocalPrivacy;
  function connect(sender = { id: chrome.runtime.id, url: chrome.runtime.getURL('privacy/privacy.html'), tab: { windowId: 9 } }, name = 'privacy-local') {
    const port = { name, sender, onMessage: event(), onDisconnect: event(), output: [], disconnected: false,
      postMessage(message) { this.output.push(plain(message)); },
      disconnect() { this.disconnected = true; this.onDisconnect.emit(); },
      async send(message) { this.onMessage.emit(realm(message)); await flush(); }
    };
    ports.push(port); chrome.runtime.onConnect.emit(port); return port;
  }
  async function start(inspect = true) {
    assert.deepEqual(plain(await api.open()), { ok: true }); const port = connect(); await flush();
    assert.deepEqual(port.output, [{ type: 'ready' }]);
    if (inspect) { await port.send({ type: 'inspect' }); assert.equal(port.output.at(-1).type, 'inspected'); }
    return port;
  }
  const capture = port => port.send({ type: 'capture', ids: ['field-1'], crop });
  const reads = type => messages.filter(entry => entry.message.type === type);
  function deadVaults() { vaults.forEach((vault, i) => assert.throws(() => vault.snapshot(bindings[i]), /VAULT_INVALIDATED/)); }
  t.after(() => {
    api.cancel(); deadVaults(); assert.deepEqual(forbidden, []);
    const publicOutput = ports.flatMap(port => port.output.filter(message => message.type !== 'restored' && message.type !== 'filled'));
    const publicMessages = messages.filter(entry => entry.message.type !== 'PRIVACY_FILL');
    // Restored UI payloads and explicit Fill releases may contain values; other surfaces must not.
    assert.doesNotMatch(JSON.stringify([publicOutput, publicMessages, rasters]), /Synthetic Person/);
    assert.equal(chrome.tabs.captureVisibleTab, undefined); assert.equal(chrome.tabs.captureTab, undefined);
  });
  return { api, chrome, tab, holds, contexts, contextQueries, ports, messages, injections, rasters, vaults, bindings, windows, timers, connect, start, capture, reads, deadVaults,
    async advance(ms) { now += ms; for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.fn(); } await flush(); }
  };
}

test('open requires an HTTP(S) source; opening/connecting never inspects or reads values', async t => {
  for (const url of ['', 'chrome://settings', 'file:///tmp/example', 'chrome-extension://synthetic-extension/privacy/privacy.html']) {
    const h = harness(t); h.tab.url = url;
    await assert.rejects(h.api.open(), /normal HTTP\(S\) source tab/); assert.equal(h.windows.length, 0);
  }
  const h = harness(t); await h.start(false);
  assert.equal(h.messages.length, 0); assert.equal(h.injections.length, 0); assert.equal(h.vaults.length, 0);
  assert.equal(h.chrome.tabs.captureVisibleTab, undefined); assert.equal(h.chrome.tabs.captureTab, undefined);
});

test('port requires exact extension, URL and created window; no session or duplicate is denied', async t => {
  const h = harness(t); assert.equal(h.connect().disconnected, true); await h.api.open();
  const valid = { id: h.chrome.runtime.id, url: h.chrome.runtime.getURL('privacy/privacy.html'), tab: { windowId: 9 } };
  for (const sender of [undefined, { ...valid, id: 'other' }, { ...valid, url: valid.url + '?guessed' }, { ...valid, tab: { windowId: 10 } }, { ...valid, tab: undefined }]) {
    const p = h.connect(sender === undefined ? null : sender); await flush(); assert.equal(p.disconnected, true); assert.deepEqual(p.output, []);
  }
  const accepted = h.connect(); await flush(); assert.deepEqual(accepted.output, [{ type: 'ready' }]);
  const duplicate = h.connect(); await flush(); assert.equal(duplicate.disconnected, true);
});

test('REGRESSION: a guessed port must not bind while windows.create is pending', async t => {
  const h = harness(t); h.holds.create = deferred(); const opening = h.api.open(); await flush();
  const guessed = h.connect({ id: h.chrome.runtime.id, url: h.chrome.runtime.getURL('privacy/privacy.html'), tab: { windowId: 666 } });
  assert.deepEqual(guessed.output, []); h.holds.create.resolve(); await opening; await flush();
  assert.equal(guessed.disconnected, true, 'windowId=null must fail closed, not accept a guessed window');
  assert.deepEqual(guessed.output, []);
});

test('no-tab port is accepted only through exact document/window context lookup', async t => {
  const h = harness(t); await h.api.open(); const url = h.chrome.runtime.getURL('privacy/privacy.html');
  h.contexts.push({ documentId: 'preview-doc', windowId: 9, documentUrl: url });
  const p = h.connect({ id: h.chrome.runtime.id, url, documentId: 'preview-doc' }); await flush();
  assert.deepEqual(h.contextQueries, [{ documentIds: ['preview-doc'], windowIds: [9] }]);
  assert.deepEqual(p.output, [{ type: 'ready' }]); assert.equal(p.disconnected, false);
  assert.equal(h.messages.length, 0); await p.send({ type: 'inspect' }); assert.equal(p.output.at(-1).type, 'inspected');
});

test('no-tab fallback denies wrong document/window/URL, ambiguous or missing contexts', async t => {
  for (const mode of ['document', 'window', 'url', 'multiple', 'missing', 'unavailable']) {
    const h = harness(t); await h.api.open(); const url = h.chrome.runtime.getURL('privacy/privacy.html');
    const record = { documentId: 'preview-doc', windowId: 9, documentUrl: url };
    if (mode === 'document') record.documentId = 'other-doc';
    if (mode === 'window') record.windowId = 10;
    if (mode === 'url') record.documentUrl = url + '?wrong';
    if (mode !== 'missing') h.contexts.push(record);
    if (mode === 'multiple') h.contexts.push({ ...record });
    if (mode === 'unavailable') delete h.chrome.runtime.getContexts;
    const p = h.connect({ id: h.chrome.runtime.id, url, documentId: 'preview-doc' }); await flush();
    assert.equal(p.disconnected, true, mode); assert.deepEqual(p.output, []);
    if (mode !== 'unavailable') assert.deepEqual(h.contextQueries, [{ documentIds: ['preview-doc'], windowIds: [9] }]);
    await p.send({ type: 'inspect' }); assert.equal(h.injections.length, 0); assert.equal(h.messages.length, 0);
  }
});

for (const phase of ['create', 'contexts']) test(`early disconnect during ${phase} cannot rebind a dead port`, async t => {
  const h = harness(t); h.holds[phase] = deferred(); const opening = h.api.open(); await flush();
  const url = h.chrome.runtime.getURL('privacy/privacy.html');
  h.contexts.push({ documentId: 'preview-doc', windowId: 9, documentUrl: url });
  const p = phase === 'create' ? h.connect() : h.connect({ id: h.chrome.runtime.id, url, documentId: 'preview-doc' });
  await flush(); p.disconnect(); h.holds[phase].resolve(); await opening; await flush();
  assert.deepEqual(p.output, []); await p.send({ type: 'inspect' }); assert.equal(h.messages.length, 0);
  const replacement = h.connect(); await flush(); assert.deepEqual(replacement.output, [{ type: 'ready' }]);
  p.disconnect(); await replacement.send({ type: 'inspect' }); assert.equal(replacement.output.at(-1).type, 'inspected');
});

test('inspection is metadata-only; capture reads selected references and emits only masked slots', async t => {
  const h = harness(t); const p = await h.start();
  assert.deepEqual(h.injections, [{ target: { tabId: 7 }, files: ['privacy/page.js'] }]);
  assert.deepEqual(h.reads('PRIVACY_INSPECT'), [{ id: 7, message: { type: 'PRIVACY_INSPECT' }, options: { documentId: 'doc-1' } }]);
  assert.equal(h.reads('PRIVACY_READ').length, 0); assert.equal(h.vaults.length, 0); assert.equal(h.rasters.length, 0);
  assert.deepEqual(Object.keys(p.output.at(-1)).sort(), ['candidates', 'cropLimits', 'type']);
  await h.capture(p); const preview = p.output.at(-1); assert.equal(preview.type, 'preview');
  assert.deepEqual(h.reads('PRIVACY_READ'), [{ id: 7, message: { type: 'PRIVACY_READ', generation: 'generation-1', ids: ['field-1'] }, options: { documentId: 'doc-1' } }]);
  assert.deepEqual(plain(h.bindings[0]), { origin: 'https://example.invalid', tabId: 7, frameId: 0, documentId: 'doc-1', pageVersion: 'generation-1' });
  assert.deepEqual(h.rasters, [[crop, limits]], 'raster receives geometry only, never original pixels or field values');
  assert.deepEqual(Object.keys(preview).sort(), ['approvalTag', 'coverage', 'preview', 'remainingMs', 'slots', 'type']);
  assert.equal(preview.preview, artifact.preview); assert.equal(preview.coverage, 'fully-masked');
  assert.equal(preview.remainingMs, 120000); assert.match(preview.approvalTag, /^[A-F0-9]{32}$/);
  assert.equal(preview.slots.length, 1); const slot = preview.slots[0];
  assert.deepEqual(Object.keys(slot).sort(), ['filled', 'label', 'mask', 'slot', 'token']);
  assert.equal(slot.slot, 'field-1'); assert.equal(slot.label, 'applicant name'); assert.equal(slot.mask, '***');
  assert.equal(slot.filled, true); assert.match(slot.token, /^\[\[SSP_[A-F0-9]{32}\]\]$/);
  await p.send({ type: 'review', approvalTag: preview.approvalTag }); assert.equal(p.output.at(-1).type, 'reviewed');
  assert.equal(h.vaults[0].snapshot(h.bindings[0]).stage, 'reviewed');
});

for (const ids of [['field-99'], ['field-1', 'field-1'], Array(21).fill('field-1')]) test(`invalid selected references block before value read (${ids.length})`, async t => {
  const h = harness(t); const p = await h.start(); await p.send({ type: 'capture', ids, crop });
  assert.equal(p.output.at(-1).type, 'expired'); assert.equal(h.reads('PRIVACY_READ').length, 0); h.deadVaults();
});

test('capture before inspect, invalid crop, and wrong review tag fail closed', async t => {
  for (const mode of ['early', 'crop', 'tag']) {
    const h = harness(t); const p = await h.start(mode !== 'early');
    if (mode === 'tag') { await h.capture(p); await p.send({ type: 'review', approvalTag: '0'.repeat(32) }); }
    else await p.send({ type: 'capture', ids: ['field-1'], crop: mode === 'crop' ? { ...crop, x: -1 } : crop });
    assert.equal(p.output.at(-1).type, 'expired'); h.deadVaults();
    if (mode !== 'tag') assert.equal(h.reads('PRIVACY_READ').length, 0);
  }
});

for (const type of ['analyze', 'upload', 'submit', 'fetch', 'setProvider']) test(`${type} remains disabled even after exact review`, async t => {
  const h = harness(t); const p = await h.start(); await h.capture(p);
  await p.send({ type: 'review', approvalTag: p.output.at(-1).approvalTag });
  const count = h.messages.length; await p.send({ type });
  assert.equal(p.output.at(-1).type, 'expired'); h.deadVaults();
  assert.deepEqual(h.messages.slice(count).map(item => item.message.type), ['PRIVACY_RESET']);
});

test('host-local restore then explicit Fill never submits and consumes the vault', async t => {
  const h = harness(t); const p = await h.start(); await h.capture(p);
  await p.send({ type: 'review', approvalTag: p.output.at(-1).approvalTag });
  assert.equal(p.output.at(-1).type, 'reviewed');
  await p.send({ type: 'restore' });
  const restored = p.output.at(-1);
  assert.equal(restored.type, 'restored');
  assert.equal(restored.slots[0].filled, true);
  assert.equal(restored.slots[0].value, 'Synthetic Person');
  assert.equal(h.reads('PRIVACY_FILL').length, 0);
  await p.send({ type: 'fill', confirmed: true, slots: ['field-1'] });
  const filled = p.output.find(message => message.type === 'filled');
  assert.ok(filled);
  assert.equal(filled.results[0].status, 'filled');
  assert.match(filled.message, /never clicks Submit/);
  assert.equal(h.reads('PRIVACY_FILL').length, 1);
  const fillMessage = h.reads('PRIVACY_FILL')[0].message;
  assert.deepEqual(Object.keys(fillMessage).sort(), ['entries', 'generation', 'type']);
  assert.equal(fillMessage.entries[0].id, 'field-1');
  assert.equal(fillMessage.entries[0].value, 'Synthetic Person');
  h.deadVaults();
});

test('Fill without confirmation or before restore fails closed', async t => {
  for (const mode of ['no-confirm', 'before-restore', 'empty']) {
    const h = harness(t); const p = await h.start(); await h.capture(p);
    await p.send({ type: 'review', approvalTag: p.output.at(-1).approvalTag });
    if (mode !== 'before-restore') await p.send({ type: 'restore' });
    const count = h.reads('PRIVACY_FILL').length;
    if (mode === 'no-confirm') await p.send({ type: 'fill', confirmed: false, slots: ['field-1'] });
    else if (mode === 'empty') await p.send({ type: 'fill', confirmed: true, slots: [] });
    else await p.send({ type: 'fill', confirmed: true, slots: ['field-1'] });
    assert.equal(p.output.at(-1).type, 'expired', mode);
    assert.equal(h.reads('PRIVACY_FILL').length, count, mode);
    h.deadVaults();
  }
});

const endings = {
  disconnect: (h, p) => p.disconnect(), cancel: h => h.api.cancel(),
  windowRemoved: h => h.chrome.windows.onRemoved.emit(9),
  navigation: h => h.chrome.tabs.onUpdated.emit(7, { status: 'loading' }),
  removed: h => h.chrome.tabs.onRemoved.emit(7), switched: h => h.chrome.tabs.onActivated.emit({ windowId: 3, tabId: 8 }),
  invalidated: h => h.api.invalidated({ type: 'PRIVACY_INVALIDATED' }, { id: h.chrome.runtime.id, tab: { id: 7 }, documentId: 'doc-1' }),
  ttl: h => h.advance(120000)
};
for (const [name, end] of Object.entries(endings)) test(`${name} clears captured vault and ignores late messages`, async t => {
  const h = harness(t); const p = await h.start(); await h.capture(p); const tag = p.output.at(-1).approvalTag;
  await end(h, p); h.deadVaults(); assert.equal(h.timers.size, 0); assert.equal(h.reads('PRIVACY_RESET').length, 1);
  const count = h.messages.length, output = p.output.length;
  await p.send({ type: 'review', approvalTag: tag }); await h.capture(p); await p.send({ type: 'inspect' });
  assert.equal(h.messages.length, count); assert.equal(p.output.length, output);
});

test('invalidation is bound to exact extension, source tab and document', async t => {
  const h = harness(t); const p = await h.start(); await h.capture(p);
  const valid = { id: h.chrome.runtime.id, tab: { id: 7 }, documentId: 'doc-1' };
  for (const sender of [{ ...valid, id: 'other' }, { ...valid, tab: { id: 8 } }, { ...valid, documentId: 'doc-2' }]) h.api.invalidated({ type: 'PRIVACY_INVALIDATED' }, sender);
  h.chrome.tabs.onUpdated.emit(8, { status: 'loading' }); h.chrome.windows.onRemoved.emit(10);
  await p.send({ type: 'review', approvalTag: p.output.at(-1).approvalTag }); assert.equal(p.output.at(-1).type, 'reviewed');
});

for (const phase of ['PRIVACY_READ', 'raster']) test(`late ${phase} completion cannot revive cancelled capture`, async t => {
  const h = harness(t); const p = await h.start(); h.holds[phase] = deferred();
  await h.capture(p); assert.equal(p.output.at(-1).type, 'inspected');
  await p.send({ type: 'cancel' }); const count = p.output.length;
  h.holds[phase].resolve(); await flush(); h.deadVaults(); assert.equal(p.output.length, count);
  assert.equal(p.output.some(message => message.type === 'preview'), false);
});

test('supersession and TTL discard late raster completions and old review tags', async t => {
  for (const mode of ['supersede', 'ttl']) {
    const h = harness(t); const p = await h.start(); h.holds.raster = deferred(); await h.capture(p);
    if (mode === 'ttl') await h.advance(120000); else await h.api.open();
    const output = p.output.length; h.holds.raster.resolve(); await flush();
    assert.equal(p.output.length, output); h.deadVaults();
    await p.send({ type: 'review', approvalTag: 'old' }); assert.equal(p.output.length, output);
  }
});

test('REGRESSION: closing during tabs.get must prevent subsequent page injection', async t => {
  const h = harness(t); const p = await h.start(false); h.holds.get = deferred();
  await p.send({ type: 'inspect' }); p.disconnect(); h.holds.get.resolve(); await flush();
  assert.equal(h.injections.length, 0, 'stale inspect must not inject after the session closes');
  assert.equal(h.reads('PRIVACY_INSPECT').length, 0);
});

test('REGRESSION: closing pending inspection resets its document before documentId assignment', async t => {
  const h = harness(t); const p = await h.start(false); h.holds.PRIVACY_INSPECT = deferred();
  await p.send({ type: 'inspect' }); assert.equal(h.reads('PRIVACY_INSPECT').length, 1);
  p.disconnect(); h.holds.PRIVACY_INSPECT.resolve(); await flush();
  assert.deepEqual(h.reads('PRIVACY_RESET'), [{ id: 7, message: { type: 'PRIVACY_RESET' }, options: { documentId: 'doc-1' } }], 'pending page inspection must not retain observers/references until its own TTL');
  assert.equal(p.output.some(message => message.type === 'inspected'), false);
});

test('real cropPolicy accepts UI default dimensions and enforces viewport/DPR bounds', () => {
  for (const viewport of [limits, { width: 5000, height: 4000, dpr: 2 }, { width: 801, height: 601, dpr: 1.25 }]) {
    const defaultCrop = { x: 0, y: 0, width: Math.min(viewport.width, Math.floor(2048 / viewport.dpr)), height: Math.min(viewport.height, Math.floor(2048 / viewport.dpr)) };
    assert.deepEqual(cropPolicy(defaultCrop, viewport), { width: Math.ceil(defaultCrop.width * viewport.dpr), height: Math.ceil(defaultCrop.height * viewport.dpr) });
  }
  assert.deepEqual(cropPolicy({ x: 0, y: 0, width: 2048, height: 2048 }, { width: 2048, height: 2048, dpr: 1 }), { width: 2048, height: 2048 });
  for (const bad of [null, { ...crop, x: -1 }, { ...crop, width: 0 }, { ...crop, y: 590 }, { ...crop, width: NaN }, { ...crop, height: Infinity }]) assert.throws(() => cropPolicy(bad, limits));
  for (const dpr of [0, -1, Infinity, NaN, 30]) assert.throws(() => cropPolicy(crop, { ...limits, dpr }));
  assert.throws(() => cropPolicy({ ...crop, width: 2049 }, { width: 3000, height: 600, dpr: 1 }));
});

test('real raster module makes only a full opaque fill on a mock canvas (not pixel proof)', async () => {
  const calls = [], canvases = []; const bytes = new Uint8Array([83, 84, 85, 66]);
  class Canvas {
    constructor(width, height) { this.width = width; this.height = height; canvases.push(this); }
    getContext(type, options) { calls.push([type, plain(options)]); return { set fillStyle(value) { calls.push(['color', value]); }, fillRect: (...args) => calls.push(['fill', ...args]) }; }
    async convertToBlob(options) { calls.push(['blob', plain(options)]); return new Blob([bytes]); }
  }
  const context = vm.createContext({ OffscreenCanvas: Canvas, crypto: webcrypto, btoa: value => Buffer.from(value, 'binary').toString('base64') });
  vm.runInContext(source('raster'), context); const result = await context.PrivacyRaster.opaqueRaster(crop, limits);
  assert.deepEqual(calls, [['2d', { alpha: false }], ['color', '#183f38'], ['fill', 0, 0, 100, 60], ['blob', { type: 'image/png' }]]);
  assert.equal(result.digest, createHash('sha256').update(bytes).digest('hex')); assert.equal(result.preview, artifact.preview);
  assert.equal(result.transport, 'disabled'); assert.equal(result.coverage, 'fully-masked');
  assert.equal(canvases[0].width, 1); assert.equal(canvases[0].height, 1);
});
