import { randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, type Page, type Request, type Response } from '@playwright/test';

// No page.route/fulfill, mock HTTP response, real corpus, or paid provider here.
// These tests run App -> browser fetch/CORS -> uvicorn -> create_app -> actual
// AnalysisService -> actual bounded Markdown tools/ledger -> fake model output.
const API = 'http://127.0.0.1:8011/api/v1';
const ORIGIN = 'http://127.0.0.1:5174';
const MARKER = 'issue25-synthetic-real-service';
const SOURCE = 'https://example.org/synthetic/web-ui-issue25/source-001';
const PATH = 'references/knowledge/epfo/reasons/epfo-rr-001.md';
const ACTION = 'SYNTHETIC fixture: compare the fictional notice labels.';
const QUESTION = 'SYNTHETIC fixture: which fictional notice label needs checking?';
const test = base.extend<{ traffic: Request[] }>({
  traffic: [
    async ({ page, context }, use) => {
      const requests: Request[] = [];
      const external: string[] = [];
      const errors: string[] = [];
      // A real cookie is deliberately present. API fetch must omit it.
      await context.addCookies([
        { name: 'SYNTHETIC_fixture_cookie', value: 'must-not-be-sent', url: ORIGIN },
      ]);
      page.on('request', (request) => {
        const url = new URL(request.url());
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          if (url.origin !== ORIGIN && url.origin !== 'http://127.0.0.1:8011')
            external.push(url.origin);
          if (request.url().startsWith(API)) requests.push(request);
        }
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await use(requests);
      expect(external, 'No citation URL, real provider, or other external request').toEqual([]);
      expect(errors, 'No uncaught browser errors').toEqual([]);
      for (const request of requests) {
        const headers = await request.allHeaders();
        expect(headers.cookie, 'API requests omit browser cookies').toBeUndefined();
        expect(headers.authorization, 'No provider credential reaches the API').toBeUndefined();
        expect(headers['x-api-key']).toBeUndefined();
      }
    },
    { auto: true },
  ],
});

// The existing preview config also scans e2e/. Keep this additive suite isolated
// without changing another owner's default config or package scripts.
test.skip(
  ({ baseURL }) => baseURL !== ORIGIN,
  'Requires playwright.api.config.ts and its exclusively owned fixture servers.',
);

const posts = (traffic: Request[]) => traffic.filter((request) => request.method() === 'POST');
const synthetic = (scenario: string) => `SYNTHETIC ${scenario} fictional notice ${randomUUID()}`;

async function realResponse(response: Response, turns?: number) {
  expect(response.url()).toMatch(/^http:\/\/127\.0\.0\.1:8011\/api\/v1\//);
  expect(response.fromServiceWorker()).toBe(false);
  expect(response.headers()['x-synthetic-fixture']).toBe(MARKER);
  if (turns !== undefined)
    expect(response.headers()['x-synthetic-model-turns']).toBe(String(turns));
  return response.json();
}

async function connectedAccessibility(page: Page, state: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  if (results.violations.length) {
    await test.info().attach(`actual-api-${state}-axe`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
  }
  expect(results.violations, `Actual API ${state}: automated WCAG A/AA scan`).toEqual([]);
  if (test.info().project.name === 'api-mobile') {
    const original = page.viewportSize()!;
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: original.height });
      await expect
        .poll(
          () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          {
            message: `Actual API ${state} must not overflow at ${width}px`,
          },
        )
        .toBe(true);
    }
    await page.setViewportSize(original);
  }
  await page.screenshot({
    path: test.info().outputPath(`api-${state}.png`),
    animations: 'disabled',
  });
}

