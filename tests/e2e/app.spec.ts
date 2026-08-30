import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('opens the demo, identifies it, corrects it, and exports semantic HTML', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Fix a scanned table/);
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('img:not([alt])')).toHaveCount(0);
  const landingA11y = await new AxeBuilder({ page }).analyze();
  expect(landingA11y.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

  await page.getByRole('link', { name: /Try it with sample data/ }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('2 reading-order or cell errors')).toBeVisible();
  const workbenchA11y = await new AxeBuilder({ page }).analyze();
  expect(workbenchA11y.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Move Yes later' }).click();
  await expect(page.getByText('No structural errors detected')).toBeVisible();
  await expect(page.getByRole('table', { name: 'Current semantic table preview' })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export HTML' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/html\.html$/);
  expect(consoleErrors).toEqual([]);
});

test('fits the core workflow on a 390px viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/');
  await page.getByRole('link', { name: /Try it with sample data/ }).click();
  await expect(page.getByRole('heading', { name: 'Review reading order' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole('button', { name: 'Move Yes later' }).click();
  await expect(page.getByText('No structural errors detected')).toBeVisible();
});

test('preserves hero artwork proportions, visible naming, and mobile touch targets', async ({ page }, testInfo) => {
  await page.goto('/');
  const wordmark = page.getByRole('link', { name: 'Table proofing desk', exact: true });
  await expect(wordmark).toBeVisible();
  await expect(wordmark).not.toHaveAttribute('aria-label');
  const mismatch = await new AxeBuilder({ page }).withRules(['label-content-name-mismatch']).analyze();
  expect(mismatch.violations).toEqual([]);

  const hero = page.locator('.hero-art img');
  const image = await hero.evaluate((element: HTMLImageElement) => ({
    width: element.clientWidth,
    height: element.clientHeight,
    source: element.currentSrc,
  }));
  expect(Math.abs(image.width / image.height - 1280 / 853)).toBeLessThan(0.02);
  expect(image.source).toContain(testInfo.project.name === 'mobile' ? 'proofing-table-640.webp' : 'proofing-table.webp');

  if (testInfo.project.name === 'mobile') {
    const targets = await page.locator('.merchant a, footer nav a').evaluateAll((links) => links.map((link) => {
      const rect = link.getBoundingClientRect();
      return { name: link.textContent?.trim(), width: rect.width, height: rect.height };
    }));
    expect(targets.length).toBeGreaterThan(0);
    expect(targets.filter((target) => target.width < 44 || target.height < 44)).toEqual([]);
  }
});

test('rejects oversized imported grid coordinates before persistence', async ({ page }) => {
  await page.goto('/');
  await page.locator('#ocr-file').setInputFiles({
    name: 'unsafe-grid.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ cells: [{ text: 'Unsafe', row: 10_000, column: 1 }] })),
  });
  await expect(page.getByText(/Block 1 row 10000 is outside the supported 1–99 range/)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Fix a scanned table/ })).toBeVisible();
  const stored = await page.evaluate(async () => {
    const request = indexedDB.open('table-proofing-desk', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const result = await new Promise((resolve, reject) => {
      const get = db.transaction('projects').objectStore('projects').get('current');
      get.onsuccess = () => resolve(get.result ?? null);
      get.onerror = () => reject(get.error);
    });
    db.close();
    return result;
  });
  expect(stored).toBeNull();
});

test('rejects editor values above 99 and keeps the last safe persisted value', async ({ page }) => {
  await page.goto('/demo');
  const row = page.locator('[data-cell="c1"] [data-field="row"]');
  await row.fill('100');
  await row.press('Tab');
  await expect(page.getByRole('alert')).toContainText(/Row 100 is outside the supported 1–99 range/);
  await expect(row).toHaveValue('1');
  await page.reload();
  await expect(page.locator('[data-cell="c1"] [data-field="row"]')).toHaveValue('1');
});

test('repairs a legacy unsafe saved coordinate before rendering @claim:legacy-recovery', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'desktop project only');
  await page.goto('/');
  await page.locator('#ocr-file').setInputFiles({ name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ cells: [{ id: 'c1', text: 'Legacy', row: 1, column: 1 }] })) });
  await page.evaluate(async () => {
    const request = indexedDB.open('table-proofing-desk', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const project = await new Promise<any>((resolve, reject) => {
      const get = db.transaction('projects').objectStore('projects').get('current');
      get.onsuccess = () => resolve(get.result);
      get.onerror = () => reject(get.error);
    });
    project.cells[0].row = 10_000;
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('projects', 'readwrite');
      transaction.objectStore('projects').put(project);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText(/moved to the nearest boundary/);
  await expect(page.locator('[data-cell="c1"] [data-field="row"]')).toHaveValue('99');
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(20_000);
});

test('builds hardened static deployment policy', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'desktop project only');
  const response = await request.get('/staticwebapp.config.json');
  expect(response.ok()).toBe(true);
  const config = await response.json();
  expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders['Content-Security-Policy']).toContain("style-src-attr 'unsafe-inline'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  expect(config.responseOverrides['404'].rewrite).toBe('/404.html');
  expect(config.routes.find((route: { route: string }) => route.route === '/assets/*').headers['Cache-Control']).toContain('immutable');
  expect(config.routes.find((route: { route: string }) => route.route === '/manifest.json').headers['Cache-Control']).toContain('must-revalidate');
  const manifest = await request.get('/manifest.json');
  expect(manifest.headers()['content-type']).toContain('application/json');
});

