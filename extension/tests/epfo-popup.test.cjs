'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Offline UI evidence only: unchanged production script, minimal DOM, fake runtime.
// No browser, worker, transport, HTML parser/layout, keyboard or accessibility proof.
// Clear exercises the EPFO document listener, not popup.js's Clear-session button.
const source = readFileSync(path.join(__dirname, '..', 'epfo-popup.js'), 'utf8');
const html = readFileSync(path.join(__dirname, '..', 'popup.html'), 'utf8');
const fixture = name => JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'docs', 'examples', `${name}.json`), 'utf8'));
const plain = value => JSON.parse(JSON.stringify(value));
const tick = () => new Promise(resolve => setImmediate(resolve));
const response = (data, status = 200) => ({ ok: true, data, status });
const metadata = [
  ['en', 'English', 'English'], ['hi', 'Hindi', 'हिन्दी'], ['kn', 'Kannada', 'ಕನ್ನಡ'],
  ['ta', 'Tamil', 'தமிழ்'], ['te', 'Telugu', 'తెలుగు'], ['ml', 'Malayalam', 'മലയാളം']
].map(([code, name, native_name]) => ({ code, name, native_name, quality_verified: false }));
const capabilities = (languages = metadata, available = true) => response({
  schema_version: '1.0', default_language: 'en', languages, analysis_available: available
});
function deferred() {
  let resolve;
  const promise = new Promise(yes => { resolve = yes; });
  return { promise, resolve };
}

class Target {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  dispatchEvent(event) {
    const handlers = this.listeners.get(event.type) || [];
    assert.ok(handlers.length, `No production listener for ${event.type}`);
    return Promise.all(handlers.map(callback => callback({ ...event, target: this })));
  }
}
class Element extends Target {
  constructor(tag, forbidden) {
    super();
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.disabled = false;
    this.hidden = false;
    this.checked = false;
    this._text = '';
    this._value = '';
    this.forbidden = forbidden;
  }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this._text = value == null ? '' : String(value); this.children = []; }
  get childElementCount() { return this.children.length; }
  get value() { return this._value; }
  set value(value) {
    const string = String(value);
    this._value = this.tagName !== 'SELECT' || this.children.some(child => child.value === string) ? string : '';
  }
  append(...children) {
    assert.ok(children.every(child => child instanceof Element), 'Harness supports element children only');
    const wasEmpty = this.children.length === 0;
    this.children.push(...children);
    if (this.tagName === 'SELECT' && wasEmpty) this._value = this.children[0]?.value || '';
  }
  replaceChildren(...children) {
    this.children = []; this._text = '';
    if (this.tagName === 'SELECT') this._value = '';
    this.append(...children);
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  set innerHTML(_) { this.forbidden('innerHTML'); }
  set outerHTML(_) { this.forbidden('outerHTML'); }
  insertAdjacentHTML() { this.forbidden('insertAdjacentHTML'); }
}
function harness(t, live = true) {
  const violations = [], calls = [], replies = new Map(), elements = new Map();
  const forbidden = name => { violations.push(name); throw new Error(`Forbidden test operation: ${name}`); };
  // Read control tags/boolean defaults from the actual popup, not a synthetic page.
  // This deliberately narrow extraction is not a general-purpose HTML parser.
  for (const match of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*\bid="(epfo-[^"]+)"[^>]*)>/g)) {
    assert.ok(!elements.has(match[3]), 'Duplicate EPFO ID in popup.html');
    const element = new Element(match[1], forbidden);
    element.disabled = /\sdisabled(?:\s|$)/.test(match[2]);
    element.hidden = /\shidden(?:\s|$)/.test(match[2]);
    elements.set(match[3], element);
  }
  const get = name => {
    const element = elements.get(`epfo-${name}`);
    assert.ok(element, `Missing actual popup element: ${name}`);
    return element;
  };
  const initialOption = new Element('option', forbidden);
  initialOption.textContent = 'No candidates detected';
  get('candidates').append(initialOption);
  const document = new Target();
  document.getElementById = id => elements.get(id) || null;
  document.createElement = tag => new Element(tag, forbidden);
  const chrome = live ? { runtime: { id: 'synthetic-popup-test', sendMessage: async message => {
    calls.push(plain(message));
    const queue = replies.get(message.type);
    if (!queue?.length) return forbidden(`Unconfigured synthetic reply: ${message.type}`);
    return plain(await queue.shift());
  } } } : undefined;
  const context = vm.createContext({ document, chrome, URL, TextEncoder,
    fetch: () => forbidden('fetch'), XMLHttpRequest: function () { forbidden('XMLHttpRequest'); },
    WebSocket: function () { forbidden('WebSocket'); }
  });
  vm.runInContext(source, context, { filename: 'epfo-popup.js', timeout: 1000 });
  t.after(() => {
    assert.deepEqual(violations, [], 'No HTML sinks, direct network or unexpected runtime calls');
    for (const [type, queue] of replies) assert.equal(queue.length, 0, `Unused synthetic replies: ${type}`);
  });
  return {
    get, calls, document,
    reply(type, value) {
      if (!replies.has(type)) replies.set(type, []);
      replies.get(type).push(value);
    },
    async fire(name, type = 'click', value) {
      const element = get(name);
      assert.equal(element.disabled, false, `${name} must be enabled for a UI interaction`);
      if (value !== undefined) element[name === 'consent' ? 'checked' : 'value'] = value;
      await element.dispatchEvent({ type });
      await tick(); // Analyze's listener starts run() without returning its promise.
    }
  };
}
const nodes = root => [root, ...root.children.flatMap(nodes)];
const contents = h => h.get('results').textContent;
const analyses = h => h.calls.filter(call => call.type === 'SS_EPFO_ANALYZE');
function empty(h) {
  assert.equal(h.get('results').hidden, true);
  assert.equal(h.get('results').childElementCount, 0);
}
async function connect(h, data = capabilities()) {
  h.reply('SS_EPFO_CAPABILITIES', data);
  await h.fire('connect');
}
async function review(h, remark = 'SYNTHETIC reviewed rejection remark', language = 'en') {
  await h.fire('remark', 'input', remark);
  if (h.get('language').value !== language) await h.fire('language', 'change', language);
  await h.fire('consent', 'change', true);
}
async function analyze(h, data, status = data.status === 'error' ? 503 : 200) {
  if (h.get('language').value !== data.language) await h.fire('language', 'change', data.language);
  await h.fire('consent', 'change', true);
  h.reply('SS_EPFO_ANALYZE', response(data, status));
  await h.fire('analyze');
}

