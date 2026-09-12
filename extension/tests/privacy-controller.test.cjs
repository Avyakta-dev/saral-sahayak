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
function deferred() { let resolve, reject; const promise = new Promise((r, j) => { resolve = r; reject = j; }); return { promise, resolve, reject }; }
function event() {
  const listeners = new Set();
  return { addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn), emit: (...args) => { for (const fn of listeners) fn(...args); } };
}
function harness(t) {
  let now = 0, timerId = 0, context;
  const timers = new Map(), forbidden = [], messages = [], injections = [], rasters = [], ports = [], vaults = [], bindings = [], windows = [];
  const holds = {}, contexts = [], contextQueries = [], fillEntries = [], fillReleases = [];
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
        // Keep transport references separately from the wire snapshot to observe cleanup.
        if (message.type === 'PRIVACY_FILL') fillEntries.push(message.entries);
        if (holds[message.type]) {
          const response = await holds[message.type].promise;
          if (message.type === 'PRIVACY_FILL' && response !== undefined) return realm(response);
        }
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
  const consumeFill = context.PrivacyVault.Vault.prototype.consumeFill;
  context.PrivacyVault.Vault.prototype.consumeFill = function (...args) {
    const released = consumeFill.apply(this, args); fillReleases.push(released); return released;
  };
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
  return { api, chrome, tab, holds, contexts, contextQueries, ports, messages, injections, rasters, vaults, bindings, windows, timers, fillEntries, fillReleases, connect, start, capture, reads, deadVaults,
    async advance(ms) { now += ms; for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.fn(); } await flush(); }
  };
}

