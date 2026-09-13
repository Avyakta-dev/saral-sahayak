'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Load only the worker and its real validators. No browser, dependencies, or live fetch.
const workerSource = readFileSync(path.join(__dirname, '..', 'background.js'), 'utf8');
const mappingSource = readFileSync(path.join(__dirname, '..', 'mapping.js'), 'utf8');
const EXTENSION_ID = 'synthetic-extension-id';
const POPUP_URL = `chrome-extension://${EXTENSION_ID}/popup.html`;
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const EPFO_BASE = 'http://127.0.0.1:8000';
const EPFO_CAPABILITIES = {
  schema_version: '1.0', default_language: 'en', analysis_available: true,
  languages: [{ code: 'en', name: 'English', native_name: 'English', quality_verified: true }]
};
const KEY = 'sk-synthetic-offline-test-key';
const TAB = { id: 41, windowId: 7, url: 'https://forms.example.invalid/apply?private=page-url-marker' };
const DOCUMENT_ID = 'synthetic-document-41';
const SCREENSHOT = 'data:image/jpeg;base64,c3ludGhldGljLXNjcmVlbnNob3Q=';
const PROFILE = { name: 'Asha Example', email: 'asha@example.invalid', phone: '+91 99999 00000', address: '12 Sample Road, Mysuru' };
const FILE_BYTES = Buffer.from('SYNTHETIC_FILE_BYTES_NEVER_SEND_TO_MODEL');
const FILE = { name: 'resume.txt', type: 'text/plain', size: FILE_BYTES.length, data: FILE_BYTES.toString('base64') };
const FIELDS = [
  { selector: '#name', label: 'Full name', type: 'text', name: 'name', id: 'name', currentValue: '', required: false, options: [], accept: '', maxLength: 200 },
  { selector: '#city', label: 'City', type: 'select-one', name: 'city', id: 'city', currentValue: '', required: false, options: [{ value: 'Mysuru', label: 'Mysuru' }], accept: '', maxLength: -1 },
  { selector: '#upload', label: 'Resume', type: 'file', name: 'resume', id: 'upload', currentValue: '', required: false, options: [], accept: '.txt', maxLength: -1 }
];
const item = (overrides = {}) => ({ selector: '#name', value: PROFILE.name, source: 'name', confidence: 'high', reason: 'Literal supplied name.', ...overrides });
const fileItem = () => item({ selector: '#upload', value: '__ATTACH_FILE__', source: 'file' });
const cityItem = () => item({ selector: '#city', value: 'Mysuru', source: 'address' });
const plain = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function jsonResponse(data, status = 200, options = {}) {
  const bytes = new TextEncoder().encode(options.raw === undefined ? JSON.stringify(data) : options.raw);
  let sent = false;
  return {
    ok: status >= 200 && status < 300, status,
    headers: { get: name => {
      if (name.toLowerCase() === 'content-type') return options.contentType === undefined ? 'application/json' : options.contentType;
      if (name.toLowerCase() === 'retry-after') return options.retryAfter === undefined ? null : options.retryAfter;
      return null;
    } },
    body: { getReader: () => ({
      read: async () => sent ? { done: true } : (sent = true, { done: false, value: bytes }),
      cancel: async () => {}
    }) }
  };
}

function epfoErrorAnalysis() {
  return { schema_version: '1.0', language: 'en', status: 'error', explanation: [], actions: [], required_documents: [], citations: [], warnings: [], questions: [], classification: null, draft: null, error: { code: 'synthetic', message: 'Synthetic backend error.' } };
}

function modelResponse(mappings = [item()], options = {}) {
  const inner = options.content === undefined ? JSON.stringify({ mappings }) : options.content;
  const text = options.raw === undefined ? JSON.stringify({ choices: [{ finish_reason: options.finishReason || 'stop', message: { content: inner } }] }) : options.raw;
  const chunks = options.chunks || [new TextEncoder().encode(text)];
  let index = 0;
  return {
    ok: options.status === undefined || options.status === 200,
    status: options.status || 200,
    body: { getReader: () => ({
      read: async () => index < chunks.length ? { done: false, value: chunks[index++] } : { done: true },
      cancel: async () => { if (options.onCancel) options.onCancel(); }
    }) }
  };
}

function harness(options = {}) {
  let listener;
  let session = plain(options.session || {});
  let timerId = 0;
  const timers = new Map();
  const calls = [];
  const hooks = {};
  const h = {
    calls, hooks, timers,
    tab: plain(TAB),
    documentId: DOCUMENT_ID,
    documentUrl: TAB.url,
    // Exact content-script scan contract; no invented nesting or scan documentId.
    captured: { token: 'synthetic-scan-token', url: TAB.url, fields: plain(FIELDS), warnings: ['Synthetic scan warning.'] },
    session: () => plain(session),
    of: name => calls.filter(call => call.name === name),
    fills: () => calls.filter(call => call.name === 'sendMessage' && call.args[1].type === 'SS_FILL'),
    resetCalls: () => { calls.length = 0; },
    reply: (mappings = [item()], responseOptions = {}) => { hooks.fetch = () => modelResponse(mappings, responseOptions); }
  };
  function record(name, args) { calls.push({ name, args: plain(args) }); }
  async function mocked(name, args, fallback) {
    record(name, args);
    return hooks[name] ? hooks[name](...args) : fallback();
  }
  const chrome = {
    runtime: {
      id: EXTENSION_ID,
      getURL: name => `chrome-extension://${EXTENSION_ID}/${name}`,
      onMessage: { addListener: callback => { assert.equal(listener, undefined); listener = callback; } },
      onConnect: { addListener: () => {} }
    },
    windows: {
      onRemoved: { addListener: () => {} },
      create: async request => mocked('createWindow', [request], () => ({ id: 70 })),
      remove: async windowId => mocked('removeWindow', [windowId], () => undefined)
    },
    storage: { session: {
      setAccessLevel: async access => { record('setAccessLevel', [access]); },
      get: async key => {
        // Snapshot before waiting: a pending read must not see a later Clear/Connect.
        const snapshot = plain(session);
        record('get', [key]);
        if (hooks.get) await hooks.get(key, snapshot);
        return snapshot;
      },
      set: async values => {
        // Snapshot at invocation, like Chrome serialization, but allow delayed commits.
        const snapshot = plain(values);
        record('set', [snapshot]);
        if (hooks.set) await hooks.set(snapshot);
        Object.assign(session, snapshot);
      },
      remove: async key => {
        record('remove', [key]);
        if (hooks.remove) await hooks.remove(key);
        delete session[key];
      }
    } },
    tabs: {
      onRemoved: { addListener: () => {} },
      onUpdated: { addListener: () => {} },
      onActivated: { addListener: () => {} },
      query: async query => mocked('query', [query], () => [plain(h.tab)]),
      sendMessage: async (tabId, message, target) => mocked('sendMessage', [tabId, message, target], () => {
        assert.equal(tabId, TAB.id);
        assert.deepEqual(plain(target), { documentId: DOCUMENT_ID });
        if (message.type === 'SS_SCAN') return plain(h.captured);
        if (message.type === 'SS_RESET') return { reset: true };
        assert.equal(message.type, 'SS_FILL', 'Unexpected content operation');
        return { results: message.entries.map(entry => ({ selector: entry.selector, status: 'filled', message: 'Synthetic fill acknowledgement.' })), warnings: ['Synthetic fill warning.'] };
      }),
      captureVisibleTab: async (...args) => mocked('captureVisibleTab', args, () => SCREENSHOT)
    },
    scripting: { executeScript: async request => mocked('executeScript', [request], () => {
      if (request.files) {
        assert.deepEqual(plain(request), { target: { tabId: TAB.id, allFrames: true }, files: ['content.js'] });
        return [{ frameId: 0, documentId: DOCUMENT_ID }];
      }
      assert.equal(typeof request.func, 'function');
      assert.deepEqual(plain(request.target), { tabId: TAB.id, documentIds: [DOCUMENT_ID] });
      return [{ frameId: 0, documentId: h.documentId, result: h.documentUrl }];
    }) }
  };
  const context = vm.createContext({
    chrome, URL, TextEncoder, TextDecoder, AbortController, structuredClone,
    // Never expose the host fetch, require, process, DOM, or browser to worker code.
    fetch: async (url, init) => {
      record('fetch', [url, { ...init, signal: undefined }]);
      if (url.startsWith(EPFO_BASE)) {
        assert.equal(typeof hooks.epfoFetch, 'function', 'Unexpected EPFO fetch: no offline response was configured');
        return hooks.epfoFetch(url, init);
      }
      assert.equal(url, ENDPOINT, 'Only fixed endpoints are permitted');
      assert.equal(typeof hooks.fetch, 'function', 'Unexpected fetch: no offline response was configured');
      return hooks.fetch(url, init);
    },
    setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    importScripts: (...names) => {
      for (const name of names) {
        assert.ok(['mapping.js', 'epfo-background.js', 'privacy/vault.js', 'privacy/slots.js', 'privacy/raster.js', 'privacy/controller.js'].includes(name));
        const source = name === 'mapping.js' ? mappingSource : readFileSync(path.join(__dirname, '..', name), 'utf8');
        vm.runInContext(source, context, { filename: name });
      }
    }
  });
  vm.runInContext(workerSource, context, { filename: 'background.js' });
  h.dispatch = (message, sender = { id: EXTENSION_ID, url: POPUP_URL }) => {
    let answered = false;
    const response = deferred();
    const accepted = listener(plain(message), plain(sender), result => {
      answered = true;
      response.resolve(plain(result));
    });
    return { accepted, response: response.promise, answered: () => answered };
  };
  h.send = async (type, payload) => {
    const request = h.dispatch({ type, ...(payload === undefined ? {} : { payload }) });
    assert.equal(request.accepted, true, 'Popup requests must keep the response channel open');
    return request.response;
  };
  h.ready = async () => successful(await h.send('SS_GET'));
  return h;
}