test('startup makes no EPFO runtime/network calls; unavailable runtime fails closed', async t => {
  const h = harness(t);
  await tick();
  assert.deepEqual(h.calls, []);
  empty(h);
  assert.equal(h.get('remark').disabled, false);
  for (const name of ['language', 'candidates', 'consent', 'analyze', 'cancel']) assert.equal(h.get(name).disabled, true);
  const offline = harness(t, false);
  for (const name of ['remark', 'detect', 'connect', 'consent', 'analyze']) assert.equal(offline.get(name).disabled, true);
  assert.match(offline.get('status').textContent, /runtime unavailable/);
  assert.deepEqual(offline.calls, []);
});

test('connect, candidate choice, edit and consent never analyze; explicit Analyze sends only reviewed text', async t => {
  const h = harness(t);
  await connect(h);
  h.reply('SS_EPFO_DETECT', response({ candidates: [
    { text: 'SYNTHETIC raw candidate one', source: 'selection' },
    { text: 'SYNTHETIC raw candidate two', source: 'table', url: 'https://example.invalid/private' }
  ], warnings: ['SYNTHETIC detection warning'] }));
  await h.fire('detect');
  assert.equal(h.get('remark').value, '');
  await h.fire('candidates', 'change', '1');
  assert.equal(h.get('remark').value, 'SYNTHETIC raw candidate two');
  assert.equal(h.get('consent').checked, false);
  await h.fire('consent', 'change', true);
  const reviewed = '  SYNTHETIC edited remark only\nNo page metadata.  ';
  await h.fire('remark', 'input', reviewed);
  assert.equal(h.get('candidates').value, '');
  assert.equal(h.get('consent').checked, false);
  assert.equal(h.get('analyze').disabled, false);
  await h.fire('consent', 'change', true);
  assert.deepEqual(h.calls, [{ type: 'SS_EPFO_CAPABILITIES' }, { type: 'SS_EPFO_DETECT' }]);
  h.reply('SS_EPFO_ANALYZE', response(fixture('success')));
  await h.fire('analyze');
  assert.deepEqual(analyses(h), [{ type: 'SS_EPFO_ANALYZE', payload: { text: reviewed, language: 'en', consent: true } }]);
  assert.equal(h.get('consent').checked, false);
  assert.equal(h.get('analyze').disabled, false);
});