async function openApp(page: Page, traffic: Request[]) {
  const metadata = page.waitForResponse(
    (response) => response.url() === `${API}/capabilities` && response.status() === 200,
  );
  await page.goto('/');
  const response = await metadata;
  const caps = await realResponse(response, 0);
  expect(caps.analysis_available).toBe(true);
  expect(caps.checks).toMatchObject({
    model_configured: true,
    model_connectivity_verified: false,
    knowledge_structure_ready: true,
    knowledge_content_verified: false,
    agent_implemented: true,
  });
  expect(caps.languages.map((item: { code: string }) => item.code)).toEqual(['en', 'hi']);
  expect(
    caps.languages.every((item: { quality_verified: boolean }) => !item.quality_verified),
  ).toBe(true);
  expect(caps.inputs).toEqual(['text']);
  expect(caps.downloads_available).toBe(false);
  await expect(page.getByLabel('Output language')).toBeEnabled();
  await expect(page.getByLabel('Output language').locator('option')).toHaveText([
    'English',
    'हिन्दी',
  ]);
  expect(posts(traffic)).toHaveLength(0);
  await connectedAccessibility(page, 'ready');
  return caps;
}

async function submit(page: Page, text: string, keyboard = false) {
  await page.getByRole('textbox', { name: 'Your message' }).fill(text);
  const result = page.waitForResponse(
    (response) => response.url() === `${API}/analyze` && response.request().method() === 'POST',
  );
  if (keyboard) {
    await page.getByRole('textbox', { name: 'Your message' }).press('Enter');
  } else {
    await page.getByRole('button', { name: 'Analyze text', exact: true }).click();
  }
  return result;
}

function textOnlyRequest(request: Request, text: string, language = 'en') {
  const body = request.postDataJSON();
  expect(body.text).toBe(text);
  expect(body.language).toBe(language);
  // The shared client serializes schema-default null details; no attachments.
  expect(Object.keys(body).sort()).toEqual(['details', 'language', 'text']);
  expect(body.details).toEqual({ claimant_name: null, claim_id: null, claim_type: null });
}

async function noGuidance(page: Page) {
  await expect(page.getByRole('heading', { name: 'Your guidance', exact: true })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Draft', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Copy draft', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Your sample answer', exact: true })).toHaveCount(
    0,
  );
}

