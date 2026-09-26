import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { entrySchema, type Entry } from '../../src/lib/schema';
import { BASE_ROOT } from '../../src/lib/base';

// Read rather than import: Playwright's loader wants an import attribute for JSON.
const raw = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../src/data/entries.json', import.meta.url)), 'utf8'),
) as unknown[];
const entries: Entry[] = raw.map((row) => entrySchema.parse(row));
const TOTAL = entries.length;
const OSS = entries.filter((e) => e.category === 'oss').length;

test.describe('the directory island (R-06)', () => {
  test('AC-06-1: starts with every entry visible', async ({ page }) => {
    await page.goto('entries');
    await expect(page.locator('.card:visible')).toHaveCount(TOTAL);
    await expect(page.locator('[data-count]')).toContainText(`${TOTAL}`);
    await expect(page.locator('[data-empty]')).toBeHidden();
  });

  test('AC-06-1: the category filter narrows the list to one category', async ({ page }) => {
    await page.goto('entries');
    await page.selectOption('#category', 'oss');
    await expect(page.locator('.card:visible')).toHaveCount(OSS);
    for (const card of await page.locator('.card:visible').all()) {
      await expect(card).toHaveAttribute('data-category', 'oss');
    }
  });

  test('AC-04-3: a category link preselects the facet on the list page', async ({ page }) => {
    await page.goto('entries?category=benchmark');
    await expect(page.locator('#category')).toHaveValue('benchmark');
    const shown = await page.locator('.card:visible').count();
    expect(shown).toBe(entries.filter((e) => e.category === 'benchmark').length);
  });

  test('searching narrows the list, and clearing it restores every card', async ({ page }) => {
    await page.goto('entries');
    await page.fill('#q', 'calibration');
    await expect(page.locator('.card:visible')).not.toHaveCount(TOTAL);
    expect(await page.locator('.card:visible').count()).toBeGreaterThan(0);
    await page.fill('#q', '');
    await expect(page.locator('.card:visible')).toHaveCount(TOTAL);
  });

  test('a query that matches nothing shows the empty state, not a blank page', async ({ page }) => {
    await page.goto('entries');
    await page.fill('#q', 'zzzzqqqqxxxx');
    await expect(page.locator('.card:visible')).toHaveCount(0);
    await expect(page.locator('[data-empty]')).toBeVisible();
  });

  test('AC-06-1: sorting by stars puts the most-starred entry first', async ({ page }) => {
    await page.goto('entries');
    await page.selectOption('#sort', 'stars');
    const top = entries.reduce((best, e) => ((e.stars ?? -1) > (best.stars ?? -1) ? e : best));
    await expect(page.locator('.card:visible').first()).toHaveAttribute('data-entry', top.id);
  });

  test('AC-06-1: sorting by newest puts the most recently listed entry first', async ({ page }) => {
    await page.goto('entries');
    await page.selectOption('#sort', 'newest');
    const first = await page.locator('.card:visible').first().getAttribute('data-added');
    const newest = entries.reduce((max, e) => (e.addedAt > max ? e.addedAt : max), '0000-00-00');
    expect(first).toBe(newest);
  });
});

test.describe('locales (R-05)', () => {
  test('the Japanese list page renders in Japanese and links back to English', async ({ page }) => {
    await page.goto('ja/entries');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.locator('.card:visible')).toHaveCount(TOTAL);
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/entries$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('a detail page opens from a card and shows the sources that were checked', async ({ page }) => {
    await page.goto('entries');
    await page.locator('.card h3 a').first().click();
    await expect(page.locator('.sources li')).not.toHaveCount(0);
    await expect(page.locator('.detail-actions a').first()).toHaveAttribute('rel', /noopener/);
  });
});

test.describe('covers (R-11)', () => {
  test('AC-11-7: a cover never overflows its card at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('entries');
    const card = page.locator('.card').first();
    const cardBox = await card.boundingBox();
    const imgBox = await card.locator('.card__cover img').boundingBox();
    expect(cardBox).not.toBeNull();
    expect(imgBox).not.toBeNull();
    expect(imgBox!.width).toBeLessThanOrEqual(cardBox!.width + 1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('the generated cover file is served as an SVG', async ({ request }) => {
    const res = await request.get('covers/typesafe-docs.svg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/svg+xml');
    expect(await res.text()).toContain('<svg');
  });
});

test.describe('deployment base (R-12)', () => {
  test('AC-12-7: the list page is served under the base and its links keep it', async ({ page }) => {
    await page.goto('entries');
    expect(new URL(page.url()).pathname.startsWith(BASE_ROOT)).toBe(true);

    const hrefs = await page.locator('.card h3 a').evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href.startsWith(BASE_ROOT), href).toBe(true);
  });

  test('AC-12-7: the generated covers resolve under the base', async ({ page }) => {
    await page.goto('entries');
    const src = await page
      .locator('[data-cover="generated"] img')
      .first()
      .getAttribute('src');
    expect(src?.startsWith(BASE_ROOT), src ?? '').toBe(true);
    const res = await page.request.get(src!);
    expect(res.status()).toBe(200);
  });

  test('AC-12-7: canonical and hreflang point at the deployed URL', async ({ page }) => {
    await page.goto('entries');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain(`${BASE_ROOT}entries`.replace('//', '/'));
    const alternates = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href') ?? ''));
    expect(alternates).toHaveLength(3);
    for (const href of alternates) expect(href).toContain(BASE_ROOT);
  });
});