for (const ending of ['cancel', 'expiry', 'supersession']) {
  test(`late selected values are scrubbed after ${ending}`, async t => {
    const h = harness(t);
    const port = await h.start();
    const pending = deferred();
    const original = h.chrome.tabs.sendMessage;
    const values = [{ slot: 'field-1', label: 'applicant name', value: 'Synthetic Person' }];
    h.chrome.tabs.sendMessage = (id, message, options) => message.type === 'PRIVACY_READ'
      ? pending.promise : original(id, message, options);
    await h.capture(port);
    let newer;
    if (ending === 'cancel') await port.send({ type: 'cancel' });
    else if (ending === 'expiry') await h.advance(120000);
    else newer = await h.start();
    pending.resolve(values);
    await flush();
    assert.equal(values[0].value, '', 'discarded response must be scrubbed even before vault admission');
    assert.equal(h.rasters.length, 0);
    assert.equal(port.output.some(message => message.type === 'preview'), false);
    if (newer) assert.equal(newer.output.at(-1).type, 'inspected');
  });
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
  assert.deepEqual(h.reads('PRIVACY_CHECK'), [{ id: 7, message: { type: 'PRIVACY_CHECK', generation: 'generation-1' }, options: { documentId: 'doc-1' } }],
    'inspection verifies the returned generation before exposing metadata without reading values');
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

async function pendingFill(h, slots = ['field-1']) {
  const p = await h.start();
  await p.send({ type: 'capture', ids: slots, crop });
  assert.equal(p.output.at(-1).type, 'preview');
  await p.send({ type: 'review', approvalTag: p.output.at(-1).approvalTag });
  await p.send({ type: 'restore' });
  assert.equal(p.output.at(-1).type, 'restored');
  const hold = deferred(); h.holds.PRIVACY_FILL = hold;
  await p.send({ type: 'fill', confirmed: true, slots });
  assert.equal(h.reads('PRIVACY_FILL').length, 1, 'Fill must reach the pending page request');
  assert.equal(p.output.at(-1).type, 'restored', 'no outcome before the page responds');
  h.deadVaults();
  return { p, hold };
}

function assertFillCleanup(h) {
  assert.equal(h.fillEntries.length, 1);
  assert.equal(h.fillReleases.length, 1);
  const entries = h.fillEntries[0], released = h.fillReleases[0];
  assert.notEqual(entries, released, 'transport entries must not alias the frozen release');
  assert.equal(Object.isFrozen(released), true);
  released.forEach((item, index) => {
    assert.equal(Object.isFrozen(item), true);
    assert.notEqual(entries[index], item);
    assert.equal(item.value, 'Synthetic Person', 'the frozen vault release must not be mutated');
    assert.equal(entries[index].value, '', 'mutable transport values must be scrubbed');
  });
}

for (const outcome of ['resolve', 'reject']) test(`REGRESSION: superseded pending Fill ${outcome} cannot notify or dispose a new ready session`, async t => {
  const h = harness(t); const { p, hold } = await pendingFill(h);
  const replacement = await h.start(false);
  const oldOutput = plain(p.output), newOutput = plain(replacement.output);
  const resetCount = h.reads('PRIVACY_RESET').length;
  assert.equal(resetCount, 1, 'supersession clears the old page binding');
  assert.deepEqual(plain(h.fillEntries[0]).map(entry => entry.value), [''], 'supersession clears pending transport values before the old response settles');
  delete h.holds.PRIVACY_FILL;
  if (outcome === 'reject') hold.reject(new Error('Synthetic Fill transport failure'));
  else hold.resolve();
  await flush();
  assert.deepEqual(p.output, oldOutput, `${outcome}: no late old-session messages`);
  assert.equal(p.output.some(message => message.type === 'filled'), false);
  assert.deepEqual(replacement.output, newOutput, `${outcome}: new ready session is untouched`);
  assert.equal(h.reads('PRIVACY_RESET').length, resetCount, 'old completion must not reset the new page');
  assert.equal(h.timers.size, 1, 'new session retains its deadline');
  await replacement.send({ type: 'inspect' }); await h.capture(replacement);
  assert.equal(replacement.output.at(-1).type, 'preview', 'new session remains usable');
  assert.equal(h.vaults.at(-1).snapshot(h.bindings.at(-1)).stage, 'sealed');
  assertFillCleanup(h);
});

test('REGRESSION: own page invalidation during Fill defers teardown, reports results, then silently disposes', async t => {
  for (const statuses of [['filled', 'filled'], ['filled', 'skipped']]) {
    const h = harness(t); const { p, hold } = await pendingFill(h, ['field-1', 'field-2']);
    const output = plain(p.output), outputsAtReset = [];
    const sendMessage = h.chrome.tabs.sendMessage;
    h.chrome.tabs.sendMessage = (...args) => {
      if (args[1].type === 'PRIVACY_RESET') outputsAtReset.push(plain(p.output));
      return sendMessage(...args);
    };
    const response = {
      results: statuses.map((status, index) => ({ id: `field-${index + 1}`, status,
        message: status === 'filled' ? 'Applied locally. Review the page; the extension never submits.' : 'Page changed before write. No further fields were filled.' })),
      warnings: ['Sites may autosave when fields change. The extension never clicks Submit or requestSubmit.']
    };
    // The page adapter owns write stopping; this controller test only mocks its outcome.
    h.api.invalidated({ type: 'PRIVACY_INVALIDATED', generation: 'generation-1' }, { id: h.chrome.runtime.id, tab: { id: 7 }, documentId: 'doc-1' });
    await flush();
    assert.deepEqual(p.output, output, 'invalidation must not expire the pending outcome channel');
    assert.equal(h.reads('PRIVACY_RESET').length, 0, 'do not tear down before page results arrive');
    assert.equal(h.timers.size, 1, 'invalidation must not remove the Fill deadline');
    await p.send({ type: 'fill', confirmed: true, slots: ['field-1'] });
    assert.equal(h.reads('PRIVACY_FILL').length, 1, 'pending Fill cannot be replayed');
    hold.resolve(response); await flush();
    assert.deepEqual(p.output.slice(output.length), [{ type: 'filled', ...response,
      message: 'Fill attempt finished. The extension never clicks Submit. Review the page yourself.' }]);
    assert.deepEqual(outputsAtReset, [p.output], 'report the outcome before resetting the page');
    assert.equal(h.reads('PRIVACY_RESET').length, 1);
    assert.equal(h.timers.size, 0);
    const messageCount = h.messages.length, outputCount = p.output.length;
    await p.send({ type: 'restore' }); await p.send({ type: 'fill', confirmed: true, slots: ['field-1'] });
    assert.equal(h.messages.length, messageCount, 'completed session cannot restore or fill again');
    assert.equal(p.output.length, outputCount, 'silent disposal must preserve the displayed outcome');
    assertFillCleanup(h);
  }
});

test('REGRESSION: cancel, disconnect and TTL suppress late Fill success/errors without harming a newer request', async t => {
  for (const ending of ['cancel', 'disconnect', 'ttl']) for (const outcome of ['resolve', 'reject']) {
    const label = `${ending}/${outcome}`;
    const h = harness(t); const { p, hold } = await pendingFill(h);
    await endings[ending](h, p);
    assert.deepEqual(plain(h.fillEntries[0]).map(entry => entry.value), [''], `${label}: pending transport values clear before the response settles`);
    assert.equal(h.timers.size, 0, label);
    assert.equal(h.reads('PRIVACY_RESET').length, 1, label);
    const replacement = await h.start(); await h.capture(replacement);
    const oldOutput = plain(p.output), newOutput = plain(replacement.output);
    const resetCount = h.reads('PRIVACY_RESET').length;
    const newVault = h.vaults.at(-1), newBinding = h.bindings.at(-1);
    const snapshot = plain(newVault.snapshot(newBinding));
    delete h.holds.PRIVACY_FILL;
    if (outcome === 'reject') hold.reject(new Error('Synthetic Fill transport failure'));
    else hold.resolve();
    await flush();
    assert.deepEqual(p.output, oldOutput, label);
    assert.equal(p.output.some(message => message.type === 'filled'), false, label);
    assert.deepEqual(replacement.output, newOutput, label);
    assert.deepEqual(plain(newVault.snapshot(newBinding)), snapshot, `${label}: new request remains intact`);
    assert.equal(h.timers.size, 1, label);
    assert.equal(h.reads('PRIVACY_RESET').length, resetCount, label);
    await replacement.send({ type: 'review', approvalTag: newOutput.at(-1).approvalTag });
    await replacement.send({ type: 'restore' });
    assert.equal(replacement.output.at(-1).type, 'restored', `${label}: new request remains usable`);
    assertFillCleanup(h);
  }
});

test('REGRESSION: Fill scrubs mutable entries on success and errors without mutating frozen consumeFill results', async t => {
  for (const outcome of ['success', 'reject', 'page-error']) {
    const h = harness(t); const { p, hold } = await pendingFill(h, ['field-1', 'field-2']);
    const released = h.fillReleases[0], snapshot = plain(released);
    assert.equal(Object.isFrozen(released), true);
    assert.equal(released.every(Object.isFrozen), true);
    assert.deepEqual(plain(h.fillEntries[0]).map(entry => entry.value), ['Synthetic Person', 'Synthetic Person']);
    const outputCount = p.output.length;
    if (outcome === 'reject') hold.reject(new Error('Synthetic Fill transport failure'));
    else if (outcome === 'page-error') hold.resolve({ error: 'Synthetic page rejection' });
    else hold.resolve();
    await flush();
    assertFillCleanup(h);
    assert.deepEqual(plain(released), snapshot, `${outcome}: frozen release is unchanged`);
    assert.deepEqual(p.output.slice(outputCount).map(message => message.type), [outcome === 'success' ? 'filled' : 'expired'], outcome);
    if (outcome === 'reject') assert.match(p.output.at(-1).message, /stopped responding during Fill/);
    assert.equal(h.timers.size, 0, outcome);
    assert.equal(h.reads('PRIVACY_RESET').length, 1, outcome);
  }
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
  invalidated: h => h.api.invalidated({ type: 'PRIVACY_INVALIDATED', generation: 'generation-1' }, { id: h.chrome.runtime.id, tab: { id: 7 }, documentId: 'doc-1' }),
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
  for (const sender of [{ ...valid, id: 'other' }, { ...valid, tab: { id: 8 } }, { ...valid, documentId: 'doc-2' }]) h.api.invalidated({ type: 'PRIVACY_INVALIDATED', generation: 'generation-1' }, sender);
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

// A fresh harness models a restarted worker with no old session to RESET. The
// surviving page adapter can still retire an old inspection on PRIVACY_INSPECT.
// These are synthetic transport schedules, not browser worker-lifecycle proof.
for (const versioned of [false, true]) test(`REGRESSION: retired page notification during new inspection cannot expire it (${versioned ? 'generation-bound' : 'legacy type-only'})`, async t => {
  const h = harness(t); const p = await h.start(false);
  const hold = deferred(); h.holds.PRIVACY_INSPECT = hold;
  await p.send({ type: 'inspect' });
  assert.equal(h.reads('PRIVACY_INSPECT').length, 1, 'new worker has bound the surviving document and requested inspection');
  const message = { type: 'PRIVACY_INVALIDATED' };
  if (versioned) message.generation = 'generation-retired';
  h.api.invalidated(message, { id: h.chrome.runtime.id, tab: { id: 7 }, documentId: 'doc-1' });
  hold.resolve(); await flush();
  assert.equal(p.output.some(item => item.type === 'expired'), false, 'retiring the previous page inspection must not destroy the new worker session');
  assert.equal(p.output.at(-1).type, 'inspected');
  assert.equal(h.reads('PRIVACY_RESET').length, 0, 'a stale notification must not reset the new page generation');
  assert.equal(h.timers.size, 1);
  await h.capture(p);
  assert.equal(p.output.at(-1).type, 'preview', 'the replacement inspection remains usable');
});

test('REGRESSION: delayed retired-generation notification cannot destroy a new captured request', async t => {
  const h = harness(t); const p = await h.start(); await h.capture(p);
  const output = plain(p.output), snapshot = plain(h.vaults[0].snapshot(h.bindings[0]));
  // Same document, different inspection: sender binding alone cannot distinguish it.
  await flush();
  const sender = { id: h.chrome.runtime.id, tab: { id: 7 }, documentId: 'doc-1' };
  h.api.invalidated({ type: 'PRIVACY_INVALIDATED', generation: 'generation-retired' }, sender);
  await flush();
  assert.deepEqual(p.output, output, 'late old-generation delivery must not expire the current preview');
  assert.deepEqual(plain(h.vaults[0].snapshot(h.bindings[0])), snapshot);
  assert.equal(h.reads('PRIVACY_RESET').length, 0);
  assert.equal(h.timers.size, 1);
  // Generation matching must still revoke the actual active request.
  h.api.invalidated({ type: 'PRIVACY_INVALIDATED', generation: 'generation-1' }, sender);
  await flush();
  assert.equal(p.output.at(-1).type, 'expired'); h.deadVaults();
  assert.equal(h.reads('PRIVACY_RESET').length, 1);
});

test('REGRESSION: CHECK returned inspection generation before exposing metadata when mutation races its reply', async t => {
  const h = harness(t); const p = await h.start(false);
  const hold = deferred(); h.holds.PRIVACY_CHECK = hold;
  const sendMessage = h.chrome.tabs.sendMessage;
  h.chrome.tabs.sendMessage = async (...args) => {
    const response = await sendMessage(...args);
    if (args[1].type === 'PRIVACY_INSPECT') {
      // The page produced the reply, then invalidated that generation before
      // the worker accepted it. Ignoring notifications while inspection=null
      // is safe only if a subsequent CHECK rejects this stale reply.
      h.api.invalidated({ type: 'PRIVACY_INVALIDATED', generation: response.generation },
        { id: h.chrome.runtime.id, tab: { id: 7 }, documentId: 'doc-1' });
    }
    if (args[1].type === 'PRIVACY_CHECK') return { valid: false, generation: 'generation-after-mutation' };
    return response;
  };
  await p.send({ type: 'inspect' });
  assert.deepEqual(h.reads('PRIVACY_CHECK'), [{ id: 7, message: { type: 'PRIVACY_CHECK', generation: 'generation-1' }, options: { documentId: 'doc-1' } }],
    'the returned generation must be checked against the same bound document');
  assert.deepEqual(p.output, [{ type: 'ready' }], 'do not expose inspection metadata while CHECK is pending');
  hold.resolve(); await flush();
  assert.equal(p.output.some(item => item.type === 'inspected'), false);
  assert.equal(p.output.at(-1).type, 'expired', 'mutation during reply must still fail closed');
  assert.equal(h.reads('PRIVACY_READ').length, 0);
  assert.equal(h.reads('PRIVACY_RESET').length, 1);
  assert.equal(h.vaults.length, 0);
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