function successful(response) {
  assert.equal(response.ok, true, response.error);
  return response.state;
}
function failed(response, pattern) {
  assert.equal(response.ok, false, 'Request should be rejected');
  assert.match(response.error, pattern);
  return response;
}
test('EPFO cancellation during tab lookup prevents any later injection or capture', async () => {
  const h = harness();
  await h.ready();
  h.resetCalls();
  const lookup = deferred();
  const entered = deferred();
  h.hooks.query = () => { entered.resolve(); return lookup.promise; };
  h.hooks.executeScript = () => [{ frameId: 0, documentId: DOCUMENT_ID }];
  const pending = h.send('SS_EPFO_DETECT');
  await entered.promise;
  await h.send('SS_EPFO_CANCEL');
  lookup.resolve([plain(TAB)]);
  failed(await pending, /cancelled/);
  assert.equal(h.of('executeScript').length, 0);
  assert.equal(h.of('sendMessage').length, 0);
  assert.equal(h.of('captureVisibleTab').length, 0);
  assert.equal(h.of('fetch').length, 0);
});

test('superseded EPFO tab lookup cannot inject after a newer detection completes', async () => {
  const h = harness();
  await h.ready();
  h.resetCalls();
  const lookup = deferred();
  const entered = deferred();
  let queries = 0;
  h.hooks.query = () => { if (++queries === 1) { entered.resolve(); return lookup.promise; } return [plain(TAB)]; };
  h.hooks.executeScript = () => [{ frameId: 0, documentId: DOCUMENT_ID }];
  h.hooks.sendMessage = (tabId, message, target) => {
    assert.equal(message.type, 'SS_EPFO_DETECT');
    assert.deepEqual(plain(target), { documentId: DOCUMENT_ID });
    return { candidates: [{ text: 'Synthetic selected remark', source: 'selection' }], warnings: [] };
  };
  const old = h.send('SS_EPFO_DETECT');
  await entered.promise;
  const current = await h.send('SS_EPFO_DETECT');
  assert.equal(current.ok, true);
  lookup.resolve([plain(TAB)]);
  failed(await old, /cancelled/);
  assert.equal(h.of('executeScript').length, 1);
  assert.equal(h.of('sendMessage').length, 1);
  assert.equal(h.of('fetch').length, 0);
});

function privateStateAbsent(state) {
  const json = JSON.stringify(state);
  assert.equal(Object.hasOwn(state, 'key'), false);
  assert.equal(state.file && Object.hasOwn(state.file, 'data'), state.file ? false : null);
  assert.equal(json.includes(KEY), false);
  assert.equal(json.includes(FILE.data), false);
  assert.equal(json.includes(FILE_BYTES.toString()), false);
}
function cleared(h, state) {
  assert.equal(state.stage, 'profile');
  assert.equal(state.hasKey, false);
  assert.deepEqual(state.profile, { name: '', email: '', phone: '', address: '' });
  assert.equal(state.file, null);
  assert.equal(state.scan, null);
  assert.deepEqual(state.plan, []);
  assert.deepEqual(state.results, []);
  assert.deepEqual(state.warnings, []);
  const stored = h.session().formAssistant;
  assert.equal(stored.key, '');
  assert.equal(stored.file, null);
  assert.equal(stored.scan, null);
  privateStateAbsent(state);
  assert.equal(JSON.stringify(stored).includes(KEY), false);
  assert.equal(JSON.stringify(stored).includes(FILE.data), false);
}
async function saved(h, overrides = {}) {
  return successful(await h.send('SS_SAVE', { profile: plain(PROFILE), key: KEY, model: 'gpt-4o-mini', file: plain(FILE), ...overrides }));
}
async function captured(h, overrides = {}) {
  await saved(h, overrides);
  return successful(await h.send('SS_SCAN'));
}
async function reviewed(h, mappings = [item()], overrides = {}) {
  await captured(h, overrides);
  h.reply(mappings);
  return successful(await h.send('SS_ANALYZE', { consent: true }));
}

test('startup and SS_GET restrict session access and never scan, capture, write, or fetch', async () => {
  const h = harness();
  const state = await h.ready();
  assert.equal(state.stage, 'profile');
  assert.equal(state.hasKey, false);
  assert.deepEqual(h.of('setAccessLevel')[0].args, [{ accessLevel: 'TRUSTED_CONTEXTS' }]);
  assert.deepEqual(h.of('get')[0].args, ['formAssistant']);
  assert.deepEqual(h.calls.map(call => call.name), ['setAccessLevel', 'get']);
  h.resetCalls();
  assert.deepEqual(successful(await h.send('SS_GET')), state);
  assert.deepEqual(h.calls, []);
});

test('only the exact extension popup sender can invoke any worker action', async () => {
  const h = harness();
  await h.ready();
  h.resetCalls();
  const senders = [
    { id: EXTENSION_ID, url: TAB.url, tab: TAB },
    { id: EXTENSION_ID, url: POPUP_URL, tab: TAB },
    { id: 'another-extension', url: POPUP_URL },
    { id: EXTENSION_ID, url: `chrome-extension://${EXTENSION_ID}/content.js` },
    { id: EXTENSION_ID, url: `${POPUP_URL}?forged=1` },
    { id: EXTENSION_ID },
    { url: POPUP_URL }
  ];
  for (const sender of senders) {
    for (const type of ['SS_GET', 'SS_SAVE', 'SS_SCAN', 'SS_SCREENSHOT', 'SS_ANALYZE', 'SS_FILL', 'SS_CLEAR']) {
      const request = h.dispatch({ type, payload: { consent: true, confirmed: true } }, sender);
      assert.equal(request.accepted, false, `${type} accepted ${JSON.stringify(sender)}`);
      await Promise.resolve();
      assert.equal(request.answered(), false);
    }
  }
  assert.deepEqual(h.calls, []);
});

