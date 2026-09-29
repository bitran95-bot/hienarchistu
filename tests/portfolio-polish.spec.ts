import { test, expect } from '@playwright/test';
import { installFixtures, sanityQuery, siteData } from './support/fixtures';
import { createTestPdf } from './support/testPdf';

test.beforeEach(async ({ page }) => { await installFixtures(page); });

test('every contact entry offers the form and direct Services loads CMS settings', async ({ page }) => {
  await page.route(sanityQuery, route => route.fulfill({ json: { result: { ...siteData, settings: { ...siteData.settings, instagram: 'https://instagram.com/studio_fixture' } } } }));
  await page.goto('/services');
  await page.getByRole('button', { name: 'Contact Us Now', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Contact', exact: true });
  await expect(dialog.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'studio_fixture' })).toHaveAttribute('href', 'https://instagram.com/studio_fixture');
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await page.goto('/');
  await page.getByRole('button', { name: /^Contact/ }).first().click();
  await expect(dialog.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
});

test('project consultation preserves context and only reports a successful API response', async ({ page }) => {
  let submitted: Record<string, unknown> = {};
  await page.route('**/api/contact', route => {
    submitted = route.request().postDataJSON();
    return route.fulfill({ json: { success: true } });
  });
  await page.goto('/projects/courtyard-house');
  await page.getByRole('button', { name: 'Discuss a similar project' }).click();
  const dialog = page.getByRole('dialog', { name: 'Contact', exact: true });
  await expect(dialog.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue(/Courtyard House/);
  await dialog.getByRole('textbox', { name: 'Full name', exact: true }).fill('Preview Test');
  await dialog.getByRole('textbox', { name: 'Email', exact: true }).fill('preview@example.com');
  await dialog.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText(/successfully/i);
  expect(submitted.project).toBe('Courtyard House');
  expect(submitted.page).toBe('/projects/courtyard-house');
});

test('Back dismisses the expanded photo before leaving a project', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Fullscreen photos are opened from the mobile viewer.');
  await page.route(sanityQuery, route => route.fulfill({ json: { result: { ...siteData, projects: [{ ...siteData.projects[0], gallery: [{ _type: 'image', asset: { _ref: 'image-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-1x1-png' } }] }] } } }));
  await page.goto('/projects');
  await page.getByRole('button', { name: 'View details: Courtyard House' }).click();
  const viewer = page.getByRole('dialog', { name: 'Courtyard House', exact: true });
  await viewer.getByRole('button', { name: 'Next image' }).click();
  await viewer.getByRole('button', { name: 'Zoom in' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(2);
  await page.goBack();
  await expect(page).toHaveURL(/\/projects\/courtyard-house$/);
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('PDF can be enlarged, panned, reset and navigated without breaking its URL', async ({ page }) => {
  await page.route(sanityQuery, route => route.fulfill({ json: { result: { ...siteData, projects: [{ ...siteData.projects[0], image: undefined, pdfFileUrl: '/sample.pdf' }] } } }));
  await page.route('**/sample.pdf', route => route.fulfill({ contentType: 'application/pdf', body: createTestPdf() }));
  await page.goto('/projects/courtyard-house?media=pdf-1');
  const viewer = page.getByRole('dialog', { name: 'Courtyard House' });
  const canvas = viewer.getByRole('img', { name: 'PDF page 1' }).locator('canvas');
  await expect(canvas).toBeVisible();
  const width = (await canvas.boundingBox())!.width;
  await viewer.getByRole('button', { name: 'Zoom in PDF', exact: true }).click();
  await expect.poll(async () => (await canvas.boundingBox())?.width).toBeGreaterThan(width * 1.4);
  await expect(viewer.getByRole('link', { name: 'Original PDF' })).toHaveAttribute('href', '/sample.pdf');
  await viewer.getByRole('button', { name: 'Fit PDF' }).click();
  await expect.poll(async () => (await canvas.boundingBox())?.width).toBeLessThan(width + 2);
  await viewer.getByRole('button', { name: 'Next image' }).click();
  await expect(page).toHaveURL(/media=pdf-2$/);
});

test('Services details open immediately under the selected mobile step', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Accordion is the compact layout.');
  await page.goto('/services');
  const trigger = page.getByRole('button', { name: /02 Concept Design/ });
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const panel = page.getByRole('region', { name: /02 Concept Design/ });
  await expect(panel).toBeVisible();
  const triggerBox = (await trigger.boundingBox())!;
  const panelBox = (await panel.boundingBox())!;
  expect(Math.abs(panelBox.y - triggerBox.y - triggerBox.height)).toBeLessThan(3);
});

test('reduced motion leaves project titles visible and complete', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/courtyard-house');
  await expect(page.getByRole('heading', { name: 'Courtyard House', exact: true, level: 2 })).toBeVisible();
  const words = page.locator('.editorial-heading .reveal-word > span');
  await expect(words.last()).toHaveCSS('animation-name', 'none');
});
