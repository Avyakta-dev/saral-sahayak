import { test, expect } from '@playwright/test';
import { en } from '../src/lib/i18n/en';
import { hi } from '../src/lib/i18n/hi';
import { kn } from '../src/lib/i18n/kn';
import { ta } from '../src/lib/i18n/ta';
import { te } from '../src/lib/i18n/te';
import { ml } from '../src/lib/i18n/ml';
import success from '../../docs/examples/success.json' with { type: 'json' };
const dictionaries = { en, hi, kn, ta, te, ml };
const locales = ['en', 'hi', 'kn', 'ta', 'te', 'ml'] as const;
const capabilities = {
  schema_version: '1.0',
  default_language: 'en',
  languages: locales.map((code) => ({
    code,
    name: code,
    native_name: code,
    quality_verified: false,
  })),
  analysis_available: true,
  checks: {
    model_configured: true,
    model_connectivity_verified: false,
    knowledge_index_present: true,
    knowledge_structure_ready: true,
    knowledge_content_verified: false,
    agent_implemented: true,
  },
  inputs: ['text', 'image'],
  downloads_available: false,
};
const remark = 'SYNTHETIC unchanged wording';
for (const locale of locales)
  test(`all interface states in ${locale}, mixed-language content unchanged`, async ({
    page,
  }, info) => {
    const t = dictionaries[locale];
    let requests = 0;
    await page.route('**/api/v1/capabilities', (route) => route.fulfill({ json: capabilities }));
    await page.route('**/api/v1/analyze/stream', async (route) => {
      requests++;
      const body = route.request().postDataJSON();
      expect(body).toEqual({
        text: remark,
        language: 'hi',
        details: { claimant_name: null, claim_id: null, claim_type: null },
      });
      await route.fulfill({
        contentType: 'text/event-stream',
        body: `event: activity\ndata: ${JSON.stringify({ phase: 'reading', path: 'references/knowledge/epfo/reasons/epfo-rr-001.md', heading: 'Original heading', start_line: 1, end_line: 4 })}\n\nevent: result\ndata: ${JSON.stringify({ ...success, language: 'hi', explanation: [{ ...success.explanation[0], text: 'अपरिवर्तित हिंदी उत्तर' }] })}\n\n`,
      });
    });
    await page.goto('/');
    if (info.project.name === 'mobile') await page.setViewportSize({ width: 320, height: 850 });
    await page.locator('#ui-language').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { name: t.welcomeTitle, exact: true })).toBeVisible();
    expect(
      await page.locator('#welcome-title').evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return (
          element.scrollWidth <= element.clientWidth &&
          [...range.getClientRects()].every((rect) => rect.left >= 0 && rect.right <= innerWidth)
        );
      }),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath(`${locale}-landing.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: t.details, exact: true }).click();
    await expect(page.getByText(t.uiReview, { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('textbox', { name: t.yourMessage, exact: true }).press('Enter');
    await expect(page.getByRole('alert')).toHaveText(t.errorWhitespace);
    await page.locator('#output-language').selectOption('hi');
    await page.getByRole('textbox', { name: t.yourMessage, exact: true }).fill(remark);
    await page.getByRole('button', { name: t.reviewAnalysis, exact: true }).click();
    await expect(page.getByRole('dialog', { name: t.consentTitle })).toBeVisible();
    expect(requests).toBe(0);
    await page.screenshot({ path: info.outputPath(`${locale}-consent.png`), fullPage: true });
    await page.getByRole('button', { name: t.backEdit, exact: true }).click();
    await expect(page.getByRole('textbox', { name: t.yourMessage })).toBeFocused();
    await page.getByRole('button', { name: t.reviewAnalysis, exact: true }).click();
    await page.getByRole('button', { name: t.analyzeReviewed, exact: true }).click();
    const answer = page.getByRole('region', {
      name: locale === 'en' ? 'Your grounded answer' : t.liveTitle,
      exact: true,
    });
    await expect(answer).toHaveAttribute('lang', 'hi');
    await expect(page.getByText('अपरिवर्तित हिंदी उत्तर')).toBeVisible();
    await page.getByText(t.activityEvents.replace('{count}', '1'), { exact: true }).click();
    await expect(page.getByText('Original heading', { exact: true })).toHaveAttribute('lang', '');
    await page.getByRole('tab', { name: t.draft, exact: true }).click();
    await expect(page.getByRole('button', { name: t.copyDraft, exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath(`${locale}-result.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.locator('#ui-language').selectOption('en');
    expect(requests).toBe(1);
    await expect(
      page.getByRole('region', { name: 'Your grounded answer', exact: true }),
    ).toHaveAttribute('lang', 'hi');
  });

for (const locale of locales)
  test(`image consent and exact upload are explicit in ${locale}`, async ({ page }) => {
    const t = dictionaries[locale];
    const events: string[] = [];
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=',
      'base64',
    );
    const key = 'inbox/' + 'a'.repeat(32) + '.png';
    // No real storage/provider host: Playwright fulfills every upload and analysis.
    await page.route('**/api/v1/capabilities', (route) => route.fulfill({ json: capabilities }));
    await page.route('**/api/v1/images/uploads', async (route) => {
      events.push('ticket');
      expect(route.request().postDataJSON()).toEqual({
        language: 'en',
        content_type: 'image/png',
        content_length: png.length,
      });
      await route.fulfill({
        json: {
          object_key: key,
          upload_url: 'https://storage.example.invalid/reviewed.png?signature=synthetic',
          content_type: 'image/png',
          expires_in: 300,
        },
      });
    });
    await page.route('https://storage.example.invalid/**', async (route) => {
      events.push('upload');
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataBuffer()).toEqual(png);
      expect(route.request().headers().authorization).toBeUndefined();
      await route.fulfill({ status: 200, body: '' });
    });
    await page.route('**/api/v1/analyze/stream', async (route) => {
      events.push('analyze');
      expect(route.request().postDataJSON()).toEqual({ image_key: key, language: 'en' });
      await route.fulfill({
        contentType: 'text/event-stream',
        body: `event: result\ndata: ${JSON.stringify(success)}\n\n`,
      });
    });
    await page.goto('/');
    await expect(page.locator('#output-language')).toBeEnabled();
    await page.locator('#ui-language').selectOption(locale);
    await page
      .getByLabel(t.chooseImage, { exact: true })
      .setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: png });
    await expect(page.getByRole('img', { name: t.attachedPreview })).toBeVisible();
    expect(events).toEqual([]);
    await page.getByRole('button', { name: t.reviewAnalysis, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: t.imageConsentTitle });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(t.imageConsentDestination, { exact: true })).toBeVisible();
    await expect(dialog.getByText(t.imageConsentPrivacy, { exact: true })).toBeVisible();
    await expect(dialog.getByRole('img', { name: t.attachedPreview })).toBeVisible();
    await expect(dialog.getByText(t.consentDestination, { exact: true })).toHaveCount(0);
    expect(events).toEqual([]);
    await dialog.getByRole('button', { name: t.backEdit }).click();
    expect(events).toEqual([]);
    await page.getByRole('button', { name: t.reviewAnalysis, exact: true }).click();
    await dialog.getByRole('button', { name: t.analyzeReviewedImage, exact: true }).click();
    await expect(page.locator('.answer-card')).toBeVisible();
    expect(events).toEqual(['ticket', 'upload', 'analyze']);
    await expect(page.getByRole('button', { name: 'Retry analysis', exact: true })).toHaveCount(0);
  });
