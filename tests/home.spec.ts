import { test, expect } from '@playwright/test';
import { installFixtures, siteData, sanityQuery } from './support/fixtures';

test.beforeEach(async ({ page }) => { await installFixtures(page); });

test('home renders the appropriate experience for the device', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Hiên/);
  if (isMobile) {
    await expect(page.getByRole('heading', { name: 'Hiên studio', level: 1 })).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Courtyard House' })).toBeVisible();
  } else {
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0, { timeout: 20_000 });
    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page).toHaveURL(/\/projects$/);
  }
});

test('projects load, search and open details', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: 'Our Projects' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Courtyard House' })).toBeVisible();
  await page.getByPlaceholder('Search projects...').fill('nonexistent');
  await expect(page.getByRole('heading', { name: 'Courtyard House' })).toHaveCount(0);
  await page.getByPlaceholder('Search projects...').fill('Courtyard');
  await page.getByRole('heading', { name: 'Courtyard House' }).click();
  await expect(page.getByText('A quiet courtyard for family life.', { exact: true })).toBeVisible();
});

test('mobile home offers clear portfolio and contact actions', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'The desktop homepage uses its own navigation.');
  await page.goto('/');
  const viewProjects = page.getByRole('button', { name: 'View projects' });
  await expect(viewProjects).toBeVisible();
  await viewProjects.click();
  await expect(page.getByRole('heading', { name: 'Projects', level: 2 })).toBeInViewport();
  await page.getByRole('button', { name: 'Contact', exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'Contact' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Contact' })).toHaveCount(0);
});

test('Our Story link from a subpage reaches the homepage section', async ({ page, isMobile }) => {
  await page.goto('/projects');
  await page.getByRole('link', { name: 'Our Story' }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/#about$/);
  if (isMobile) {
    await expect(page.locator('#about')).toBeInViewport();
  } else {
    await expect(page.locator('canvas')).toBeVisible();
  }
});

test('project cards open with a keyboard', async ({ page }) => {
  await page.goto('/projects');
  const card = page.getByRole('button', { name: 'View details: Courtyard House' });
  await card.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Courtyard House' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
});

for (const path of ['/', '/projects']) {
  test(`CMS failure can be retried on ${path}`, async ({ page, isMobile }) => {
    let fail = true;
    await page.route(sanityQuery, async route => {
      await route.fulfill(fail
        ? { status: 400, json: { error: { description: 'Test CMS unavailable' } } }
        : { json: { result: siteData } });
    });
    await page.goto(path);
    await expect(page.getByRole('alert')).toContainText('Content could not load');
    fail = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('alert')).toHaveCount(0);
    if (path === '/projects' || isMobile) {
      await expect(page.getByRole('heading', { name: 'Courtyard House' })).toBeVisible();
    } else {
      await expect(page.locator('canvas')).toBeVisible();
    }
  });
}

test('a broken 3D asset offers a working 2D portfolio', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mobile already uses the 2D layout.');
  await page.route('**/LampModel/bankers_lamp.glb', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('3D space could not load');
  await page.getByRole('link', { name: 'View project list' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole('heading', { name: 'Courtyard House' })).toBeVisible();
});

test('shop failure can be retried', async ({ page }) => {
  let fail = true;
  await page.route(sanityQuery, route => route.fulfill(fail
    ? { status: 400, json: { error: { description: 'Test CMS unavailable' } } }
    : { json: { result: [] } }));
  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: 'Could not load products' })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: /Try again/ }).click();
  await expect(page.getByRole('heading', { name: 'Could not load products' })).toHaveCount(0);
  await expect(page.getByText('0 products', { exact: true })).toBeVisible();
});

test('contact preserves failures and clears only a confirmed send', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/contact', route => {
    attempts++;
    return route.fulfill(attempts === 1
      ? { status: 503, json: { success: false, error: 'contact_unavailable' } }
      : { json: { success: true } });
  });
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Contact', exact: true }).filter({ visible: true }).click();
  await page.getByLabel('Full name', { exact: true }).fill('Preview Test');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Preview test only.');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Something went wrong');
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Preview test only.');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Message sent successfully');
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('');
  expect(attempts).toBe(2);
});
