import { readFile } from 'node:fs/promises';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const appOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173').origin;

const sampleCell = (overrides: Record<string, unknown> = {}) => ({
  id: 'cell-1', text: 'Route', row: 1, column: 1, role: 'columnheader', readingOrder: 1,
  bbox: [10, 10, 40, 20], ...overrides,
});

async function databaseRecord(page: Page, name: string) {
  return page.evaluate(async (databaseName) => {
    const request = indexedDB.open(databaseName, 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => request.result.createObjectStore('projects', { keyPath: 'id' });
    });
    const record = await new Promise<unknown>((resolve, reject) => {
      const get = db.transaction('projects').objectStore('projects').get('current');
      get.onsuccess = () => resolve(get.result ?? null);
      get.onerror = () => reject(get.error);
    });
    db.close();
    return record;
  }, name);
}

async function importJson(page: Page, selector: string, data: unknown, name = 'table.json') {
  await page.locator(selector).setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
}

async function downloadText(page: Page, buttonName: string) {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: buttonName, exact: true }).click();
  const download = await pending;
  const path = await download.path();
  if (!path) throw new Error(`No file path for ${buttonName}`);
  return readFile(path, 'utf8');
}

async function freshPage(context: BrowserContext) {
  const page = await context.newPage();
  await page.goto('/');
  return page;
}

test('direct demo is ready, resettable, and isolated @claim:demo-ready @claim:demo-isolation', async ({ page }) => {
  await page.goto('/');
  await importJson(page, '#ocr-file', { sourcePage: 'Private scan', cells: [sampleCell({ text: 'Private value' })] }, 'private.json');
  await expect(page.locator('[data-cell="cell-1"] [data-field="text"]')).toHaveValue('Private value');
  await page.waitForTimeout(350);
  const realBefore = await databaseRecord(page, 'table-proofing-desk');

  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page).toHaveTitle('Demo — Accessible Table OCR Check');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.cell-row')).toHaveCount(9);
  await expect(page.getByText('2 reading-order or cell errors')).toBeVisible();
  await page.locator('[data-action="quick-demo-fix"]').click();
  await expect(page.getByText('No structural errors detected')).toBeVisible();
  expect(await databaseRecord(page, 'table-proofing-desk')).toEqual(realBefore);

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('2 reading-order or cell errors')).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('[data-cell="cell-1"] [data-field="text"]')).toHaveValue('Private value');
  expect(await databaseRecord(page, 'table-proofing-desk')).toEqual(realBefore);
  expect(await databaseRecord(page, 'demo:table-proofing-desk')).toBeNull();
});

test('does not let a queued demo autosave recreate isolated data after exit', async ({ page }) => {
  await page.goto('/');
  await importJson(page, '#ocr-file', { sourcePage: 'Private scan', cells: [sampleCell({ text: 'Private value' })] }, 'private.json');
  await page.waitForTimeout(350);
  const realBefore = await databaseRecord(page, 'table-proofing-desk');

  await page.goto('/demo');
  await page.locator('[data-action="quick-demo-fix"]').click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('2 reading-order or cell errors')).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.waitForTimeout(350);
  expect(await databaseRecord(page, 'table-proofing-desk')).toEqual(realBefore);
  expect(await databaseRecord(page, 'demo:table-proofing-desk')).toBeNull();
});

test('corrects reading order and exports scoped HTML @claim:proof-and-export', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.overlay')).toHaveCount(9);
  await page.locator('[data-action="quick-demo-fix"]').click();
  const html = await downloadText(page, 'Export HTML');
  expect(html).toContain('<th scope="col">Route</th>');
  expect(html).toContain('<th scope="row">River</th>');
  expect(html).toContain('Community mobility report, p. 42');
  expect(html.indexOf('12 of 14')).toBeLessThan(html.indexOf('Yes'));
});

