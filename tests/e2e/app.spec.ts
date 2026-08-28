import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('opens a scrambled proof, identifies it, corrects it, and exports semantic HTML', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Make the table read/);
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('img:not([alt])')).toHaveCount(0);
  const landingA11y = await new AxeBuilder({ page }).analyze();
  expect(landingA11y.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

  await page.getByRole('button', { name: /Open a scrambled sample/ }).click();
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
  await page.getByRole('button', { name: /Open a scrambled sample/ }).click();
  await expect(page.getByRole('heading', { name: 'Review reading order' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole('button', { name: 'Move Yes later' }).click();
  await expect(page.getByText('No structural errors detected')).toBeVisible();
});

test('reloads the app shell and saved proof offline', async ({ page, context }) => {
  test.skip(test.info().project.name !== 'chromium', 'desktop project only');
  await page.goto('/');
  await page.getByRole('button', { name: /Open a scrambled sample/ }).click();
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
  await expect(page.getByText(/Core reviewing and HTML, CSV, JSON/)).toBeVisible();
});