test('EPFO capabilities survive worker suspension, while malformed cached metadata fails closed', async () => {
  const first = harness();
  first.hooks.epfoFetch = (url, init) => {
    assert.equal(url, `${EPFO_BASE}/api/v1/capabilities`);
    assert.equal(init.method, 'GET');
    return jsonResponse(EPFO_CAPABILITIES);
  };
  const connected = await first.send('SS_EPFO_CAPABILITIES');
  assert.equal(connected.ok, true);
  assert.deepEqual(connected.data, EPFO_CAPABILITIES);
  assert.deepEqual(first.session().epfoConnection, { connected: true, capabilities: EPFO_CAPABILITIES });

  const restarted = harness({ session: first.session() });
  restarted.hooks.epfoFetch = (url, init) => {
    assert.equal(url, `${EPFO_BASE}/api/v1/analyze`);
    assert.deepEqual(JSON.parse(init.body), { text: 'Synthetic rejection remark', language: 'en' });
    return jsonResponse(epfoErrorAnalysis(), 500);
  };
  const analyzed = await restarted.send('SS_EPFO_ANALYZE', { text: 'Synthetic rejection remark', language: 'en', consent: true });
  assert.equal(analyzed.ok, true);
  assert.equal(analyzed.data.status, 'error');
  assert.equal(restarted.of('fetch').length, 1, 'Reloaded worker must not reconnect before analysis');

  const malformed = harness({ session: { epfoConnection: { connected: true, capabilities: { schema_version: '1.0', languages: [] } } } });
  const rejected = await malformed.send('SS_EPFO_ANALYZE', { text: 'Synthetic rejection remark', language: 'en', consent: true });
  assert.equal(rejected.ok, false);
  assert.match(rejected.error, /Saved backend capabilities are invalid/);
  assert.equal(malformed.session().epfoConnection, undefined);
  assert.equal(malformed.of('fetch').length, 0);
});

test('EPFO Clear invalidates a delayed valid capability read before later analysis', async () => {
  const h = harness({ session: { epfoConnection: { connected: true, capabilities: EPFO_CAPABILITIES } } });
  await h.ready();
  const entered = deferred();
  const pending = deferred();
  let first = true;
  h.hooks.get = key => {
    if (key !== 'epfoConnection' || !first) return;
    first = false;
    entered.resolve();
    return pending.promise;
  };
  h.hooks.epfoFetch = () => jsonResponse(epfoErrorAnalysis(), 500);
  const payload = { text: 'Synthetic rejection remark', language: 'en', consent: true };
  const old = h.send('SS_EPFO_ANALYZE', payload);
  await entered.promise;
  successful(await h.send('SS_CLEAR'));
  assert.equal(h.session().epfoConnection, undefined);
  pending.resolve();
  failed(await old, /cancelled|cleared or replaced/);
  assert.equal(h.of('fetch').length, 0, 'Cancelled old analysis must not send HTTP');
  const current = await h.send('SS_EPFO_ANALYZE', payload);
  assert.equal(h.of('fetch').length, 0, 'Cleared capabilities must not authorize later HTTP');
  failed(current, /Connect to the backend/);
  assert.equal(h.session().epfoConnection, undefined);
});

test('EPFO Clear invalidates a delayed Connect write in both storage and memory', async () => {
  const h = harness();
  await h.ready();
  const entered = deferred();
  const pending = deferred();
  let first = true;
  h.hooks.set = snapshot => {
    if (!snapshot.epfoConnection || !first) return;
    first = false;
    entered.resolve();
    return pending.promise;
  };
  h.hooks.epfoFetch = url => url.endsWith('/capabilities')
    ? jsonResponse(EPFO_CAPABILITIES) : jsonResponse(epfoErrorAnalysis(), 500);
  const old = h.send('SS_EPFO_CAPABILITIES');
  await entered.promise;
  const clearing = h.send('SS_CLEAR');
  // Clear may serialize its removal behind the older pending storage commit.
  await new Promise(resolve => setImmediate(resolve));
  pending.resolve();
  failed(await old, /cancelled|cleared or replaced/);
  successful(await clearing);
  assert.equal(h.session().epfoConnection, undefined);
  h.resetCalls();
  const current = await h.send('SS_EPFO_ANALYZE', { text: 'Synthetic rejection remark', language: 'en', consent: true });
  assert.equal(h.of('fetch').length, 0, 'Cancelled Connect must not repopulate the in-memory cache');
  failed(current, /Connect to the backend/);
  assert.equal(h.session().epfoConnection, undefined);
});

for (const failure of ['malformed snapshot', 'storage rejection']) test(`EPFO stale ${failure} cannot erase a newer Connect`, async () => {
  const h = harness({ session: { epfoConnection: { connected: true, capabilities: { schema_version: '1.0', languages: [] } } } });
  await h.ready();
  const entered = deferred();
  const pending = deferred();
  let first = true;
  h.hooks.get = key => {
    if (key !== 'epfoConnection' || !first) return;
    first = false;
    entered.resolve();
    return pending.promise;
  };
  const fresh = { ...plain(EPFO_CAPABILITIES), languages: EPFO_CAPABILITIES.languages.map(language => ({ ...language, quality_verified: false })) };
  h.hooks.epfoFetch = (url, init) => {
    if (url.endsWith('/capabilities')) return jsonResponse(fresh);
    assert.equal(url, `${EPFO_BASE}/api/v1/analyze`);
    assert.equal(init.method, 'POST');
    assert.deepEqual(JSON.parse(init.body), { text: 'Synthetic rejection remark', language: 'en' });
    return jsonResponse(epfoErrorAnalysis(), 500);
  };
  const payload = { text: 'Synthetic rejection remark', language: 'en', consent: true };
  const old = h.send('SS_EPFO_ANALYZE', payload);
  await entered.promise;
  assert.deepEqual(await h.send('SS_EPFO_CAPABILITIES'), { ok: true, data: fresh, status: 200 });
  const connection = { connected: true, capabilities: fresh };
  assert.deepEqual(h.session().epfoConnection, connection);
  h.resetCalls();
  if (failure === 'storage rejection') pending.reject(new Error('Synthetic delayed session read failure'));
  else pending.resolve();
  failed(await old, /cancelled|cleared or replaced|Saved backend capabilities are invalid/);
  const afterOld = h.session().epfoConnection;
  const current = await h.send('SS_EPFO_ANALYZE', payload);
  assert.deepEqual({
    connection: afterOld,
    removals: h.of('remove').filter(call => call.args[0] === 'epfoConnection').length,
    reads: h.of('get').filter(call => call.args[0] === 'epfoConnection').length,
    response: current,
    requests: h.of('fetch').map(call => call.args[0])
  }, {
    connection, removals: 0, reads: 0,
    response: { ok: true, data: epfoErrorAnalysis(), status: 500 },
    requests: [`${EPFO_BASE}/api/v1/analyze`]
  }, 'Old read failure must preserve the newer session and warm cache');
  assert.deepEqual(h.session().epfoConnection, connection);
});

