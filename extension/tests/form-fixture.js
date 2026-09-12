(function () {
  'use strict';
  // Test-only runtime shim. This is not the extension's real permission boundary.
  const extensionId = 'abcdefghijklmnopabcdefghijklmnop';
  let listener = null;
  const runtime = { id: extensionId, onMessage: { addListener(callback) { listener = callback; } } };
  if (!globalThis.chrome) globalThis.chrome = {};
  globalThis.chrome.runtime = runtime;
  let scan = null;
  let submitCount = 0;
  const events = [];
  const byId = id => document.getElementById(id);
  const status = message => { byId('status').textContent = message; };
  const show = value => { byId('result').textContent = JSON.stringify(value, null, 2); };
  const syntheticValues = {
    'full-name': 'Synthetic Person', email: 'synthetic@example.test', phone: '+1 202 555 0100',
    address: '100 Synthetic Street\nTest District', city: 'synthetic-city', resume: 'synthetic-resume.txt'
  };
  const text = 'Synthetic resume fixture only. No personal data.\n';
  const file = { name: syntheticValues.resume, type: 'text/plain', data: btoa(text), size: text.length };

  function send(message) {
    return new Promise((resolve, reject) => {
      if (!listener) { reject(new Error('Adapter listener is unavailable. Serve over HTTP and reload.')); return; }
      const accepted = listener(message, { id: extensionId, origin: 'chrome-extension://' + extensionId, url: 'chrome-extension://' + extensionId + '/background.js' }, resolve);
      if (accepted !== true) reject(new Error('Adapter refused the test message.'));
    });
  }

  async function capture() {
    scan = await send({ type: 'SS_SCAN' });
    show(scan);
    status(scan.token ? 'Scanned ' + scan.fields.length + ' eligible fields. Review synthetic values before filling.' : 'Scan refused. Serve on localhost HTTP.');
  }

  async function fill(mutate) {
    if (!scan?.token) { status('Scan fixture before filling.'); return; }
    const approved = scan;
    scan = null;
    if (mutate) byId('full-name').value = 'Changed after scan';
    const entries = approved.fields.filter(field => Object.hasOwn(syntheticValues, field.id)).map(field => ({ selector: field.selector, value: syntheticValues[field.id] }));
    const response = await send({ type: 'SS_FILL', token: approved.token, url: approved.url, entries, file });
    show(response);
    const counts = { filled: 0, skipped: 0, failed: 0 };
    for (const result of response.results || []) counts[result.status] += 1;
    status((mutate ? 'Mutated full name after scan. ' : '') + 'Filled: ' + counts.filled + '; skipped: ' + counts.skipped + '; failed: ' + counts.failed + '. Scan again before another attempt.');
  }

  function action(id, callback) {
    byId(id).addEventListener('click', () => Promise.resolve().then(callback).catch(() => status('Harness operation failed. Inspect local setup and scan again.')));
  }
  for (const eventName of ['input', 'change']) {
    byId('synthetic-form').addEventListener(eventName, event => {
      events.push(event.target.id + ': ' + event.type + ' bubbles=' + event.bubbles + ' composed=' + event.composed + ' isTrusted=' + event.isTrusted);
      byId('event-log').textContent = events.slice(-100).join('\n');
    });
  }
  byId('synthetic-form').addEventListener('submit', event => {
    event.preventDefault();
    submitCount += 1;
    byId('submit-count').textContent = String(submitCount);
    status('Manual submit prevented. The adapter never submits.');
  });
  action('scan-fixture', capture);
  action('fill-fixture', () => fill(false));
  action('mutate-fixture', () => fill(true));
  action('reset-fixture', async () => {
    await send({ type: 'SS_RESET' });
    scan = null;
    byId('synthetic-form').reset();
    events.length = 0;
    submitCount = 0;
    byId('submit-count').textContent = '0';
    byId('event-log').textContent = 'No events yet.';
    byId('result').textContent = 'No scan yet.';
    status('Reset. Scan fixture before filling.');
  });
})();
