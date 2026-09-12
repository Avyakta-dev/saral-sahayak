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
      onMessage: { addListener: callback => { assert.equal(listener, undefined); listener = callback; } }
    },
    storage: { session: {
      setAccessLevel: async access => { record('setAccessLevel', [access]); },
      get: async key => { record('get', [key]); return plain(session); },
      set: async values => {
        // Snapshot at invocation, like Chrome serialization, but allow delayed commits.
        const snapshot = plain(values);
        record('set', [snapshot]);
        if (hooks.set) await hooks.set(snapshot);
        Object.assign(session, snapshot);
      }
    } },
    tabs: {
      query: async query => mocked('query', [query], () => [plain(h.tab)]),
      sendMessage: async (tabId, message, target) => mocked('sendMessage', [tabId, message, target], () => {
        assert.equal(tabId, TAB.id);
        assert.deepEqual(plain(target), { documentId: DOCUMENT_ID });
        if (message.type === 'SS_SCAN') return plain(h.captured);
        if (message.type === 'SS_RESET') return { ok: true };
        assert.equal(message.type, 'SS_FILL', 'Unexpected content operation');
        return { results: message.entries.map(entry => ({ selector: entry.selector, status: 'filled', message: 'Synthetic fill acknowledgement.' })), warnings: ['Synthetic fill warning.'] };
      }),
      captureVisibleTab: async (...args) => mocked('captureVisibleTab', args, () => SCREENSHOT)
    },
    scripting: { executeScript: async request => mocked('executeScript', [request], () => {
      if (request.files) {
        assert.deepEqual(plain(request), { target: { tabId: TAB.id }, files: ['content.js'] });
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
      assert.equal(url, ENDPOINT, 'Only the fixed provider endpoint is permitted');
      assert.equal(typeof hooks.fetch, 'function', 'Unexpected fetch: no offline response was configured');
      return hooks.fetch(url, init);
    },
    setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    importScripts: (...names) => {
      for (const name of names) {
        assert.ok(['mapping.js', 'epfo-background.js'].includes(name));
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
    for (const type of ['SS_GET', 'SS_SAVE', 'SS_SCAN', 'SS_ANALYZE', 'SS_FILL', 'SS_CLEAR']) {
      const request = h.dispatch({ type, payload: { consent: true, confirmed: true } }, sender);
      assert.equal(request.accepted, false, `${type} accepted ${JSON.stringify(sender)}`);
      await Promise.resolve();
      assert.equal(request.answered(), false);
    }
  }
  assert.deepEqual(h.calls, []);
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
  assert.deepEqual(h.of('captureVisibleTab')[0].args, [TAB.windowId, { format: 'jpeg', quality: 55 }]);
  assert.deepEqual(h.calls.map(call => call.name), ['query', 'executeScript', 'sendMessage', 'query', 'executeScript', 'captureVisibleTab', 'query', 'executeScript', 'set']);
  for (const call of h.of('query')) assert.deepEqual(call.args, [{ active: true, currentWindow: true }]);
  assert.equal(h.session().formAssistant.scan.documentId, DOCUMENT_ID);
  assert.equal(h.session().formAssistant.scan.token, h.captured.token);
  assert.equal(h.of('fetch').length, 0);
  assert.equal(h.fills().length, 0);
  h.resetCalls();
  successful(await h.send('SS_GET'));
  assert.deepEqual(h.calls, []);
});

test('scan rejects unsupported pages, missing document IDs, and invalid content replies', async t => {
  const cases = [
    ['restricted URL', h => { h.tab.url = 'chrome://settings'; }, /Open a normal/],
    ['no active tab', h => { h.hooks.query = () => []; }, /Open a normal/],
    ['missing document ID', h => { h.hooks.executeScript = () => [{ frameId: 0 }]; }, /stable document/],
    ['missing token', h => { h.captured.token = null; }, /could not be read/],
    ['empty fields', h => { h.captured.fields = []; }, /No supported visible fields/],
    ['navigated content', h => { h.captured.url += '#changed'; }, /navigated during scanning/]
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
  await t.test('missing key', async () => {
    const h = harness();
    await captured(h, { key: '' });
    h.resetCalls();
    failed(await h.send('SS_ANALYZE', { consent: true }), /Add your OpenAI API key/);
    assert.deepEqual(h.calls, []);
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
    const response = failed(await h.send('SS_ANALYZE', { consent: true }), /OpenAI/);
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
  assert.deepEqual(h.calls.map(call => call.name), ['sendMessage', 'set']);
  assert.deepEqual(h.of('sendMessage')[0].args, [TAB.id, { type: 'SS_RESET' }, { documentId: DOCUMENT_ID }]);
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
    if (message.type === 'SS_RESET') return { ok: true };
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
