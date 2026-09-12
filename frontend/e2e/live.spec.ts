import { expect, test, type Page, type Route } from '@playwright/test';
import { createServer, type ServerResponse } from 'node:http';
import success from '../../docs/examples/success.json' with { type: 'json' };
import clarification from '../../docs/examples/needs_clarification.json' with { type: 'json' };
import unsupported from '../../docs/examples/unsupported.json' with { type: 'json' };
import failure from '../../docs/examples/error.json' with { type: 'json' };

const remark = 'SYNTHETIC live UI test: imaginary rejection wording, no identifiers.';
const languages = [
  ['en', 'English', 'English'],
  ['hi', 'Hindi', 'हिन्दी'],
  ['kn', 'Kannada', 'ಕನ್ನಡ'],
  ['ta', 'Tamil', 'தமிழ்'],
  ['te', 'Telugu', 'తెలుగు'],
  ['ml', 'Malayalam', 'മലയാളം'],
];
const capabilities = {
  schema_version: '1.0',
  default_language: 'en',
  languages: languages.map(([code, name, native_name]) => ({
    code,
    name,
    native_name,
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
  inputs: ['text'],
  downloads_available: false,
};
const liveSuccess = {
  ...success,
  explanation: [{ ...success.explanation[0], text: 'SYNTHETIC backend test explanation.' }],
  citations: [{ ...success.citations[0], start_column: 0, end_column: 8 }],
};
const reading = {
  phase: 'reading',
  path: 'references/knowledge/epfo/reasons/epfo-rr-001.md',
  heading: 'Synthetic section',
  start_line: 1,
  end_line: 4,
};
const sse = (json: unknown) => ({
  contentType: 'text/event-stream',
  body: `event: activity\ndata: ${JSON.stringify({ phase: 'thinking', turn: 1 })}\n\nevent: activity\ndata: ${JSON.stringify(reading)}\n\nevent: result\ndata: ${JSON.stringify(json)}\n\n`,
});
const input = (page: Page) => page.getByRole('textbox', { name: 'Your message', exact: true });
const review = (page: Page) =>
  page.getByRole('button', { name: 'Review for analysis', exact: true });
const approve = (page: Page) =>
  page.getByRole('button', { name: 'Analyze reviewed text', exact: true });
async function prepare(
  page: Page,
  handler: (route: Route) => Promise<void>,
  caps: unknown = capabilities,
) {
  await page.route('**/api/v1/capabilities', (route) => route.fulfill({ json: caps }));
  await page.route('**/api/v1/analyze/stream', handler);
  await page.goto('/');
  await expect(page.getByRole('combobox', { name: 'Analysis output language' })).toBeEnabled();
}
async function submit(page: Page) {
  await input(page).fill(remark);
  await review(page).click();
  await approve(page).click();
}

test('consent gates transmission; success citations/draft are not labelled as samples', async ({
  page,
}, info) => {
  const requests: unknown[] = [];
  await prepare(page, async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill(sse(liveSuccess));
  });
  await input(page).fill(remark);
  expect(requests).toHaveLength(0);
  await review(page).click();
  await expect(page.getByRole('dialog', { name: 'Approve this text analysis' })).toBeVisible();
  await expect(page.getByText(/model may be hosted remotely/)).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.screenshot({ path: info.outputPath('consent.png'), fullPage: true });
  await page.getByRole('button', { name: 'Back to edit' }).click();
  await expect(input(page)).toHaveValue(remark);
  await expect(input(page)).toBeEditable();
  await expect(input(page)).toBeFocused();
  await input(page).fill(remark + ' Reviewed.');
  await review(page).click();
  await approve(page).click();
  await expect(page.getByRole('heading', { name: 'Your analysis', exact: true })).toBeVisible();
  expect(requests).toEqual([{ text: remark + ' Reviewed.', language: 'en' }]);
  await page.getByText('Actual backend events (2)', { exact: true }).click();
  await expect(page.getByText(reading.path, { exact: true })).toBeVisible();
  await expect(page.getByText('Synthetic section · lines 1–4', { exact: true })).toBeVisible();
  await expect(page.getByText('Sample only · not real claim advice', { exact: true })).toHaveCount(
    0,
  );
  await page.locator('details.evidence:visible > summary').first().click();
  await expect(page.getByText('Columns (zero-based)', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('0–8', { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: info.outputPath('live-evidence.png'), fullPage: true });
  await page.getByRole('tab', { name: 'Draft', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copy draft', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy sample', exact: true })).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('live-draft.png'), fullPage: true });
});

test('pending host activity animates only while working and stops without late results', async ({
  page,
}, info) => {
  let active: ServerResponse | undefined;
  const server = createServer((_request, response) => {
    active = response;
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Access-Control-Allow-Origin': 'http://127.0.0.1:5175',
      'Cache-Control': 'no-store',
    });
    response.write(
      `event: activity\ndata: ${JSON.stringify({ phase: 'thinking', turn: 1 })}\n\nevent: activity\ndata: ${JSON.stringify(reading)}\n\n`,
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;
  try {
    // Synthetic streaming server is test preparation; the page still initiates its
    // real request only through Review and Analyze, without injected UI state.
    await prepare(page, (route) =>
      route.continue({ url: `http://127.0.0.1:${port}/api/v1/analyze/stream` }),
    );
    await submit(page);
    const panel = page.getByRole('region', { name: 'Backend reading activity' });
    await expect(panel.getByText(reading.path, { exact: true })).toBeVisible();
    await expect(panel.locator('.spin')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Your analysis', exact: true })).toHaveCount(0);
    await page.screenshot({ path: info.outputPath('pending-activity.png'), fullPage: true });
    await page.getByRole('button', { name: 'Stop analysis' }).click();
    active?.end(`event: result\ndata: ${JSON.stringify(liveSuccess)}\n\n`);
    await expect(panel.locator('.spin')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Your analysis', exact: true })).toHaveCount(0);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('capabilities drive six output languages independently of the sample selector', async ({
  page,
}) => {
  const requests: { language: string }[] = [];
  await prepare(page, async (route) => {
    const body = route.request().postDataJSON();
    requests.push(body);
    await route.fulfill(sse({ ...unsupported, language: body.language }));
  });
  const selector = page.getByRole('combobox', { name: 'Analysis output language' });
  await expect(selector.locator('option')).toHaveCount(6);
  for (const [code] of languages) {
    await selector.selectOption(code);
    await submit(page);
    await expect(
      page.getByRole('heading', { name: 'Not enough evidence', exact: true }).last(),
    ).toBeVisible();
    expect(requests.at(-1)?.language).toBe(code);
  }
  await expect(page.getByRole('combobox', { name: 'Sample language' })).toHaveValue('en');
});

for (const [name, json, status, heading] of [
  ['clarification', { ...clarification, language: 'en' }, 200, 'One more detail'],
  ['unsupported', unsupported, 200, 'Not enough evidence'],
  [
    'provider failure',
    { ...failure, error: { code: 'model_unavailable', message: 'PRIVATE_PROVIDER_SECRET' } },
    502,
    'Analysis not completed',
  ],
  ['invalid response', { ...liveSuccess, language: 'hi' }, 200, 'Analysis not completed'],
] as const) {
  test(`${name} is honest with no usable draft or raw provider errors`, async ({ page }, info) => {
    await prepare(page, async (route) => {
      await route.fulfill(status === 200 ? sse(json) : { json, status });
    });
    await submit(page);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await expect(page.getByText('PRIVATE_PROVIDER_SECRET')).toHaveCount(0);
    if (name === 'clarification') await expect(page.locator('.answer-questions')).not.toBeEmpty();
    if (name === 'unsupported')
      await expect(page.locator('.answer-disclosure')).toHaveAttribute('open', '');
    await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
  });
}

test('images never transmit; removing one requires fresh text approval and strips file metadata', async ({
  page,
}) => {
  const requests: unknown[] = [];
  await prepare(page, async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill(sse(unsupported));
  });
  // One-pixel synthetic PNG prepared before interaction; no private file content.
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=',
    'base64',
  );
  await page
    .getByLabel('Choose image file', { exact: true })
    .setInputFiles({ name: 'synthetic-only.png', mimeType: 'image/png', buffer: png });
  await expect(page.getByRole('img', { name: 'Attached screenshot preview' })).toBeVisible();
  await review(page).click();
  await expect(page.getByRole('alert')).toContainText('Images cannot be analyzed');
  await input(page).fill(remark);
  await review(page).click();
  expect(requests).toHaveLength(0);
  await expect(approve(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Remove attached image' }).click();
  await review(page).click();
  expect(requests).toHaveLength(0);
  await approve(page).click();
  await expect(page.getByRole('heading', { name: 'Not enough evidence' })).toBeVisible();
  expect(requests).toEqual([{ text: remark, language: 'en' }]);
});

for (const action of ['stop', 'edit', 'new chat', 'language'] as const) {
  test(`${action} invalidates an in-flight request and late responses cannot return`, async ({
    page,
  }) => {
    let held: Route | undefined;
    await prepare(page, async (route) => {
      held = route;
    });
    await submit(page);
    await expect(page.getByRole('heading', { name: 'Analyzing reviewed text…' })).toBeVisible();
    if (action === 'stop') await page.getByRole('button', { name: 'Stop analysis' }).click();
    if (action === 'edit') await page.getByRole('button', { name: 'Edit this message' }).click();
    if (action === 'new chat') await page.getByRole('button', { name: 'New chat' }).click();
    if (action === 'language')
      await page.getByRole('combobox', { name: 'Analysis output language' }).selectOption('kn');
    await held?.fulfill(sse(liveSuccess)).catch(() => {});
    await expect(page.getByRole('heading', { name: 'Your analysis', exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Analyzing reviewed text…' })).toHaveCount(0);
    if (action === 'edit') await expect(input(page)).toHaveValue(remark);
  });
}

test('unavailable capabilities block POST and explicit fictional sample stays separate', async ({
  page,
}) => {
  let posts = 0;
  await prepare(
    page,
    async (route) => {
      posts++;
      await route.abort();
    },
    {
      ...capabilities,
      analysis_available: false,
      checks: { ...capabilities.checks, model_configured: false },
    },
  );
  await input(page).fill(remark);
  await review(page).click();
  await expect(page.getByRole('alert')).toContainText('Analysis is unavailable');
  await page.getByRole('button', { name: /Show me an example/ }).click();
  await expect(page.getByRole('heading', { name: 'Your sample answer' })).toBeVisible();
  expect(posts).toBe(0);
});
