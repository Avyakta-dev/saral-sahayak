import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { testCapabilities, languageSamples } from '../src/test/languages';
import success from '../../docs/examples/success.json' with { type: 'json' };

const selector = (page: Page) => page.getByRole('combobox', { name: 'Output language' });
const input = (page: Page) => page.getByRole('textbox', { name: 'Your message', exact: true });
const send = (page: Page) => page.getByRole('button', { name: 'Send message', exact: true });
const literal = 'SYNTHETIC-ID-00/A [claimant_name] e\u0301';

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/capabilities', (route) => route.fulfill({ json: testCapabilities }));
  await page.route('**/api/v1/analyze', (route) =>
    route.fulfill({ status: 503, json: { message: 'Synthetic unavailable' } }),
  );
});

for (const sample of languageSamples) {
  test(`capability ${sample.code}: literal script, keyboard, citations and mobile layout`, async ({
    page,
  }, info) => {
    let posted: unknown;
    const text = `${sample.text} ${literal}`;
    await page.route('**/api/v1/analyze', async (route) => {
      posted = route.request().postDataJSON();
      await route.fulfill({
        json: {
          ...success,
          language: sample.code,
          explanation: [{ text, citation_ids: success.explanation[0].citation_ids }],
          citations: [{ ...success.citations[0], start_column: 0, end_column: 10 }],
          warnings: [sample.text],
        },
      });
    });
    await page.goto('/');
    await expect(selector(page).locator('option')).toHaveCount(6);
    await expect(selector(page)).toHaveValue('en');
    await expect(selector(page).locator(`option[value="${sample.code}"]`)).toHaveText(
      sample.native_name,
    );
    await expect(selector(page)).toHaveAccessibleDescription(/quality is unverified/);
    // Reach the native selector through keyboard navigation, then use native keys.
    for (
      let i = 0;
      i < 8 && !(await selector(page).evaluate((el) => el === document.activeElement));
      i++
    )
      await page.keyboard.press('Tab');
    await expect(selector(page)).toBeFocused();
    expect(await selector(page).evaluate((el) => el.matches(':focus-visible'))).toBe(true);
    await page.keyboard.press('Home');
    for (let i = 0; i < languageSamples.indexOf(sample); i++)
      await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(selector(page)).toHaveValue(sample.code);
    await input(page).fill(text);
    await send(page).click();
    const answer = page.locator('.answer-card');
    await expect(answer).toHaveAttribute('lang', sample.code);
    await expect(answer.getByText(text, { exact: true })).toBeVisible();
    expect(posted).toEqual({ text, language: sample.code });
    await answer.locator('details.evidence > summary').first().click();
    await expect(
      answer.getByText(success.citations[0].path, { exact: true }).first(),
    ).toBeVisible();
    await noOverflow(page);
    await selector(page).selectOption(sample.code === 'hi' ? 'en' : 'hi');
    await expect(answer).toHaveAttribute('lang', sample.code);
    await expect(answer.getByText(text, { exact: true })).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath(`language-${sample.code}.png`), fullPage: true });
  });
}

test('uses only a configured subset, keeps examples honest and retains selection on new chat', async ({
  page,
}) => {
  await page.route('**/api/v1/capabilities', (route) =>
    route.fulfill({
      json: {
        ...testCapabilities,
        languages: [testCapabilities.languages[5], testCapabilities.languages[0]],
      },
    }),
  );
  await page.goto('/');
  await expect(selector(page).locator('option')).toHaveText(['മലയാളം', 'English']);
  await expect(selector(page)).toHaveValue('en');
  await selector(page).selectOption('ml');
  await page.getByRole('button', { name: /Show me an example/ }).click();
  await expect(page.locator('.answer-card')).toHaveAttribute('lang', 'en');
  await expect(page.getByText(/Showing an English sample/)).toBeVisible();
  await expect(selector(page)).toHaveValue('ml');
  await page.getByRole('button', { name: 'New chat', exact: true }).click();
  await expect(selector(page)).toHaveValue('ml');
});

for (const languages of [
  [],
  testCapabilities.languages.slice(1),
  [testCapabilities.languages[0], testCapabilities.languages[0]],
  [{ ...testCapabilities.languages[0], code: 'fr' }],
  [{ ...testCapabilities.languages[0], native_name: '<script>' }],
]) {
  test(`malformed list falls back honestly ${JSON.stringify(languages)}`, async ({ page }) => {
    await page.route('**/api/v1/capabilities', (route) =>
      route.fulfill({ json: { ...testCapabilities, languages } }),
    );
    await page.goto('/');
    await expect(selector(page).locator('option')).toHaveText(['English']);
    await expect(selector(page)).toHaveAccessibleDescription(/English fallback only/);
  });
}

test('network failure retains English direct attempt without offering unverified languages', async ({
  page,
}) => {
  let posts = 0;
  await page.route('**/api/v1/capabilities', (route) => route.abort());
  await page.route('**/api/v1/analyze', (route) => {
    posts++;
    return route.fulfill({ status: 503, json: { message: 'Synthetic unavailable' } });
  });
  await page.goto('/');
  await expect(selector(page).locator('option')).toHaveText(['English']);
  await input(page).fill(literal);
  await send(page).click();
  await expect(page.getByText('Synthetic unavailable', { exact: true })).toBeVisible();
  expect(posts).toBe(1);
});

test('changed capabilities block stale language and retry without silently translating', async ({
  page,
}) => {
  let changed = false;
  let posts = 0;
  await page.route('**/api/v1/capabilities', (route) =>
    route.fulfill({
      json: {
        ...testCapabilities,
        languages: changed ? [testCapabilities.languages[0]] : testCapabilities.languages,
      },
    }),
  );
  await page.route('**/api/v1/analyze', (route) => {
    posts++;
    return route.fulfill({ json: success });
  });
  await page.goto('/');
  await expect(selector(page).locator('option')).toHaveCount(6);
  await selector(page).selectOption('kn');
  changed = true;
  await input(page).fill(literal);
  await send(page).click();
  await expect(page.getByText(/requested language is no longer available/)).toBeVisible();
  await expect(selector(page)).toHaveValue('en');
  await page.getByRole('button', { name: /Try again \(2 left\)/ }).click();
  await expect(page.getByText(/requested language is no longer available/)).toBeVisible();
  expect(posts).toBe(0);
});

test('language change cancels a pending result and ignores late completion', async ({ page }) => {
  let finish!: () => Promise<void>;
  await page.route(
    '**/api/v1/analyze',
    (route) =>
      new Promise<void>((resolve) => {
        finish = async () => {
          await route.fulfill({ json: { ...success, language: 'ta' } }).catch(() => {});
          resolve();
        };
      }),
  );
  await page.goto('/');
  await expect(selector(page).locator('option')).toHaveCount(6);
  await selector(page).selectOption('ta');
  await input(page).fill(literal);
  await send(page).click();
  await expect.poll(() => typeof finish).toBe('function');
  await selector(page).selectOption('te');
  await finish();
  await expect(page.locator('.answer-card')).toHaveCount(0);
  await expect(selector(page)).toHaveValue('te');
  await expect(page.getByRole('button', { name: 'Stop request' })).toHaveCount(0);
});
