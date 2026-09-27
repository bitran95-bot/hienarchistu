import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import { installFixtures, siteData, sanityQuery } from './support/fixtures';

test.beforeEach(async ({ page }) => { await installFixtures(page); });

test('homepage content and contact are usable before CMS responds', async ({ page, isMobile }, testInfo) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(sanityQuery, async route => {
    await pending;
    await route.fulfill({ json: { result: siteData } });
  });
  try {
    await page.goto('/');
    await expect(page.locator(isMobile ? 'h1' : '#main-logo')).toBeVisible();
    await expect(page.getByText('Loading space...', { exact: true })).toHaveCount(0);
    await expect(page.locator(isMobile ? '#about' : '#hero-desc')).toContainText('Hiên is a small architecture studio');
    await expect(page.locator('#root > div')).toHaveCSS('opacity', '1');
    if (isMobile) await expect(page.locator('#about').locator('..')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: testInfo.outputPath('homepage-before-content.png') });
    await page.getByRole('button', { name: 'Contact', exact: true }).first().click();
    await expect(page.getByRole('dialog', { name: 'Contact' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Contact' })).toHaveCount(0);
    if (!isMobile) {
      await page.getByRole('link', { name: 'Projects', exact: true }).click();
      await expect(page).toHaveURL(/\/projects$/);
      await expect(page.getByRole('heading', { name: 'Our Projects' })).toBeVisible();
    }
  } finally {
    release();
  }
  await expect(page.getByRole('heading', { name: 'Courtyard House' })).toBeVisible();
});

test('desktop navigation is usable while the 3D JavaScript is pending', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mobile does not request the desktop canvas.');
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/(?:assets\/DesktopCanvas-[^/]+\.js|src\/components\/DesktopCanvas\.tsx)(?:\?|$)/, async route => {
    await pending;
    await route.continue();
  });
  try {
    await page.goto('/');
    await expect(page.locator('#main-logo')).toBeVisible();
    await expect(page.locator('#hero-desc')).toContainText(siteData.settings.heroDescription);
    await expect(page.getByRole('status', { name: 'Loading 3D model...' })).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    await page.getByRole('button', { name: 'Contact', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Contact' })).toBeVisible();
    await page.keyboard.press('Escape');
  } finally {
    release();
  }
  await expect(page.locator('canvas')).toBeVisible();
});

test('a slow project model keeps its local spinner without blocking the homepage', async ({ page, isMobile }, testInfo) => {
  test.skip(isMobile, 'The mobile homepage has no canvas.');
  test.setTimeout(60_000);
  const withModel = { ...siteData, projects: [{ ...siteData.projects[0], modelFileUrl: '/pending-model.glb' }] };
  await page.route(sanityQuery, route => route.fulfill({ json: { result: withModel } }));
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/pending-model.glb', async route => {
    await pending;
    await route.fulfill({ contentType: 'model/gltf-binary', body: await readFile('public/magazine.glb') });
  });
  try {
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();
    const spinner = page.getByRole('status', { name: /Loading 3D model.*Courtyard House/ });
    await expect(spinner).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('link', { name: 'View in project list ↗' })).toBeVisible({ timeout: 25_000 });
    await page.screenshot({ path: testInfo.outputPath('homepage-during-model-load.png') });
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The 3D space could not load' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Contact', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Contact' })).toBeVisible();
    await page.keyboard.press('Escape');
  } finally {
    release();
  }
  await expect(page.getByRole('status', { name: /Loading 3D model.*Courtyard House/ })).toHaveCount(0, { timeout: 20_000 });
  await expect(page.locator('canvas')).toBeVisible();
});

test('a broken project model leaves the scene and navigation usable', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The mobile homepage has no canvas.');
  const withModel = { ...siteData, projects: [{ ...siteData.projects[0], modelFileUrl: '/broken-model.glb' }] };
  await page.route(sanityQuery, route => route.fulfill({ json: { result: withModel } }));
  await page.route('**/broken-model.glb', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('alert', { name: '3D model of Courtyard House' })).toContainText('Please view the project photos', { timeout: 20_000 });
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('#hero-desc')).toContainText(siteData.settings.heroDescription);
  await expect(page.getByRole('heading', { name: 'The 3D space could not load' })).toHaveCount(0);
  await page.getByRole('link', { name: 'View in project list ↗' }).click();
  await expect(page.getByRole('heading', { name: 'Courtyard House' })).toBeVisible();
});
