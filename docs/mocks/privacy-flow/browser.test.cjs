'use strict';
// Uses already-installed frontend Playwright; no server, install or extension needed.
// PLAYWRIGHT_MODULE may point to an existing @playwright/test directory in another worktree.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');
const { tmpdir } = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || join(__dirname, '../../../../frontend/node_modules/@playwright/test'));
const url = pathToFileURL(join(__dirname, 'index.html')).href;

test('real Chromium synthetic flow, denial, reset, keyboard, mobile and zero HTTP requests', async (t) => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const requests = [];
    const errors = [];
    await context.route(/^https?:/, (route) => { requests.push(route.request().url()); return route.abort(); });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url);
    const el = (id) => page.locator(`#${id}`);
    await t.test('separate capture/review/Analyze and first-last never enters diagram/boundary', async () => {
      assert.equal(await el('analyze').isDisabled(), true);
      assert.equal(await el('preview').isVisible(), false);
      await el('capture').click();
      assert.equal(await el('review').isChecked(), false);
      const originalBoundary = await el('boundary').textContent();
      await el('reveal').check();
      assert.equal(await el('local-mask').textContent(), 'P***n');
      assert.equal(await el('boundary').textContent(), originalBoundary);
      assert.deepEqual(await page.locator('.preview-drawing .mask').allTextContents(), ['***', '***', '***']);
      for (const category of ['short', 'sensitive', 'unknown']) {
        await el('category').selectOption(category);
        assert.equal(await el('reveal').isDisabled(), true);
        assert.equal(await el('local-mask').textContent(), '***');
      }
      await el('review').check();
      await el('analyze').click();
      assert.equal(await el('result').isVisible(), true);
      assert.equal(await el('fill').isDisabled(), true);
      assert.equal(await el('result-heading').evaluate((node) => node === document.activeElement), true);
      await el('fill-review').check();
      await el('fill').click();
      assert.match(await el('fill-outcome').textContent(), /No real field.*manual submission has not happened/);
    });
    await t.test('mask/crop invalidation and inaccessible/blocked/restricted/unsupported cases', async () => {
      await el('scenario').selectOption('inaccessible');
      await el('capture').click();
      await el('review').check();
      await el('treatment').selectOption('crop');
      assert.equal(await el('review').isChecked(), false);
      assert.match(await el('region').textContent(), /cropped out/);
      await el('treatment').selectOption('unresolved');
      assert.equal(await el('review').isDisabled(), true);
      assert.equal(await el('analyze').isDisabled(), true);
      for (const scenario of ['blocked', 'restricted', 'unsupported']) {
        await el('scenario').selectOption(scenario);
        assert.equal(await el('capture').isDisabled(), true);
        assert.equal(await el('preview').isVisible(), false);
      }
    });
    await t.test('every mode stays not connected; mode, stale and cancel clear results', async () => {
      await el('scenario').selectOption('ready');
      for (const mode of ['remote', 'local', 'companion', 'backend']) {
        await el('capture').click();
        await el('review').check();
        await el('analyze').click();
        await el('mode').selectOption(mode);
        assert.equal(await el('result').isVisible(), false);
        assert.equal(await el('restored-name').textContent(), '');
        assert.equal(await el('preview').isVisible(), false);
        if (mode === 'local') assert.match(await el('destination').textContent(), /not inherently private/);
      }
      for (const reset of ['stale', 'cancel']) {
        await el('capture').click();
        await el('reveal').check();
        await el(reset).click();
        assert.equal(await el('preview').isVisible(), false);
        assert.equal(await el('local-mask').textContent(), '***');
        assert.equal(await el('review').isChecked(), false);
      }
    });
    await t.test('keyboard-only flow and 360px/desktop layouts', async () => {
      await page.reload();
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip').evaluate((node) => node === document.activeElement), true);
      for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
      assert.equal(await el('capture').evaluate((node) => node === document.activeElement), true);
      await page.keyboard.press('Enter');
      assert.equal(await el('preview').isVisible(), true);
      for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
      assert.equal(await el('review').evaluate((node) => node === document.activeElement), true);
      await page.keyboard.press('Space');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      assert.equal(await el('result').isVisible(), true);
      for (const width of [1280, 360]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.screenshot({ path: join(tmpdir(), `issue21-privacy-${width}.png`), fullPage: true });
      }
    });
    await t.test('no HTTP requests or script errors', () => {
      assert.deepEqual(requests, []);
      assert.deepEqual(errors, []);
    });
    await context.close();
  } finally { await browser.close(); }
});