test('keeps documents in-browser without third-party runtime requests @claim:browser-local @claim:no-document-upload @claim:pages-stay-local @claim:no-third-party-runtime @claim:indexeddb-only', async ({ page }) => {
  const requests: Array<{ url: string; body: string | null }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), body: request.postData() }));
  await page.goto('/demo');
  await page.locator('[data-cell="c5"] [data-field="text"]').fill('PRIVATE-DOCUMENT-MARKER');
  await page.locator('[data-cell="c5"] [data-field="text"]').press('Tab');
  await downloadText(page, 'Export CSV');
  await page.reload();
  await expect(page.locator('[data-cell="c5"] [data-field="text"]')).toHaveValue('PRIVATE-DOCUMENT-MARKER');
  await page.route('**/api/license/verify?**', (route) => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  const licenseRequest = page.waitForRequest('**/api/license/verify?**');
  await page.goto('/demo?license=recorded-license-token');
  const license = await licenseRequest;
  const licenseParts = [license.url(), JSON.stringify(license.headers()), license.postData() ?? ''].join('\n');
  expect(licenseParts).not.toContain('PRIVATE-DOCUMENT-MARKER');
  expect(requests.every((request) => new URL(request.url).origin === appOrigin)).toBe(true);
  expect(requests.every((request) => !request.body?.includes('PRIVATE-DOCUMENT-MARKER'))).toBe(true);
  const state = await page.evaluate(async () => ({
    databases: (await indexedDB.databases()).map((item) => item.name),
    localKeys: Object.keys(localStorage),
    cookies: document.cookie,
    externalResources: performance.getEntriesByType('resource').map((item) => item.name).filter((url) => new URL(url).origin !== location.origin),
  }));
  expect(state.databases).toContain('demo:table-proofing-desk');
  expect(state.localKeys).toContain('sb_license:accessible-table-ocr-check');
  expect(state.cookies).toBe('');
  expect(state.externalResources).toEqual([]);
});

test('stores a license token locally and checks it at most once per day @claim:license-token-cadence', async ({ page }) => {
  const verificationRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/license/verify') verificationRequests.push(request.url());
  });
  await page.route('**/api/license/verify?**', (route) => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('sb_license:accessible-table-ocr-check', 'recorded-license-token');
    localStorage.setItem('sb_license:accessible-table-ocr-check:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.reload();
  await page.waitForTimeout(100);
  expect(verificationRequests).toHaveLength(0);
  const keys = await page.evaluate(() => Object.keys(localStorage).sort());
  expect(keys).toEqual(['sb_license:accessible-table-ocr-check', 'sb_license:accessible-table-ocr-check:verdict']);
  await page.evaluate(() => localStorage.setItem('sb_license:accessible-table-ocr-check:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() - 86_400_001 })));
  const request = page.waitForRequest('**/api/license/verify?**');
  await page.reload();
  await request;
  expect(verificationRequests).toHaveLength(1);
});

test('removes paid saved versions after a recorded revoked verdict while keeping exports @claim:revoked-license', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  try {
  let verdict = { valid: true, reason: 'ok' };
  await page.route('**/api/license/verify?**', (route) => route.fulfill({ json: { ...verdict, expires_at: null } }));
  await page.goto('/demo?license=recorded-valid-license');
  await expect(page.getByRole('button', { name: 'Save version' })).toBeVisible();
  await page.evaluate(() => {
    localStorage.setItem('sb_license:accessible-table-ocr-check', 'recorded-revoked-license');
    localStorage.setItem('sb_license:accessible-table-ocr-check:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() - 86_400_001 }));
  });
  verdict = { valid: false, reason: 'revoked' };
  const request = page.waitForRequest('**/api/license/verify?**');
  await page.reload();
  await request;
  await expect(page.getByText('This license is no longer active. Free checking and exports are unchanged.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save version' })).toHaveCount(0);
  expect(await downloadText(page, 'Export HTML')).toContain('<table>');
  expect(await downloadText(page, 'Export CSV')).toContain('Route');
  expect(await downloadText(page, 'Export issue report')).toContain('ACCESSIBLE TABLE OCR CHECK');
  expect(JSON.parse(await downloadText(page, 'Export project JSON')).cells).toHaveLength(9);
  } finally {
    await context.close();
  }
});

test('reloads, edits, and exports offline in its own context @claim:offline-reload', async ({ browser }) => {
  const context = await browser.newContext();
  try {
    const page = await freshPage(context);
    await page.goto('/demo');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText(/You’re offline/)).toBeVisible();
    await page.locator('[data-action="quick-demo-fix"]').click();
    const csv = await downloadText(page, 'Export CSV');
    expect(csv).toContain('River,12 of 14,Yes');
  } finally {
    await context.close();
  }
});

