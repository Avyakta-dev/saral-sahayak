'use strict';
// Real production HTML/CSS/JS in a browser; ONLY the chrome Port is synthetic.
// No extension worker, vault, source page, provider, or actual Fill is exercised.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const output = process.env.BROWSER_EVIDENCE_DIR || '/tmp/setu-issue23-browser';
const value = '<img src=x onerror=alert(1)> SYNTHETIC_PRIVATE_VALUE';
const scripts = 'English हिन्दी ಕನ್ನಡ தமிழ் తెలుగు മലയാളം';
const label = `${scripts} ${'SafeLabel'.repeat(40)}`;
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
async function setup(t, scenario = 'normal', width = 500) {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width, height: 760 } });
  const errors = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) requests.push(r.url()); });
  t.after(() => { assert.deepEqual(errors, []); assert.deepEqual(requests, []); });
  await page.clock.install();
  await page.addInitScript(({ scenario, label, value, png }) => {
    const listeners = new Set();
    const event = { addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn) };
    window.observed = { commands: [], announcements: [] };
    const emit = data => setTimeout(() => listeners.forEach(fn => fn(data)), 20);
    const port = {
      onMessage: event, onDisconnect: { addListener() {}, removeListener() {} }, disconnect() {},
      postMessage(message) {
        window.observed.commands.push(message);
        if (message.type === 'inspect') {
          if (scenario === 'pending') return;
          if (scenario === 'denied') return emit({ type: 'expired', message: `Privacy operation blocked or source changed. ${value}` });
          if (scenario === 'unavailable') return emit({ type: 'expired', message: `The local worker is unavailable. ${value}` });
          emit({ type: 'inspected', cropLimits: { width: 500, height: 760, dpr: 1 }, candidates: [{ id: 'field-a', label: scenario === 'long' ? label : 'applicant name' }] });
        }
        if (message.type === 'capture') {
          emit({ type: 'preview', preview: png, coverage: 'fully-masked', approvalTag: 'SYNTHETIC_TAG', remainingMs: 120000, slots: [{ label: 'applicant name', filled: true }] });
          // Issue 22: after preview lands, a late page-change expiry must label stale and scrub UI.
          if (scenario === 'stale') setTimeout(() => emit({ type: 'expired', message: `The source page changed. ${value}` }), 40);
        }
        if (message.type === 'review') emit({ type: 'reviewed' });
        if (message.type === 'restore') emit({ type: 'restored', title: 'Host template', remainingMs: 120000, slots: [{ slot: 'field-a', label: 'applicant name', filled: true, value }, { slot: 'empty', label: 'postal address', filled: false }] });
        if (message.type === 'fill') emit({ type: 'filled', results: [{ id: value, status: 'filled', message: value }, { status: 'skipped' }, { status: 'failed' }], warnings: [value], message: value });
      },
    };
    window.chrome = { runtime: { connect() { emit({ type: 'ready' }); return port; } } };
    // Observation only: record live-region text; never alter application state.
    document.addEventListener('DOMContentLoaded', () => new MutationObserver(() => {
      document.querySelectorAll('[role="status"], [aria-live="polite"]').forEach(node => {
        const text = node.textContent;
        if (window.observed.announcements.at(-1) !== text) window.observed.announcements.push(text);
      });
    }).observe(document.body, { childList: true, characterData: true, subtree: true }));
  }, { scenario, label, value, png });
  await page.goto(pathToFileURL(path.join(__dirname, '../../privacy/privacy.html')).href);
  await page.getByRole('button', { name: 'Inspect', exact: true }).waitFor();
  await page.waitForFunction(() => !document.getElementById('inspect').disabled);
  return page;
}
async function shot(page, name) {
  mkdirSync(output, { recursive: true });
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
}
async function focus(page, id) { assert.equal(await page.evaluate(() => document.activeElement.id), id); }
async function inspected(page) {
  await page.keyboard.press('Tab'); await focus(page, 'inspect');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.getElementById('capture').disabled);
  await focus(page, 'inspect-title');
}
async function restored(page) {
  await inspected(page);
  await shot(page, '02-inspected');
  await page.keyboard.press('Tab'); await page.keyboard.press('Space');
  for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
  await focus(page, 'capture'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.getElementById('review-check').disabled);
  await focus(page, 'preview-title'); await shot(page, '03-preview');
  await page.keyboard.press('Tab'); await focus(page, 'review-check'); await page.keyboard.press('Space');
  await page.keyboard.press('Tab'); await focus(page, 'confirm'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.getElementById('restore').disabled);
  await focus(page, 'restore-title'); await shot(page, '04-reviewed');
  await page.keyboard.press('Tab'); await focus(page, 'restore'); await page.keyboard.press('Enter');
  await page.getByText(value, { exact: false }).waitFor();
  await focus(page, 'fill-title');
}
test('keyboard-only review, local restore, consent, Fill completion; no secret announcements', async t => {
  const page = await setup(t);
  await shot(page, '01-ready');
  await restored(page); await shot(page, '05-restored');
  const checkbox = page.getByRole('checkbox', { name: 'applicant name', exact: true });
  assert.equal(await checkbox.count(), 2); // inspected (disabled) and Fill controls
  assert.equal(await page.locator('#fill-fields').getByRole('checkbox', { name: 'applicant name', exact: true }).count(), 1);
  assert.equal(await page.locator('#restored-slots img').count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Fill selected fields' }).isEnabled(), false);
  await page.keyboard.press('Tab'); await page.keyboard.press('Space');
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
  await focus(page, 'fill-confirmation'); await page.keyboard.press('Space');
  await page.keyboard.press('Tab'); await focus(page, 'fill'); await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'Local privacy session closed' }).waitFor();
  assert.match(await page.locator('#terminal-status').textContent(), /1 filled, 1 failed, 1 skipped/);
  assert.match(await page.locator('#terminal-status').textContent(), /No analysis was performed.*never clicks Submit/);
  assert.equal(await page.getByRole('button', { name: 'Close', exact: true }).evaluate(el => el === document.activeElement), true);
  assert.equal(await page.locator('input, img').count(), 0);
  const observed = await page.evaluate(() => window.observed);
  assert.deepEqual(observed.commands.map(c => c.type), ['inspect', 'capture', 'review', 'restore', 'fill']);
  assert.equal(JSON.stringify(observed).includes(value), false);
  await shot(page, '06-filled');
});
test('320 CSS-pixel reflow, long safe labels, six script samples, labelled controls and focus ring', async t => {
  const page = await setup(t, 'long', 320);
  await inspected(page);
  assert.equal(await page.getByRole('checkbox', { name: label, exact: true }).count(), 1);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#fields input').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
  for (const name of ['X', 'Y', 'Width', 'Height']) assert.equal(await page.getByRole('spinbutton', { name, exact: true }).count(), 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  for (const name of ['Analyze', 'Upload image', 'Submit']) assert.equal(await page.getByRole('button', { name, exact: true }).isEnabled(), false);
  assert.equal(await page.locator('#expiry').getAttribute('aria-live'), null);
  await shot(page, '07-narrow-long-scripts');
});
test('simulated permission denial is blocked, not expired, and raw details are not announced', async t => {
  const page = await setup(t, 'denied');
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.getByRole('heading', { name: 'Local privacy session closed' }).waitFor();
  assert.match(await page.locator('#terminal-status').textContent(), /blocked.*denied/);
  assert.doesNotMatch(await page.locator('#terminal-status').textContent(), /expired|SYNTHETIC_PRIVATE_VALUE/);
  await shot(page, '08-denied');
});
test('pending inspection is cancellable and expiry clears without retry (virtual clock)', async t => {
  for (const action of ['cancel', 'expire']) {
    const page = await setup(t, 'pending');
    await page.getByRole('button', { name: 'Inspect', exact: true }).click();
    assert.match(await page.locator('#status').textContent(), /Inspecting/);
    await focus(page, 'status'); await shot(page, `09-pending-${action}`);
    if (action === 'cancel') await page.getByRole('button', { name: 'Cancel and clear' }).click();
    else await page.clock.fastForward(120001);
    await page.getByRole('heading', { name: 'Local privacy session closed' }).waitFor();
    assert.match(await page.locator('#terminal-status').textContent(), action === 'cancel' ? /Cancelled/ : /expired/);
    assert.deepEqual(await page.evaluate(() => window.observed.commands.map(c => c.type)), ['inspect', 'cancel']);
    await shot(page, `10-${action}`);
  }
});
test('Level 2: blocked capture during inspect labels blocked chip; Analyze stays disabled; secrets scrubbed', async t => {
  const page = await setup(t, 'denied');
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.getByRole('heading', { name: 'Local privacy session closed' }).waitFor();
  assert.equal(await page.locator('main').getAttribute('data-fail-closed'), 'blocked');
  assert.match(await page.locator('.fail-closed-chip').textContent(), /Blocked capture/i);
  assert.match(await page.locator('#terminal-status').textContent(), /blocked|denied/i);
  assert.doesNotMatch(await page.locator('#terminal-status').textContent(), /SYNTHETIC_PRIVATE_VALUE|expired/i);
  assert.equal(await page.getByRole('button', { name: 'Analyze', exact: true }).count(), 0);
  assert.equal(await page.locator('input, img').count(), 0);
  await shot(page, '11-blocked-capture');
});
test('Level 2: stale page-change after preview labels stale, scrubs envelope, never enables Analyze', async t => {
  const page = await setup(t, 'stale');
  await inspected(page);
  await page.keyboard.press('Tab'); await page.keyboard.press('Space');
  for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
  await focus(page, 'capture'); await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'Local privacy session closed' }).waitFor();
  assert.equal(await page.locator('main').getAttribute('data-fail-closed'), 'stale');
  assert.match(await page.locator('.fail-closed-chip').textContent(), /Stale \/ page changed/i);
  assert.match(await page.locator('#terminal-status').textContent(), /source page changed/i);
  assert.doesNotMatch(await page.locator('body').innerText(), /SYNTHETIC_PRIVATE_VALUE|SYNTHETIC_TAG/);
  assert.equal(await page.getByRole('button', { name: 'Analyze', exact: true }).count(), 0);
  assert.equal(await page.locator('#outbound-section, #preview-image, input').count(), 0);
  const observed = await page.evaluate(() => window.observed);
  assert.deepEqual(observed.commands.map(c => c.type), ['inspect', 'capture']);
  assert.equal(JSON.stringify(observed).includes(value), false);
  await shot(page, '12-stale-page-change');
});
test('Level 2: unavailable worker during inspect labels unavailable without Analyze/upload/Submit', async t => {
  const page = await setup(t, 'unavailable');
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.getByRole('heading', { name: 'Local privacy session closed' }).waitFor();
  assert.equal(await page.locator('main').getAttribute('data-fail-closed'), 'unavailable');
  assert.match(await page.locator('.fail-closed-chip').textContent(), /^Unavailable$/);
  assert.match(await page.locator('#terminal-status').textContent(), /worker is unavailable/i);
  assert.doesNotMatch(await page.locator('#terminal-status').textContent(), /SYNTHETIC_PRIVATE_VALUE/);
  for (const name of ['Analyze', 'Upload image', 'Submit']) {
    assert.equal(await page.getByRole('button', { name, exact: true }).count(), 0);
  }
  await shot(page, '13-unavailable-worker');
});