test('discovers real subset metadata, analyzes own text, renders host citations and copies draft', async ({
  page,
  context,
  traffic,
}) => {
  await openApp(page, traffic);
  const text = synthetic('supported');
  const response = await submit(page, text, true);
  expect(response.status()).toBe(200);
  const body = await realResponse(response, 2);
  textOnlyRequest(posts(traffic)[0], text);
  expect(body.status).toBe('success');
  expect(body.classification.reason_id).toBe('epfo-rr-001');
  expect(body.citations).toHaveLength(2);
  expect(body.citations.map((citation: { heading: string }) => citation.heading)).toEqual([
    'Fix',
    'Sources',
  ]);
  expect(body.citations.map((citation: { source_urls: string[] }) => citation.source_urls)).toEqual(
    [[], [SOURCE]],
  );
  for (const citation of body.citations) {
    expect(citation).toMatchObject({ path: PATH, record_id: 'epfo-rr-001', start_column: 0 });
    expect(citation.id).toMatch(/^ev-/);
    expect(citation.start_line).toBe(citation.heading === 'Fix' ? 2 : 4);
    expect(citation.end_line).toBe(citation.heading === 'Fix' ? 3 : 5);
    expect(citation.end_column).toBeGreaterThan(0);
  }
  expect(JSON.stringify(body)).not.toContain('never-read');
  expect(body.actions[0].citation_ids).toEqual(
    body.citations.map((citation: { id: string }) => citation.id),
  );
  expect(body.draft.blocks.filter((block: { kind: string }) => block.kind === 'factual')).toEqual([
    { ...body.actions[0], kind: 'factual' },
  ]);
  await expect(page.getByRole('heading', { name: 'Your guidance', exact: true })).toBeVisible();
  const card = page.locator('.answer-card');
  await expect(card).not.toContainText(
    /Sample only|Your sample answer|SAMPLE REQUEST|Fictional preview, not a live analysis/i,
  );
  await expect(card).toContainText('Citations are not independent policy verification');
  const evidence = card.locator('.evidence').first();
  await evidence.locator('summary').click();
  await expect(evidence).toContainText(PATH);
  await expect(evidence).toContainText('epfo-rr-001');
  await expect(evidence).toContainText('Exact heading');
  await expect(evidence).toContainText('Column endpoints (zero-based)');
  await expect(evidence.getByRole('link', { name: SOURCE, exact: false })).toHaveAttribute(
    'href',
    SOURCE,
  );
  await expect(evidence.getByRole('link', { name: SOURCE, exact: false })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  await connectedAccessibility(page, 'success-with-expanded-citations');
  await page.getByRole('tab', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Next steps', exact: true })).toBeFocused();
  await expect(page.getByRole('checkbox', { name: ACTION, exact: true })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Draft', exact: true })).toBeFocused();
  await connectedAccessibility(page, 'draft');
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: ORIGIN });
  await page.getByRole('button', { name: 'Copy draft', exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(SOURCE);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  for (const fragment of [
    ACTION,
    PATH,
    'Record ID: epfo-rr-001',
    'Heading: Fix',
    'Heading: Sources',
    'zero-based columns:',
    'not independently verified',
  ]) {
    expect(copied).toContain(fragment);
  }
  expect(copied).not.toMatch(/Sample only|SAMPLE REQUEST|Fictional preview, not a live analysis/i);
  expect(posts(traffic)).toHaveLength(1);
});

test('uses native enabled language from actual capabilities without claiming translation quality', async ({
  page,
  traffic,
}) => {
  await openApp(page, traffic);
  await page.getByLabel('Output language').selectOption('hi');
  const text = synthetic('supported');
  const response = await submit(page, text);
  const body = await realResponse(response, 2);
  expect(body.language).toBe('hi');
  textOnlyRequest(posts(traffic)[0], text, 'hi');
  await expect(page.getByRole('heading', { name: 'Your guidance', exact: true })).toBeVisible();
  await expect(page.locator('.answer-card')).toHaveAttribute('lang', 'hi');
  await expect(page.locator('.answer-card')).toContainText('SYNTHETIC परीक्षण');
  await expect(page.locator('.answer-card')).toContainText(
    'Output language quality has not been independently verified.',
  );
});

test('clarifies, preserves the editable notice, and submits a new user-edited request', async ({
  page,
  traffic,
}) => {
  await openApp(page, traffic);
  const original = synthetic('clarify');
  const first = await submit(page, original);
  expect((await realResponse(first, 1)).status).toBe('needs_clarification');
  await expect(page.getByRole('heading', { name: 'One more detail', exact: true })).toBeVisible();
  await expect(page.locator('.answer-questions')).toContainText(QUESTION);
  await connectedAccessibility(page, 'clarification');
  await noGuidance(page);
  await page.getByRole('button', { name: 'Edit remark', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Your message' })).toHaveValue(original);
  const edited = synthetic('supported');
  const second = await submit(page, edited);
  expect((await realResponse(second, 2)).status).toBe('success');
  await expect(page.getByRole('heading', { name: 'Your guidance', exact: true })).toBeVisible();
  expect(posts(traffic)).toHaveLength(2);
  textOnlyRequest(posts(traffic)[0], original);
  textOnlyRequest(posts(traffic)[1], edited);
});

test('unsupported actual service outcome has no actions, draft or fallback sample', async ({
  page,
  traffic,
}) => {
  await openApp(page, traffic);
  const text = synthetic('unsupported');
  const response = await submit(page, text);
  const body = await realResponse(response, 1);
  expect(body.status).toBe('unsupported');
  expect(body.actions).toEqual([]);
  expect(body.citations).toEqual([]);
  expect(body.draft).toBeNull();
  await expect(
    page.getByRole('heading', { name: 'Not enough evidence', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Your message' })).toHaveValue(text);
  await noGuidance(page);
  expect(posts(traffic)).toHaveLength(1);
});

for (const [scenario, status, code, turns] of [
  ['provider-failure', 502, 'model_unavailable', 1],
  ['timeout', 504, 'analysis_timeout', 1],
  ['budget', 503, 'budget_exhausted', 1],
  ['invalid-output', 502, 'invalid_model_output', 2],
] as const) {
  test(`actual ${code} is structured and never falls back or automatically resubmits`, async ({
    page,
    traffic,
  }) => {
    await openApp(page, traffic);
    const text = synthetic(scenario);
    const response = await submit(page, text);
    expect(response.status()).toBe(status);
    const body = await realResponse(response, turns);
    expect(body.status).toBe('error');
    expect(body.error.code).toBe(code);
    expect(body.actions).toEqual([]);
    expect(body.citations).toEqual([]);
    expect(body.draft).toBeNull();
    expect(JSON.stringify(body)).not.toMatch(
      /SYNTHETIC-NOT-A-REAL-KEY|Traceback|provider\.example\.invalid/,
    );
    await expect(
      page.getByRole('heading', { name: 'Could not prepare an answer', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Your message' })).toHaveValue(text);
    await noGuidance(page);
    await connectedAccessibility(page, code);
    // Observation window is deliberate: no request listener is intercepted.
    await page.waitForTimeout(500);
    expect(posts(traffic)).toHaveLength(1);
    if (scenario === 'provider-failure') {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const next = page.waitForResponse(
          (result) => result.url() === `${API}/analyze` && result.request().method() === 'POST',
        );
        await page.getByRole('button', { name: 'Retry analysis', exact: true }).click();
        expect((await realResponse(await next, 1)).error.code).toBe(code);
      }
      await expect(
        page.getByRole('button', { name: 'Retry analysis', exact: true }),
      ).toBeDisabled();
      expect(posts(traffic)).toHaveLength(3);
      for (const request of posts(traffic)) textOnlyRequest(request, text);
    }
  });
}

test('local image stays local: image alone sends nothing, text plus image posts text only', async ({
  page,
  traffic,
}) => {
  await openApp(page, traffic);
  const name = `SYNTHETIC-local-only-${randomUUID()}.png`;
  await page.getByLabel('Choose image file', { exact: true }).setInputFiles({
    name,
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5QAAAABJRU5ErkJggg==',
      'base64',
    ),
  });
  await expect(page.getByAltText('Attached screenshot preview', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analyze text', exact: true })).toBeDisabled();
  expect(posts(traffic)).toHaveLength(0);
  const text = synthetic('supported');
  const response = await submit(page, text);
  expect((await realResponse(response, 2)).status).toBe('success');
  expect(posts(traffic)).toHaveLength(1);
  textOnlyRequest(posts(traffic)[0], text);
  expect(posts(traffic)[0].postData()).not.toContain(name);
  expect(posts(traffic)[0].postData()).not.toMatch(/image|base64|iVBORw0|blob:|data:/i);
  await expect(page.getByRole('heading', { name: 'Your guidance', exact: true })).toBeVisible();
});

test('real browser HTTP body and disabled-language failures occur before fake model work', async ({
  page,
  traffic,
}) => {
  await openApp(page, traffic);
  // Deliberate raw fetch bypasses the client's pre-validation to reach actual
  // BodyLimitMiddleware/FastAPI. This is transport acceptance, not UI rendering.
  for (const [raw, status, code] of [
    ['{', 422, 'invalid_request'],
    ['x'.repeat(32769), 413, 'request_too_large'],
    [JSON.stringify({ text: synthetic('supported'), language: 'kn' }), 422, 'language_disabled'],
  ] as const) {
    const incoming = page.waitForResponse(
      (response) => response.url() === `${API}/analyze` && response.request().method() === 'POST',
    );
    const result = await page.evaluate(
      async ({ url, raw }) => {
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'omit',
          headers: { 'Content-Type': 'application/json' },
          body: raw,
        });
        return { status: response.status, body: await response.json() };
      },
      { url: `${API}/analyze`, raw },
    );
    await realResponse(await incoming, 0);
    expect(result.status).toBe(status);
    expect(result.body.error.code).toBe(code);
    expect(result.body.actions ?? []).toEqual([]);
  }
  expect(posts(traffic)).toHaveLength(3);
  await noGuidance(page);
});