test('accepts each image format and either import order @claim:import-formats @claim:either-import-order', async ({ browser }) => {
  const formats = [
    ['page.png', 'image/png'], ['page.jpg', 'image/jpeg'], ['page.webp', 'image/webp'], ['page.svg', 'image/svg+xml'],
  ];
  for (const [name, mimeType] of formats) {
    const context = await browser.newContext();
    const page = await freshPage(context);
    await page.locator('#image-file').setInputFiles({ name, mimeType, buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>') });
    await importJson(page, '#replace-ocr', { cells: [sampleCell()] });
    await expect(page.locator('.cell-row')).toHaveCount(1);
    await context.close();
  }
  const context = await browser.newContext();
  const page = await freshPage(context);
  await importJson(page, '#ocr-file', { cells: [sampleCell()] });
  await page.locator('#empty-image').setInputFiles({ name: 'page.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>') });
  await expect(page.locator('.source-canvas img')).toBeVisible();
  await context.close();
});

test('accepts documented JSON shapes and normalizes fields and boxes @claim:ocr-schema @claim:json-shapes @claim:field-normalization @claim:bbox-formats', async ({ page }) => {
  await page.goto('/');
  const variants = [
    { width: 1000, height: 500, cells: [sampleCell({ text: 'Cells', bbox: [100, 50, 400, 100] })] },
    { blocks: [sampleCell({ id: 'cell-2', text: 'Blocks', type: 'row_header', bbox: [0.1, 0.1, 0.4, 0.2] })] },
    { pages: [{ cells: [sampleCell({ id: 'cell-3', text: 'Nested cells', bbox: [10, 10, 40, 20] })] }] },
    { pages: [{ blocks: [sampleCell({ id: 'cell-4', text: 'Nested blocks', value: 'Normalized value', column: 2, readingOrder: 4 })] }] },
  ];
  await importJson(page, '#ocr-file', variants[0]);
  for (let index = 0; index < variants.length; index++) {
    if (index) await importJson(page, '#replace-ocr', variants[index]);
    await expect(page.locator('.cell-row')).toHaveCount(1);
  }
  await expect(page.locator('[data-field="text"]')).toHaveValue('Nested blocks');
  await expect(page.locator('[data-field="col"]')).toHaveValue('2');
});

test('shows overlays, maps labels, and reports seeded jumps @claim:reading-order-overlays', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.overlay')).toHaveCount(9);
  await expect(page.locator('.overlay').first()).toHaveAttribute('aria-label', /Reading order 1: Route, row 1, column 1/);
  await expect(page.getByText('2 reading-order or cell errors')).toBeVisible();
  await expect(page.getByText(/Reading order 5 jumps to row 2, column 3/)).toBeVisible();
  await expect(page.getByText(/Reading order 6 jumps to row 2, column 2/)).toBeVisible();
});

test('updates text, positions, and header roles @claim:cell-corrections', async ({ page }) => {
  await page.goto('/demo');
  const row = page.locator('[data-cell="c5"]');
  await row.locator('[data-field="text"]').fill('Fourteen');
  await row.locator('[data-field="role"]').selectOption('rowheader');
  await row.locator('[data-field="row"]').fill('4');
  await row.locator('[data-field="col"]').fill('2');
  await row.locator('[data-field="col"]').press('Tab');
  await expect(page.getByRole('table').getByText('Fourteen')).toBeVisible();
  const html = await downloadText(page, 'Export HTML');
  expect(html).toContain('<th scope="row">Fourteen</th>');
});

test('downloads every promised format without a license @claim:all-exports @claim:free-core @claim:free-state', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Free table checking is active')).toBeVisible();
  const html = await downloadText(page, 'Export HTML');
  const csv = await downloadText(page, 'Export CSV');
  const report = await downloadText(page, 'Export issue report');
  const json = await downloadText(page, 'Export project JSON');
  expect(html).toContain('<table>');
  expect(csv.trim().split('\n')).toHaveLength(3);
  expect(report).toContain('ACCESSIBLE TABLE OCR CHECK');
  expect(JSON.parse(json).cells).toHaveLength(9);
});

test('uses the registered checkout and app verification paths @claim:sociobot-billing-path', async ({ page }) => {
  await page.route('**/api/license/verify?**', (route) => route.fulfill({ json: { valid: false, reason: 'invalid', expires_at: null } }));
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Get Desk license' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/accessible-table-ocr-check/checkout');
  const request = page.waitForRequest('**/api/license/verify?**');
  await page.goto('/?license=recorded-invalid-license');
  expect(new URL((await request).url()).pathname).toBe('/api/license/verify');
});