// Exercise the real listener, capabilities discovery, transport and validators together.
// Saving the unrelated form profile/key makes accidental EPFO credential reuse observable.
async function epfoAnalyzed(data, status, options = {}) {
  const h = harness();
  await saved(h);
  assert.equal(h.session().formAssistant.key, KEY);
  assert.equal(h.of('fetch').length, 0);
  h.hooks.epfoFetch = (url, init) => {
    if (url === `${EPFO_BASE}/api/v1/capabilities`) {
      assert.equal(init.method, 'GET');
      return jsonResponse(EPFO_CAPABILITIES);
    }
    assert.equal(url, `${EPFO_BASE}/api/v1/analyze`);
    assert.equal(init.method, 'POST');
    return jsonResponse(data, status, options);
  };
  assert.deepEqual(await h.send('SS_EPFO_CAPABILITIES'), { ok: true, data: EPFO_CAPABILITIES, status: 200 });
  assert.equal(h.of('fetch').length, 1, 'Connecting must not analyze');
  const text = 'Synthetic rejection remark reviewed by the user';
  const response = await h.send('SS_EPFO_ANALYZE', { text, language: 'en', consent: true });
  assert.deepEqual(h.of('fetch').map(call => call.args[0]), [
    `${EPFO_BASE}/api/v1/capabilities`, `${EPFO_BASE}/api/v1/analyze`
  ], 'Exactly one capabilities GET and one analysis POST; no retries or provider fallback');
  const get = h.of('fetch')[0].args[1];
  const post = h.of('fetch')[1].args[1];
  assert.equal(get.body, undefined);
  assert.deepEqual(get.headers || {}, {});
  assert.deepEqual(post.headers, { 'Content-Type': 'application/json' }, 'Saved provider keys must not become backend auth headers');
  assert.deepEqual(JSON.parse(post.body), { text, language: 'en' }, 'Only reviewed text and language may be transmitted');
  for (const init of [get, post]) {
    assert.equal(init.credentials, 'omit');
    assert.equal(init.redirect, 'error');
    assert.equal(init.cache, 'no-store');
    for (const secret of [KEY, PROFILE.name, PROFILE.email, FILE.data, SCREENSHOT, TAB.url]) {
      assert.equal(JSON.stringify(init).includes(secret), false);
    }
  }
  for (const name of ['query', 'executeScript', 'sendMessage', 'captureVisibleTab']) assert.equal(h.of(name).length, 0);
  assert.equal(h.fills().length, 0);
  assert.equal(h.timers.size, 0, 'No pending request timeout or automatic retry');
  return response;
}

const HOSTILE_EPFO_MESSAGE = `<script>SECRET_BACKEND_BODY ${KEY} ${TAB.url}</script>`;
const EPFO_CAPACITY_MESSAGE = 'Backend analysis capacity is limited (HTTP 429). Try again later only if you choose. No automatic retry was made.';

test('EPFO small protected errors use HTTP-specific guidance, never server messages', async t => {
  // 401/429/504 match backend/access.py; 403 is a gateway-style error in the same shape.
  const cases = [
    [401, 'access_denied', 'Analysis access denied.', 'Backend access denied (HTTP 401). Protected analysis requires an approved authenticated gateway. Do not enter the shared server token in this extension.'],
    [403, 'access_forbidden', 'Analysis access forbidden.', 'Backend access forbidden (HTTP 403). Ask the operator to check the approved access path; do not add server credentials to the browser.'],
    [429, 'analysis_capacity', 'Analysis capacity is limited.', EPFO_CAPACITY_MESSAGE],
    [504, 'request_timeout', 'Analysis request timed out.', 'The backend request timed out (HTTP 504). No automatic retry was made; this is not a completed analysis.']
  ];
  for (const [status, code, message, expected] of cases) {
    for (const hostile of [false, true]) await t.test(`HTTP ${status}, ${hostile ? 'hostile' : 'ordinary'} message`, async () => {
      const response = await epfoAnalyzed({ error: { code, message: hostile ? HOSTILE_EPFO_MESSAGE : message } }, status);
      assert.deepEqual(response, { ok: false, error: expected });
      assert.equal(JSON.stringify(response).includes(HOSTILE_EPFO_MESSAGE), false);
    });
  }
});

test('EPFO 429 reflects only bounded positive Retry-After seconds without retrying', async t => {
  for (const retryAfter of ['1', '60', '3600']) await t.test(`Retry-After ${retryAfter}`, async () => {
    const response = await epfoAnalyzed({ error: { code: 'analysis_capacity', message: HOSTILE_EPFO_MESSAGE } }, 429, { retryAfter });
    assert.deepEqual(response, {
      ok: false,
      error: `Backend analysis capacity is limited (HTTP 429). Wait at least ${retryAfter} seconds before choosing to try again. No automatic retry was made.`
    });
  });
});

test('EPFO 429 ignores invalid Retry-After headers rather than echoing or retrying', async t => {
  const cases = [
    ['absent', null], ['empty', ''], ['HTML', '<img src=x onerror=alert(1)>'],
    ['HTTP date', 'Wed, 21 Oct 2015 07:28:00 GMT'], ['negative', '-1'], ['zero', '0'],
    ['above bound', '3601'], ['huge integer', '999999999999999999999999999999'],
    ['fractional', '1.5'], ['exponent', '1e3'], ['signed', '+60'],
    ['whitespace', ' 60 '], ['suffixed', '60 seconds']
  ];
  for (const [name, retryAfter] of cases) await t.test(name, async () => {
    const response = await epfoAnalyzed({ error: { code: 'analysis_capacity', message: HOSTILE_EPFO_MESSAGE } }, 429, { retryAfter });
    assert.deepEqual(response, { ok: false, error: EPFO_CAPACITY_MESSAGE });
  });
});

test('EPFO full 503 and 504 errors retain the validated analysis envelope and HTTP status', async t => {
  const cases = [
    [503, 'model_not_configured', 'Model configuration is unavailable.'],
    [503, 'knowledge_unavailable', 'The Markdown knowledge corpus is missing or incomplete.'],
    [504, 'analysis_timeout', 'Analysis timed out.']
  ];
  for (const [status, code, message] of cases) await t.test(`HTTP ${status}: ${code}`, async () => {
    const data = { ...epfoErrorAnalysis(), error: { code, message } };
    assert.deepEqual(await epfoAnalyzed(data, status), { ok: true, data, status });
  });
});

test('EPFO full 503 and 504 envelopes cannot bypass analysis validation', async t => {
  for (const status of [503, 504]) {
    const cases = [
      ['wrong language', { language: 'hi' }],
      ['missing actions', { actions: undefined }],
      ['invalid error', { error: { code: 'analysis_timeout', message: 42 } }],
      ['unvalidated guidance', { explanation: [{ text: HOSTILE_EPFO_MESSAGE, citation_ids: [] }] }]
    ];
    for (const [name, overrides] of cases) await t.test(`HTTP ${status}: ${name}`, async () => {
      assert.deepEqual(await epfoAnalyzed({ ...epfoErrorAnalysis(), ...overrides }, status), {
        ok: false, error: 'The backend returned an invalid analysis envelope. No guidance is displayed.'
      });
    });
  }
});

test('EPFO unexpected HTTP responses never echo small error bodies', async t => {
  for (const status of [200, 418, 500, 502, 503]) await t.test(`HTTP ${status}`, async () => {
    const response = await epfoAnalyzed({ error: { code: 'unexpected', message: HOSTILE_EPFO_MESSAGE } }, status);
    assert.deepEqual(response, { ok: false, error: `Backend returned an unexpected response (HTTP ${status}).` });
  });
});

test('EPFO non-JSON content types fail before interpreting or echoing the body', async t => {
  for (const status of [200, 401, 403, 429, 504]) await t.test(`HTTP ${status}: HTML`, async () => {
    const response = await epfoAnalyzed(null, status, { contentType: 'text/html', raw: HOSTILE_EPFO_MESSAGE, retryAfter: '60' });
    assert.deepEqual(response, { ok: false, error: 'The backend returned a non-JSON response.' });
  });
  for (const contentType of [null, 'text/plain']) await t.test(`JSON body with ${contentType || 'missing'} content type`, async () => {
    const response = await epfoAnalyzed(epfoErrorAnalysis(), 503, { contentType });
    assert.deepEqual(response, { ok: false, error: 'The backend returned a non-JSON response.' });
  });
  await t.test('JSON with charset retains the validated envelope', async () => {
    const data = epfoErrorAnalysis();
    assert.deepEqual(await epfoAnalyzed(data, 503, { contentType: 'application/json; charset=utf-8' }), { ok: true, data, status: 503 });
  });
  await t.test('invalid JSON does not echo the raw response', async () => {
    const response = await epfoAnalyzed(null, 504, { raw: HOSTILE_EPFO_MESSAGE });
    assert.deepEqual(response, { ok: false, error: 'The backend returned invalid JSON.' });
  });
});