test('detection preserves an existing preview until an explicit candidate replaces it', async t => {
  const h = harness(t);
  await connect(h);
  const preview = '  SYNTHETIC manually reviewed remark\nKeep exact spacing.  ';
  await review(h, preview);
  const pending = deferred();
  h.reply('SS_EPFO_DETECT', pending.promise);
  const detection = h.fire('detect');
  await tick();
  assert.equal(h.get('remark').value, preview);
  assert.equal(h.get('consent').checked, false);
  pending.resolve(response({ candidates: [{ text: 'SYNTHETIC detected replacement', source: 'selection' }], warnings: [] }));
  await detection;
  assert.equal(h.get('remark').value, preview);
  assert.equal(h.get('candidates').value, '');
  assert.match(h.get('status').textContent, /existing remark was kept/i);
  await h.fire('candidates', 'change', '0');
  assert.equal(h.get('remark').value, 'SYNTHETIC detected replacement');
  await h.fire('candidates', 'change', '');
  assert.equal(h.get('remark').value, 'SYNTHETIC detected replacement');
  assert.equal(analyses(h).length, 0);
});

test('empty, multiple and failed detections do not erase the reviewed preview', async t => {
  const h = harness(t);
  const preview = 'SYNTHETIC existing remark';
  await h.fire('remark', 'input', preview);
  for (const result of [
    response({ candidates: [], warnings: ['No safe candidate'] }),
    response({ candidates: [{ text: 'SYNTHETIC first', source: 'table' }, { text: 'SYNTHETIC second', source: 'table' }], warnings: [] }),
    { ok: false, error: 'Restricted page' }
  ]) {
    h.reply('SS_EPFO_DETECT', result);
    await h.fire('detect');
    assert.equal(h.get('remark').value, preview);
    assert.equal(h.get('consent').checked, false);
    assert.equal(h.get('analyze').disabled, true);
  }
  assert.equal(analyses(h).length, 0);
});

test('one detected candidate still populates an empty preview', async t => {
  const h = harness(t);
  h.reply('SS_EPFO_DETECT', response({ candidates: [{ text: 'SYNTHETIC only candidate', source: 'selection' }], warnings: [] }));
  await h.fire('detect');
  assert.equal(h.get('remark').value, 'SYNTHETIC only candidate');
  assert.equal(h.get('candidates').value, '0');
  assert.equal(h.get('consent').checked, false);
  assert.equal(analyses(h).length, 0);
});

test('editing during detection invalidates a late candidate without losing the new text', async t => {
  const h = harness(t);
  const pending = deferred();
  h.reply('SS_EPFO_DETECT', pending.promise);
  const detection = h.fire('detect');
  await tick();
  h.reply('SS_EPFO_CANCEL', response({ cancelled: true }));
  await h.fire('remark', 'input', 'SYNTHETIC new edit while detecting');
  pending.resolve(response({ candidates: [{ text: 'SYNTHETIC stale candidate', source: 'selection' }], warnings: [] }));
  await detection;
  assert.equal(h.get('remark').value, 'SYNTHETIC new edit while detecting');
  assert.equal(h.get('candidates').disabled, true);
  assert.equal(h.get('consent').checked, false);
});

test('capabilities populate actual names/native names and reduced enabled sets without quality claims', async t => {
  const h = harness(t);
  await connect(h);
  assert.deepEqual(h.get('language').children.map(option => option.value), metadata.map(item => item.code));
  assert.deepEqual(h.get('language').children.map(option => option.textContent), metadata.map(item => `${item.name} · ${item.native_name} (${item.code})`));
  assert.equal(h.get('language').value, 'en');
  assert.match(h.get('readiness').textContent, /not verified model connectivity/);
  await review(h);
  await h.fire('language', 'change', 'kn');
  assert.equal(h.get('consent').checked, false);
  await connect(h, capabilities([metadata[0], metadata[2]], false));
  assert.deepEqual(h.get('language').children.map(option => option.value), ['en', 'kn']);
  assert.match(h.get('readiness').textContent, /analysis_available: false/);
  assert.equal(analyses(h).length, 0);
});