test('stores and restores licensed saved versions locally @claim:licensed-saved-versions @claim:local-saved-versions', async ({ page }) => {
  const offOrigin: string[] = [];
  const requestPaths: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    requestPaths.push(url.pathname);
    if (url.origin !== appOrigin) offOrigin.push(request.url());
  });
  await page.route('**/api/license/verify?**', (route) => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/?license=recorded-valid-license');
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Save version' })).toBeVisible();
  await page.locator('#checkpoint-name').fill('Before correction');
  await page.getByRole('button', { name: 'Save version' }).click();
  await page.locator('[data-cell="c5"] [data-field="text"]').fill('Changed');
  await page.locator('[data-cell="c5"] [data-field="text"]').press('Tab');
  await page.getByRole('button', { name: 'Restore', exact: true }).click();
  await expect(page.locator('[data-cell="c5"] [data-field="text"]')).toHaveValue('12 of 14');
  const stored = await databaseRecord(page, 'demo:table-proofing-desk') as { checkpoints: unknown[] };
  expect(stored.checkpoints).toHaveLength(1);
  expect(offOrigin).toEqual([]);
  expect(requestPaths).toContain('/api/license/verify');
});

test('enforces cell and grid limits before replacing saved work @claim:import-limits @claim:rejection-before-write', async ({ page }) => {
  await page.goto('/');
  const cells = Array.from({ length: 500 }, (_, index) => sampleCell({ id: `c-${index}`, text: `Cell ${index}`, row: Math.floor(index / 99) + 1, column: index % 99 + 1 }));
  await importJson(page, '#ocr-file', { cells }, 'five-hundred.json');
  await expect(page.locator('.cell-row')).toHaveCount(500);
  const before = await databaseRecord(page, 'table-proofing-desk');
  await importJson(page, '#replace-ocr', { cells: [...cells, sampleCell({ id: 'too-many' })] }, 'too-many.json');
  await expect(page.getByRole('alert')).toContainText('more than 500 blocks');
  expect(await databaseRecord(page, 'table-proofing-desk')).toEqual(before);
  await importJson(page, '#replace-ocr', { cells: [sampleCell({ row: 100 })] }, 'too-wide.json');
  await expect(page.getByRole('alert')).toContainText('outside the supported 1–99 range');
  expect(await databaseRecord(page, 'table-proofing-desk')).toEqual(before);
});

test('round-trips project JSON through OCR import @claim:project-round-trip', async ({ page }) => {
  await page.goto('/demo');
  const exported = await downloadText(page, 'Export project JSON');
  const original = JSON.parse(exported);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await importJson(page, '#ocr-file', original, 'round-trip.json');
  await expect(page.locator('.cell-row')).toHaveCount(9);
  const texts = await page.locator('[data-field="text"]').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  expect(texts).toEqual(original.cells.map((cell: { text: string }) => cell.text));
});

test('clears the real working copy @claim:clear-table-check', async ({ page }) => {
  await page.goto('/');
  await importJson(page, '#ocr-file', { cells: [sampleCell()] });
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear table check' }).click();
  await expect(page.getByRole('heading', { name: /Fix a scanned table/ })).toBeVisible();
  await page.reload();
  expect(await databaseRecord(page, 'table-proofing-desk')).toBeNull();
});

test('ships an inline shell and a human-check-only image state @claim:inline-offline-shell @claim:human-check-only', async ({ page, request }) => {
  const response = await request.get('/index.html');
  const html = await response.text();
  expect(html).not.toMatch(/<script[^>]+src="\/assets\//);
  expect(html).not.toMatch(/<link[^>]+href="\/assets\/.+\.css/);
  await page.goto('/');
  await page.locator('#image-file').setInputFiles({ name: 'scan.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>') });
  await expect(page.getByText('No OCR cells yet. Import JSON or add the first cell.')).toBeVisible();
  await expect(page.getByText(/does not create OCR or check spelling/)).toHaveCount(0);
});

test('build includes direct documents for every public route @claim:direct-route-documents', async ({ request }) => {
  for (const path of ['/demo/index.html', '/privacy/index.html', '/terms/index.html', '/404.html']) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    expect(await response.text()).toContain('<div id="app"></div>');
  }
});