test('PRIVACY_OPEN clears legacy inputs before opening only the trusted local preview', async () => {
  const h = harness({ session: { epfoConnection: { connected: true, capabilities: EPFO_CAPABILITIES } } });
  await captured(h);
  h.resetCalls();
  h.hooks.createWindow = request => {
    const stored = h.session().formAssistant;
    assert.deepEqual(stored.profile, { name: '', email: '', phone: '', address: '' });
    assert.equal(stored.key, '');
    assert.equal(stored.file, null);
    assert.equal(stored.scan, null);
    assert.equal(h.session().epfoConnection, undefined);
    assert.deepEqual(plain(request), { url: `chrome-extension://${EXTENSION_ID}/privacy/privacy.html`, type: 'popup', width: 500, height: 760 });
    return { id: 70 };
  };
  assert.deepEqual(await h.send('PRIVACY_OPEN'), { ok: true });
  assert.deepEqual(h.calls.map(call => call.name), ['sendMessage', 'remove', 'set', 'query', 'createWindow']);
  assert.deepEqual(h.of('sendMessage')[0].args, [TAB.id, { type: 'SS_RESET' }, { documentId: DOCUMENT_ID }]);
  assert.deepEqual(h.of('query')[0].args, [{ active: true, currentWindow: true }]);
  assert.equal(h.of('createWindow').length, 1);
  assert.equal(h.timers.size, 1);
  const state = successful(await h.send('SS_GET'));
  cleared(h, state);
  assert.equal(h.timers.size, 0);
  // A subsequent save proves busy was released and empty inputs cannot reuse old secrets.
  cleared(h, await saved(h, { profile: state.profile, key: '', file: null }));
  for (const name of ['fetch', 'captureVisibleTab', 'executeScript']) assert.equal(h.of(name).length, 0);
  assert.equal(h.fills().length, 0);
});

for (const type of ['SS_GET', 'SS_EPFO_CANCEL', 'SS_CLEAR']) test(`${type} invalidates PRIVACY_OPEN pending cleanup or storage without opening a window`, async () => {
  for (const phase of ['sendMessage', 'remove', 'set']) {
    const h = harness();
    await captured(h);
    h.resetCalls();
    const started = deferred();
    const pending = deferred();
    let first = true;
    h.hooks[phase] = (...args) => {
      if (phase === 'sendMessage') assert.equal(args[1].type, 'SS_RESET');
      if (!first) return phase === 'sendMessage' ? { reset: true } : undefined;
      first = false;
      started.resolve();
      return pending.promise;
    };
    const opening = h.send('PRIVACY_OPEN');
    await started.promise;
    assert.equal(h.of('createWindow').length, 0, phase);
    const action = h.send(type);
    // Clear may queue behind the suspended write/cleanup; let it invalidate first.
    await new Promise(resolve => setImmediate(resolve));
    pending.resolve(phase === 'sendMessage' ? { reset: true } : undefined);
    const result = await action;
    assert.equal(result.ok, true, `${type} during ${phase}: ${result.error}`);
    if (type === 'SS_EPFO_CANCEL') assert.deepEqual(result.data, { cancelled: true });
    failed(await opening, /Privacy capture requires an idle extension/);
    const state = successful(await h.send('SS_GET'));
    cleared(h, state);
    assert.equal(h.session().epfoConnection, undefined);
    // The rejected opening must release busy and never restore legacy credentials.
    cleared(h, await saved(h, { profile: state.profile, key: '', file: null }));
    for (const name of ['query', 'createWindow', 'fetch', 'captureVisibleTab', 'executeScript']) assert.equal(h.of(name).length, 0, `${type} during ${phase}: ${name}`);
    assert.equal(h.fills().length, 0);
    assert.equal(h.timers.size, 0);
  }
});

test('a concurrent form action cancels a pending privacy window and cannot leave stale state or busy locked', async () => {
  const h = harness();
  await captured(h);
  h.resetCalls();
  const started = deferred();
  const pending = deferred();
  h.hooks.createWindow = () => { started.resolve(); return pending.promise; };
  const opening = h.send('PRIVACY_OPEN');
  await started.promise;
  failed(await h.send('SS_SAVE', { profile: PROFILE, key: KEY, model: 'gpt-4o-mini', file: FILE }), /operation is already running/);
  pending.resolve({ id: 70 });
  failed(await opening, /Privacy capture requires an idle extension/);
  assert.equal(h.of('createWindow').length, 1);
  assert.deepEqual(h.of('removeWindow').map(call => call.args), [[70]]);
  const state = successful(await h.send('SS_GET'));
  cleared(h, state);
  cleared(h, await saved(h, { profile: state.profile, key: '', file: null }));
  assert.equal(h.timers.size, 0);
  for (const name of ['fetch', 'captureVisibleTab', 'executeScript']) assert.equal(h.of(name).length, 0);
  assert.equal(h.fills().length, 0);
});

test('SS_SAVE and SS_GET return only file metadata and hasKey, while trusted session retains inputs', async () => {
  const h = harness();
  const state = await saved(h);
  assert.deepEqual(state.profile, PROFILE);
  assert.deepEqual(state.file, { name: FILE.name, type: FILE.type, size: FILE.size });
  assert.equal(state.hasKey, true);
  privateStateAbsent(state);
  const stored = h.session().formAssistant;
  assert.equal(stored.key, KEY);
  assert.deepEqual(stored.file, FILE);
  assert.equal(h.of('fetch').length, 0);
  assert.equal(h.of('query').length, 0);
  assert.equal(h.of('executeScript').length, 0);
  h.resetCalls();
  assert.deepEqual(successful(await h.send('SS_GET')), state);
  assert.deepEqual(h.calls, []);
  privateStateAbsent(await saved(h, { key: '', file: undefined }));
  assert.equal(h.session().formAssistant.key, KEY);
  assert.deepEqual(h.session().formAssistant.file, FILE);
});

test('saving over a scan resets its content snapshot before session storage changes', async () => {
  const h = harness();
  await captured(h);
  h.resetCalls();
  await saved(h, { profile: { ...PROFILE, name: 'Updated Name' } });
  assert.deepEqual(h.calls.map(call => call.name), ['sendMessage', 'set']);
  assert.equal(h.of('sendMessage')[0].args[1].type, 'SS_RESET');
});

test('save preserves the prior scan reference when content cleanup is not confirmed', async () => {
  const h = harness();
  await captured(h);
  h.resetCalls();
  h.hooks.sendMessage = () => ({ reset: false });
  failed(await h.send('SS_SAVE', { profile: PROFILE, key: KEY, model: 'gpt-4o-mini', file: FILE }), /previous scan could not be cleared/);
  assert.equal(h.session().formAssistant.scan.documentId, DOCUMENT_ID);
  assert.equal(h.of('set').length, 0);
});