for (const state of ['success', 'needs_clarification', 'unsupported', 'error']) {
  test(`SYNTHETIC docs/examples/${state}.json renders through registered Analyze event`, async t => {
    const h = harness(t);
    await connect(h);
    await review(h);
    if (state !== 'success') {
      await analyze(h, fixture('success'));
      assert.ok(contents(h).includes(fixture('success').draft.title));
    }
    const data = fixture(state);
    await analyze(h, data);
    assert.equal(h.get('results').hidden, false);
    assert.ok(contents(h).includes(`Result: ${state} · HTTP ${state === 'error' ? 503 : 200}`));
    for (const warning of data.warnings) assert.ok(contents(h).includes(warning));
    for (const question of data.questions) assert.ok(contents(h).includes(question));
    if (state === 'success') {
      for (const block of [...data.explanation, ...data.actions, ...data.required_documents, ...data.draft.blocks]) assert.ok(contents(h).includes(block.text));
      for (const field of [data.classification.reason_id, data.classification.rationale, data.draft.title, ...data.draft.missing_fields, data.citations[0].path, data.citations[0].heading, 'Supporting document', 'Lines 1–1']) assert.ok(contents(h).includes(field));
      const links = nodes(h.get('results')).filter(node => node.tagName === 'A');
      assert.equal(links.length, 4, 'Each cited explanation/action/document/draft block has its own source link');
      for (const link of links) {
        assert.equal(link.href, data.citations[0].source_urls[0]);
        assert.equal(link.target, '_blank');
        assert.equal(link.rel, 'noopener noreferrer');
        assert.equal(link.referrerPolicy, 'no-referrer');
      }
    } else {
      for (const title of ['Classification', 'Explanation', 'Actions', 'Required documents', 'Draft:']) assert.ok(!contents(h).includes(title));
      assert.ok(!contents(h).includes(fixture('success').draft.title));
      assert.equal(nodes(h.get('results')).filter(node => node.tagName === 'A').length, 0);
    }
    if (data.error) {
      assert.equal(h.get('error').hidden, false);
      assert.equal(h.get('error').textContent, `${data.error.code}: ${data.error.message}`);
    }
  });
}

test('hostile HTML is literal text in result fields, questions and errors, never parsed into elements', async t => {
  const h = harness(t);
  await connect(h);
  await review(h);
  const hostile = '<img src=x onerror="globalThis.pwned=1"><script>globalThis.pwned=1</script>';
  const data = fixture('success');
  data.classification.rationale = hostile;
  data.explanation[0].text = hostile; data.actions[0].text = hostile;
  data.required_documents[0].text = hostile; data.draft.blocks[0].text = hostile;
  data.draft.title = hostile; data.draft.missing_fields = [hostile];
  data.warnings = [hostile]; data.citations[0].heading = hostile;
  await analyze(h, data);
  assert.ok(nodes(h.get('results')).filter(node => !node.children.length && node.textContent.includes(hostile)).length >= 10);
  assert.equal(nodes(h.get('results')).some(node => ['IMG', 'SCRIPT'].includes(node.tagName)), false);
  const clarification = fixture('needs_clarification'); clarification.questions = [hostile];
  await analyze(h, clarification);
  assert.ok(contents(h).includes(hostile));
  const error = fixture('error'); error.error.message = hostile;
  await analyze(h, error);
  assert.ok(h.get('error').textContent.includes(hostile));
});

test('unsafe source URLs and non-public citation paths are omitted; valid record and columns render', async t => {
  const h = harness(t);
  await connect(h); await review(h);
  const data = fixture('success'), citation = data.citations[0];
  citation.record_id = 'epfo-rr-001'; citation.start_column = 0; citation.end_column = 10;
  const unsafe = ['javascript:alert(1)', 'data:text/html,hello', 'file:///tmp/test', 'chrome-extension://test/a', '//example.invalid/a', 'https://user:pass@example.invalid/', 'https://example.invalid/a b', 'https://example.invalid/\nfoo', 'https://example.invalid\\evil', 'https://'];
  citation.source_urls.push(...unsafe);
  await analyze(h, data);
  assert.ok(contents(h).includes('Record: epfo-rr-001'));
  assert.ok(contents(h).includes('Columns 0–10 (zero-based)'));
  assert.equal(nodes(h.get('results')).filter(node => node.textContent === 'Unsafe original source URL omitted.').length, unsafe.length * 4);
  assert.ok(nodes(h.get('results')).filter(node => node.tagName === 'A').every(link => link.href === citation.source_urls[0]));
  citation.path = 'references/knowledge/epfo/../private.md';
  await analyze(h, data);
  assert.ok(contents(h).includes('Citation unavailable or outside the public EPFO knowledge root.'));
  assert.equal(nodes(h.get('results')).filter(node => node.tagName === 'A').length, 0);
});