test('supports keyboard correction, reduced motion, and a private core flow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'desktop project only');
  const offOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  const sample = page.getByRole('link', { name: /Try it with sample data/ });
  await sample.focus();
  await page.keyboard.press('Enter');
  const move = page.getByRole('button', { name: 'Move Yes later' });
  expect(await move.evaluate((element) => element.tabIndex)).toBe(0);
  await move.focus();
  await page.keyboard.press('Space');
  await expect(page.getByText('No structural errors detected')).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  expect(await page.locator('.button').first().evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(0.001);
  expect(offOrigin).toEqual([]);
});

test('reloads the app shell and saved table check offline', async ({ page, context }) => {
  test.skip(test.info().project.name !== 'chromium', 'desktop project only');
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Review reading order' })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/You’re offline/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review reading order' })).toBeVisible();
});

test('serves legal pages directly', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page).toHaveTitle(/Privacy/);
  await expect(page.locator('main h1')).toHaveCount(1);
  await page.goto('/terms/');
  await expect(page).toHaveTitle(/Terms/);
  await expect(page.getByText(/Core checking and HTML, CSV, JSON/)).toBeVisible();
});

test('sets route metadata, supports history focus, and renders a styled 404', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Accessible Table OCR Check — fix reading order');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://accessible-table-ocr-check.sociobot.in/');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page).toHaveTitle('Privacy — Accessible Table OCR Check');
  await expect(page.getByRole('heading', { name: 'How we handle your documents' })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { name: /Fix a scanned table/ })).toBeFocused();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'How we handle your documents' })).toBeFocused();

  await page.goto('/definitely-not-a-real-route-qa');
  await expect(page).toHaveTitle('Page not found — Accessible Table OCR Check');
  await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to the table checker' })).toBeVisible();

  expect((await request.get('/robots.txt')).ok()).toBe(true);
  expect(await (await request.get('/sitemap.xml')).text()).toContain('/demo');
});

test('keeps the required header and footer skeleton on every route', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy/', '/terms/', '/missing-page']) {
    await page.goto(route);
    await expect(page.locator('header .wordmark')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Demo' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(page.getByText(/Built by Param Factory · Build polish-1/)).toBeVisible();
    await expect(page.locator('main h1')).toHaveCount(1);
  }
});