test('SS_SCAN explicitly injects content, targets the injected document, and captures a screenshot without network or fills', async () => {
  const h = harness();
  await h.ready();
  h.resetCalls();
  const state = successful(await h.send('SS_SCAN'));
  assert.equal(state.stage, 'captured');
  assert.deepEqual(state.scan.fields, FIELDS);
  assert.deepEqual(state.scan.warnings, h.captured.warnings);
  assert.equal(state.scan.site, new URL(TAB.url).origin);
  assert.equal(state.scan.screenshot, SCREENSHOT);
  assert.equal(Object.hasOwn(state.scan, 'token'), false);
  assert.equal(Object.hasOwn(state.scan, 'url'), false);
  assert.deepEqual(h.of('sendMessage')[0].args, [TAB.id, { type: 'SS_SCAN' }, { documentId: DOCUMENT_ID }]);
  assert.deepEqual(h.of('captureVisibleTab')[0].args, [TAB.windowId, { format: 'jpeg', quality: 50 }]);
  assert.deepEqual(h.calls.map(call => call.name), ['query', 'executeScript', 'sendMessage', 'captureVisibleTab', 'set']);
  for (const call of h.of('query')) assert.deepEqual(call.args, [{ active: true, lastFocusedWindow: true }]);
  assert.equal(h.session().formAssistant.scan.documentId, DOCUMENT_ID);
  assert.equal(h.session().formAssistant.scan.token, h.captured.token);
  assert.equal(h.of('fetch').length, 0);
  assert.equal(h.fills().length, 0);
  h.resetCalls();
  successful(await h.send('SS_GET'));
  assert.deepEqual(h.calls, []);
});

test('SS_SCREENSHOT recaptures the visible tab on the current scan without a new injection', async () => {
  const h = harness();
  await captured(h);
  h.resetCalls();
  const next = 'data:image/jpeg;base64,cmVjYXB0dXJlZA==';
  h.hooks.captureVisibleTab = () => next;
  const state = successful(await h.send('SS_SCREENSHOT'));
  assert.equal(state.stage, 'captured');
  assert.equal(state.scan.screenshot, next);
  assert.deepEqual(h.of('captureVisibleTab')[0].args, [TAB.windowId, { format: 'jpeg', quality: 50 }]);
  assert.equal(h.of('executeScript').filter((call) => call.args[0].files).length, 0);
  assert.equal(h.of('fetch').length, 0);
});

test('switching scan targets resets the previous document before injecting the replacement', async () => {
  const h = harness();
  await captured(h);
  h.resetCalls();
  h.tab = { id: 52, windowId: 8, url: 'https://other.example.invalid/form' };
  h.documentId = 'synthetic-document-52';
  h.documentUrl = h.tab.url;
  h.captured = { ...h.captured, token: 'replacement-token', url: h.tab.url };
  h.hooks.executeScript = request => request.files
    ? [{ frameId: 0, documentId: h.documentId }]
    : [{ frameId: 0, documentId: h.documentId, result: h.documentUrl }];
  h.hooks.sendMessage = (tabId, message, target) => {
    if (message.type === 'SS_RESET') {
      assert.equal(tabId, TAB.id);
      assert.deepEqual(plain(target), { documentId: DOCUMENT_ID });
      return { reset: true };
    }
    assert.equal(message.type, 'SS_SCAN');
    assert.equal(tabId, h.tab.id);
    return plain(h.captured);
  };
  successful(await h.send('SS_SCAN'));
  assert.deepEqual(h.calls.slice(0, 3).map(call => [call.name, call.args[1]?.type]), [['query', undefined], ['sendMessage', 'SS_RESET'], ['executeScript', undefined]]);
  assert.equal(h.session().formAssistant.scan.documentId, h.documentId);
});

test('scan rejects unsupported pages, missing document IDs, and invalid content replies', async t => {
  const cases = [
    ['restricted URL', h => { h.tab.url = 'chrome://settings'; }, /Open a normal/],
    ['no active tab', h => { h.hooks.query = () => []; }, /Open a normal/],
    ['missing document ID', h => { h.hooks.executeScript = () => [{ frameId: 0 }]; }, /could not be read/],
    ['missing token', h => { h.captured.token = null; }, /could not be read/]
  ];
  for (const [name, setup, pattern] of cases) await t.test(name, async () => {
    const h = harness();
    setup(h);
    failed(await h.send('SS_SCAN'), pattern);
    assert.equal(successful(await h.send('SS_GET')).scan, null);
    assert.equal(h.of('captureVisibleTab').length, 0);
    assert.equal(h.of('fetch').length, 0);
    assert.equal(h.fills().length, 0);
  });
});

test('scan keeps a screenshot when the page has no ordinary form fields', async () => {
  const h = harness();
  h.captured.fields = [];
  const state = successful(await h.send('SS_SCAN'));
  assert.equal(state.stage, 'captured');
  assert.deepEqual(state.scan.fields, []);
  assert.equal(state.scan.screenshot, SCREENSHOT);
  assert.ok(state.scan.warnings.some((item) => /screenshot is available/i.test(item)));
  assert.equal(h.of('captureVisibleTab').length, 1);
});

test('SS_ANALYZE requires strict consent, a scan, and a saved key before any fetch', async t => {
  for (const consent of [false, undefined, 'true', 1]) await t.test(`consent ${String(consent)}`, async () => {
    const h = harness();
    await captured(h);
    h.resetCalls();
    failed(await h.send('SS_ANALYZE', { consent }), /Approve sending/);
    assert.deepEqual(h.calls, []);
  });
  await t.test('missing scan', async () => {
    const h = harness();
    await saved(h);
    failed(await h.send('SS_ANALYZE', { consent: true }), /Scan and review/);
    assert.equal(h.of('fetch').length, 0);
  });
  await t.test('missing key uses the local profile instead of a provider key', async () => {
    const h = harness();
    await captured(h, { key: '' });
    h.resetCalls();
    const state = successful(await h.send('SS_ANALYZE', { consent: true }));
    assert.equal(state.stage, 'review');
    assert.ok(state.plan.length > 0);
    assert.equal(h.of('fetch').length, 0);
  });
});