for (const state of ['needs_clarification', 'unsupported', 'error']) {
  test(`non-success ${state} suppresses even injected guidance fields from fake runtime`, async t => {
    const h = harness(t);
    await connect(h); await review(h); await analyze(h, fixture('success'));
    // Deliberately malformed runtime reply: defense in depth, not a backend-valid fixture.
    const data = { ...fixture('success'), ...fixture(state) };
    for (const key of ['classification', 'explanation', 'actions', 'required_documents', 'draft', 'citations']) data[key] = fixture('success')[key];
    await analyze(h, data);
    assert.ok(!contents(h).includes(fixture('success').actions[0].text));
    assert.ok(!contents(h).includes(fixture('success').draft.title));
    assert.equal(nodes(h.get('results')).filter(node => node.tagName === 'A').length, 0);
  });
}

test('edit cancels analysis, blocks new work until acknowledgement, and ignores late success', async t => {
  const h = harness(t), pending = deferred(), cancelled = deferred();
  await connect(h); await review(h);
  h.reply('SS_EPFO_ANALYZE', pending.promise);
  await h.fire('analyze');
  assert.equal(h.get('panel').getAttribute('aria-busy'), 'true');
  assert.equal(h.get('remark').disabled, false);
  h.reply('SS_EPFO_CANCEL', cancelled.promise);
  await h.fire('remark', 'input', 'SYNTHETIC newer edited remark');
  empty(h);
  assert.equal(h.get('consent').checked, false);
  for (const name of ['detect', 'connect', 'analyze', 'consent']) assert.equal(h.get(name).disabled, true);
  cancelled.resolve(response({ cancelled: true })); await tick();
  await analyze(h, fixture('unsupported'));
  const newerOutput = contents(h);
  pending.resolve(response(fixture('success'))); await tick();
  assert.equal(contents(h), newerOutput);
  assert.equal(h.get('remark').value, 'SYNTHETIC newer edited remark');
  assert.equal(h.calls.filter(call => call.type === 'SS_EPFO_CANCEL').length, 1);
  assert.equal(h.get('panel').getAttribute('aria-busy'), 'false');
});

test('session-clearing event erases EPFO state and late results cannot restore it', async t => {
  const h = harness(t), pending = deferred();
  await connect(h); await review(h); await analyze(h, fixture('success'));
  h.reply('SS_EPFO_ANALYZE', pending.promise);
  await h.fire('consent', 'change', true); await h.fire('analyze');
  h.reply('SS_EPFO_CANCEL', response({ cancelled: true }));
  await h.document.dispatchEvent({ type: 'ss-session-clearing' }); await tick();
  pending.resolve(response(fixture('success'))); await tick();
  empty(h);
  assert.equal(h.get('remark').value, '');
  assert.equal(h.get('language').children.length, 0);
  assert.equal(h.get('candidates').value, '');
  assert.equal(h.get('consent').checked, false);
  for (const name of ['readiness', 'detection-warnings', 'error']) assert.equal(h.get(name).hidden, true);
  assert.equal(h.get('analyze').disabled, true);
  assert.match(h.get('status').textContent, /already sent data cannot be recalled/);
});

test('invalid schema/status/language and unsuccessful HTTP success remove prior guidance', async t => {
  const h = harness(t);
  await connect(h); await review(h);
  for (const [patch, status] of [[{ schema_version: '2.0' }, 200], [{ status: 'unknown' }, 200], [{ language: 'kn' }, 200], [{}, 503], [{ classification: null }, 200]]) {
    await analyze(h, fixture('success'));
    h.reply('SS_EPFO_ANALYZE', response({ ...fixture('success'), ...patch }, status));
    await h.fire('consent', 'change', true); await h.fire('analyze');
    empty(h);
    assert.equal(h.get('error').hidden, false);
    assert.match(h.get('status').textContent, /Action stopped/);
  }
});