test('analysis sends fields/profile and optional screenshot only to the fixed endpoint; valid maps stop at review', async t => {
  for (const includeScreenshot of [false, true]) await t.test(`screenshot ${includeScreenshot}`, async () => {
    const h = harness();
    await captured(h);
    h.reply([item(), cityItem(), fileItem()]);
    h.resetCalls();
    const state = successful(await h.send('SS_ANALYZE', { consent: true, includeScreenshot, endpoint: 'https://attacker.invalid/' }));
    assert.equal(h.of('fetch').length, 1);
    const [url, init] = h.of('fetch')[0].args;
    assert.equal(url, ENDPOINT);
    assert.equal(init.method, 'POST');
    assert.deepEqual(init.headers, { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` });
    assert.equal(init.credentials, 'omit');
    assert.equal(init.redirect, 'error');
    assert.equal(init.cache, 'no-store');
    const body = JSON.parse(init.body);
    assert.equal(body.model, 'gpt-4o-mini');
    assert.deepEqual(body.response_format, { type: 'json_object' });
    assert.equal(body.messages[0].role, 'system');
    assert.equal(body.messages[1].role, 'user');
    const content = body.messages[1].content;
    assert.deepEqual(JSON.parse(content[0].text), { profile: PROFILE, file: { name: FILE.name, type: FILE.type, size: FILE.size }, fields: FIELDS });
    assert.equal(content.length, includeScreenshot ? 2 : 1);
    if (includeScreenshot) assert.deepEqual(content[1], { type: 'image_url', image_url: { url: SCREENSHOT, detail: 'low' } });
    for (const secret of [KEY, FILE.data, FILE_BYTES.toString(), TAB.url, 'page-url-marker', h.captured.token, DOCUMENT_ID, 'https://attacker.invalid/']) {
      assert.equal(init.body.includes(secret), false, `Payload leaked ${secret}`);
    }
    if (!includeScreenshot) assert.equal(init.body.includes(SCREENSHOT), false);
    assert.equal(state.stage, 'review');
    assert.equal(state.scan.screenshot, null);
    assert.equal(state.plan.length, 3);
    assert.equal(state.plan[0].selected, true);
    assert.equal(state.plan[2].selected, false);
    assert.deepEqual(state.results, []);
    privateStateAbsent(state);
    assert.equal(h.fills().length, 0, 'Analysis must never dispatch a write');
    assert.equal(h.of('captureVisibleTab').length, 0, 'Analysis uses only the reviewed capture');
    assert.equal(h.timers.size, 0);
  });
});

test('unavailable screenshot permits DOM-only analysis but cannot silently satisfy screenshot consent', async () => {
  const h = harness();
  h.hooks.captureVisibleTab = () => { throw new Error('synthetic capture failure'); };
  const state = await captured(h);
  assert.equal(state.scan.screenshot, null);
  assert.match(state.scan.warnings.join(' '), /Screenshot unavailable/);
  failed(await h.send('SS_ANALYZE', { consent: true, includeScreenshot: true }), /No screenshot/);
  assert.equal(h.of('fetch').length, 0);
  h.reply();
  assert.equal(successful(await h.send('SS_ANALYZE', { consent: true, includeScreenshot: false })).stage, 'review');
});

test('invalid JSON, incomplete model output and unknown selectors fail closed without writes', async t => {
  const cases = [
    ['invalid provider JSON', [], { raw: '{broken' }, /invalid JSON/],
    ['invalid mapping JSON', [], { content: 'not json' }, /not valid JSON/],
    ['incomplete output', [], { finishReason: 'length' }, /complete mapping/],
    ['unknown selector', [item({ selector: '#not-scanned' })], {}, /unknown or duplicate/],
    ['duplicate selector', [item(), item()], {}, /unknown or duplicate/],
    ['ungrounded value', [item({ value: 'Invented Person' })], {}, /not present in your profile/]
  ];
  for (const [name, mappings, options, pattern] of cases) await t.test(name, async () => {
    const h = harness();
    await captured(h);
    h.reply(mappings, options);
    failed(await h.send('SS_ANALYZE', { consent: true }), pattern);
    const state = successful(await h.send('SS_GET'));
    assert.equal(state.stage, 'captured');
    assert.deepEqual(state.plan, []);
    assert.equal(h.fills().length, 0);
    assert.equal(h.timers.size, 0);
  });
});

test('provider failures are sanitized and oversized streamed responses are cancelled without retry', async t => {
  for (const status of [400, 401, 403, 429, 500]) await t.test(`HTTP ${status}`, async () => {
    const h = harness();
    await captured(h);
    h.reply([], { status, raw: `SECRET_PROVIDER_BODY ${KEY} ${TAB.url}` });
    const response = failed(await h.send('SS_ANALYZE', { consent: true }), /LLM provider|HTTP 500/);
    assert.equal(response.error.includes('SECRET_PROVIDER_BODY'), false);
    assert.equal(response.error.includes(KEY), false);
    assert.equal(response.error.includes(TAB.url), false);
    assert.equal(h.of('fetch').length, 1);
    assert.equal(h.fills().length, 0);
    assert.equal(h.timers.size, 0);
  });
  await t.test('stream limit', async () => {
    const h = harness();
    let cancelled = false;
    await captured(h);
    h.reply([], { chunks: [new Uint8Array(128 * 1024), new Uint8Array(128 * 1024 + 1)], onCancel: () => { cancelled = true; } });
    failed(await h.send('SS_ANALYZE', { consent: true }), /safe size limit/);
    assert.equal(cancelled, true);
    assert.equal(h.fills().length, 0);
  });
});

test('SS_FILL requires explicit boolean confirmation and validated review entries', async t => {
  const cases = [
    ['missing confirmation', { entries: [{ selector: '#name', value: PROFILE.name }] }, /approve filling/],
    ['false confirmation', { confirmed: false, entries: [{ selector: '#name', value: PROFILE.name }] }, /approve filling/],
    ['string confirmation', { confirmed: 'true', entries: [{ selector: '#name', value: PROFILE.name }] }, /approve filling/],
    ['empty entries', { confirmed: true, entries: [] }, /Select at least one/],
    ['unknown selector', { confirmed: true, entries: [{ selector: 'button[type=submit]', value: 'go' }] }, /review is invalid/],
    ['duplicate selector', { confirmed: true, entries: [{ selector: '#name', value: 'A' }, { selector: '#name', value: 'B' }] }, /review is invalid/],
    ['nonstring value', { confirmed: true, entries: [{ selector: '#name', value: 12 }] }, /too long or invalid/],
    ['oversized value', { confirmed: true, entries: [{ selector: '#name', value: 'a'.repeat(2001) }] }, /too long or invalid/],
    ['unknown select option', { confirmed: true, entries: [{ selector: '#city', value: 'Unknown' }] }, /available dropdown option/],
    ['invalid file sentinel', { confirmed: true, entries: [{ selector: '#upload', value: FILE.name }] }, /saved file attachment/]
  ];
  for (const [name, payload, pattern] of cases) await t.test(name, async () => {
    const h = harness();
    await reviewed(h, [item(), cityItem(), fileItem()]);
    h.resetCalls();
    failed(await h.send('SS_FILL', payload), pattern);
    assert.deepEqual(h.calls, [], 'Invalid fills must fail before querying or contacting the page');
    assert.equal(successful(await h.send('SS_GET')).stage, 'review');
  });
});

test('analyze and fill reject changed tab, window, URL, or document before dispatch', async t => {
  const changes = [
    ['tab', h => { h.tab.id += 1; }],
    ['window', h => { h.tab.windowId += 1; }],
    ['URL', h => { h.tab.url += '#navigation'; }],
    ['document ID', h => { h.documentId = 'replacement-document'; }],
    ['document URL', h => { h.documentUrl += '#navigation'; }]
  ];
  for (const type of ['SS_ANALYZE', 'SS_FILL']) {
    for (const [name, change] of changes) await t.test(`${type}: changed ${name}`, async () => {
      const h = harness();
      if (type === 'SS_FILL') await reviewed(h);
      else await captured(h);
      change(h);
      h.resetCalls();
      failed(await h.send(type, { consent: true, confirmed: true, entries: [{ selector: '#name', value: PROFILE.name }] }), /active page changed|document changed/);
      assert.equal(h.of('fetch').length, 0);
      assert.equal(h.of('sendMessage').length, 0);
    });
  }
});

test('confirmed fill targets the original document, accepts reviewed edits, and consumes approval before dispatch', async () => {
  const h = harness();
  await reviewed(h);
  h.resetCalls();
  const entries = [{ selector: '#name', value: 'Reviewed Example' }];
  const state = successful(await h.send('SS_FILL', { confirmed: true, entries }));
  assert.equal(state.stage, 'done');
  assert.equal(state.results[0].status, 'filled');
  assert.deepEqual(state.warnings, ['Synthetic fill warning.']);
  assert.deepEqual(h.fills()[0].args, [TAB.id, { type: 'SS_FILL', token: h.captured.token, url: TAB.url, entries, file: null }, { documentId: DOCUMENT_ID }]);
  assert.deepEqual(h.calls.map(call => call.name), ['query', 'executeScript', 'set', 'sendMessage', 'set']);
  assert.equal(h.of('set')[0].args[0].formAssistant.stage, 'done');
  assert.equal(h.of('fetch').length, 0);
  privateStateAbsent(state);
  failed(await h.send('SS_FILL', { confirmed: true, entries }), /Generate a new review/);
  assert.equal(h.fills().length, 1, 'Approval cannot be replayed');
});

test('file bytes reach only explicitly selected file fills, with the sentinel converted to its filename', async () => {
  const h = harness();
  await reviewed(h, [item(), fileItem()]);
  h.resetCalls();
  const state = successful(await h.send('SS_FILL', { confirmed: true, entries: [{ selector: '#upload', value: '__ATTACH_FILE__' }] }));
  const [, message, target] = h.fills()[0].args;
  assert.deepEqual(message.entries, [{ selector: '#upload', value: FILE.name }]);
  assert.deepEqual(message.file, FILE);
  assert.deepEqual(target, { documentId: DOCUMENT_ID });
  assert.equal(h.of('fetch').length, 0);
  privateStateAbsent(state);
});

// Regression expectations deliberately fail if a reserved string is treated as a file
// for an ordinary text field. Do not mark them TODO or assert the buggy behavior.
for (const file of [null, FILE]) test(`literal __ATTACH_FILE__ in a text field remains text (${file ? 'saved file' : 'no file'})`, async () => {
  const h = harness();
  await reviewed(h, [item({ value: '__ATTACH_FILE__' })], { profile: { ...PROFILE, name: '__ATTACH_FILE__' }, file });
  h.resetCalls();
  const state = successful(await h.send('SS_FILL', { confirmed: true, entries: [{ selector: '#name', value: '__ATTACH_FILE__' }] }));
  assert.equal(state.stage, 'done');
  assert.equal(h.fills().length, 1);
  assert.deepEqual(h.fills()[0].args[1].entries, [{ selector: '#name', value: '__ATTACH_FILE__' }]);
  assert.equal(h.fills()[0].args[1].file, null);
});

test('SS_CLEAR removes sensitive session state and invalidates a completed review', async () => {
  const h = harness();
  await reviewed(h);
  h.resetCalls();
  cleared(h, successful(await h.send('SS_CLEAR')));
  assert.deepEqual(h.calls.map(call => call.name), ['sendMessage', 'remove', 'set']);
  assert.deepEqual(h.of('sendMessage')[0].args, [TAB.id, { type: 'SS_RESET' }, { documentId: DOCUMENT_ID }]);
  assert.deepEqual(h.of('remove')[0].args, ['epfoConnection']);
  failed(await h.send('SS_FILL', { confirmed: true, entries: [{ selector: '#name', value: PROFILE.name }] }), /Generate a new review/);
  failed(await h.send('SS_ANALYZE', { consent: true }), /Scan and review/);
  assert.equal(h.fills().length, 0);
  assert.equal(h.of('fetch').length, 0);
  const restarted = harness({ session: h.session() });
  cleared(restarted, await restarted.ready());
});

test('SS_CLEAR aborts pending analysis; a provider that ignores abort cannot restore its stale review', async t => {
  for (const honorAbort of [true, false]) await t.test(`provider honors abort: ${honorAbort}`, async () => {
    const h = harness();
    await captured(h);
    const started = deferred();
    const pending = deferred();
    let signal;
    h.hooks.fetch = (_url, init) => {
      signal = init.signal;
      started.resolve();
      if (honorAbort) signal.addEventListener('abort', () => pending.reject(new Error('Synthetic abort')), { once: true });
      return pending.promise;
    };
    const analysis = h.send('SS_ANALYZE', { consent: true });
    await started.promise;
    assert.equal(signal.aborted, false);
    assert.equal([...h.timers.values()][0].delay, 25000);
    // Reads and clear remain available while other actions are blocked.
    assert.equal(successful(await h.send('SS_GET')).stage, 'captured');
    failed(await h.send('SS_SCAN'), /operation is already running/);
    cleared(h, successful(await h.send('SS_CLEAR')));
    assert.equal(signal.aborted, true);
    if (!honorAbort) pending.resolve(modelResponse());
    failed(await analysis, /cancelled/);
    cleared(h, successful(await h.send('SS_GET')));
    assert.equal(h.fills().length, 0);
    assert.equal(h.of('fetch').length, 1);
    assert.equal(h.timers.size, 0);
    // Busy must be released once the cancelled operation settles.
    assert.equal((await saved(h)).hasKey, true);
  });
});

test('SS_CLEAR invalidates a pending scan so late capture cannot restore profile, key, file or scan', async () => {
  const h = harness();
  await saved(h);
  const started = deferred();
  const pending = deferred();
  h.hooks.sendMessage = (_tabId, message) => {
    assert.equal(message.type, 'SS_SCAN');
    started.resolve();
    return pending.promise;
  };
  const scan = h.send('SS_SCAN');
  await started.promise;
  cleared(h, successful(await h.send('SS_CLEAR')));
  pending.resolve(plain(h.captured));
  failed(await scan, /cancelled/);
  cleared(h, successful(await h.send('SS_GET')));
  assert.equal(h.of('captureVisibleTab').length, 0, 'Cancelled scan must not take a later screenshot');
  assert.equal(h.of('fetch').length, 0);
  assert.equal(h.fills().length, 0);
});

test('SS_CLEAR prevents an outstanding fill acknowledgement from restoring state; it does not claim to undo dispatched writes', async () => {
  const h = harness();
  await reviewed(h);
  const started = deferred();
  const pending = deferred();
  h.hooks.sendMessage = (_tabId, message) => {
    if (message.type === 'SS_RESET') return { reset: true };
    assert.equal(message.type, 'SS_FILL');
    assert.equal(h.session().formAssistant.stage, 'done');
    started.resolve();
    return pending.promise;
  };
  const fill = h.send('SS_FILL', { confirmed: true, entries: [{ selector: '#name', value: PROFILE.name }] });
  await started.promise;
  cleared(h, successful(await h.send('SS_CLEAR')));
  pending.resolve({ results: [{ selector: '#name', status: 'filled' }], warnings: [] });
  failed(await fill, /cancelled/);
  cleared(h, successful(await h.send('SS_GET')));
  assert.equal(h.fills().length, 1, 'No retry or undo should be dispatched');
});

test('SS_CLEAR during same-page validation prevents stale analysis requests and fill dispatches', async t => {
  for (const type of ['SS_ANALYZE', 'SS_FILL']) await t.test(type, async () => {
    const h = harness();
    if (type === 'SS_FILL') await reviewed(h);
    else await captured(h);
    h.resetCalls();
    const started = deferred();
    const pending = deferred();
    h.hooks.executeScript = request => {
      assert.deepEqual(plain(request.target), { tabId: TAB.id, documentIds: [DOCUMENT_ID] });
      started.resolve();
      return pending.promise;
    };
    const operation = h.send(type, { consent: true, confirmed: true, entries: [{ selector: '#name', value: PROFILE.name }] });
    await started.promise;
    cleared(h, successful(await h.send('SS_CLEAR')));
    pending.resolve([{ frameId: 0, documentId: DOCUMENT_ID, result: TAB.url }]);
    failed(await operation, /cancelled/);
    cleared(h, successful(await h.send('SS_GET')));
    assert.equal(h.of('fetch').length, 0);
    assert.equal(h.fills().length, 0);
  });
});

test('SS_CLEAR remains durable when an older session write is still pending', async t => {
  for (const type of ['SS_SAVE', 'SS_FILL']) await t.test(type, async () => {
    const h = harness();
    if (type === 'SS_FILL') await reviewed(h);
    else await h.ready();
    h.resetCalls();
    const started = deferred();
    const pending = deferred();
    let first = true;
    h.hooks.set = () => {
      if (!first) return;
      first = false;
      started.resolve();
      return pending.promise;
    };
    const payload = type === 'SS_SAVE'
      ? { profile: PROFILE, key: KEY, model: 'gpt-4o-mini', file: FILE }
      : { confirmed: true, entries: [{ selector: '#name', value: PROFILE.name }] };
    const operation = h.send(type, payload);
    await started.promise;
    const clear = h.send('SS_CLEAR');
    // Let Clear run while the earlier storage commit is paused. A correct worker
    // may queue Clear behind that write, so release it before awaiting Clear.
    await new Promise(resolve => setImmediate(resolve));
    pending.resolve();
    failed(await operation, /cancelled/);
    const state = successful(await clear);
    cleared(h, state);
    assert.equal(h.fills().length, 0, 'Clearing before persistence completes must prevent dispatch');
    assert.equal(h.of('fetch').length, 0);
    const restarted = harness({ session: h.session() });
    cleared(restarted, await restarted.ready());
  });
});
