import { test, expect } from '@playwright/test';
import { installFixtures, siteData } from './support/fixtures';

test.beforeEach(async ({ page }) => { await installFixtures(page); });

for (const viewport of [{ width: 1280, height: 720 }, { width: 768, height: 1024 }]) {
  test(`desktop introduction follows wheel scrolling at ${viewport.width}px`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mobile uses the normal document scroll.');
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('#hero-desc')).toContainText(siteData.settings.heroDescription);
    await expect(page.locator('#main-logo')).toHaveAttribute('style', /scale\(/);

    const first = page.locator('#about-text-1');
    const second = page.locator('#about-text-2');
    const ink = (selector: string) => page.locator(selector).evaluate(element =>
      Number.parseFloat(getComputedStyle(element).getPropertyValue('--about-ink')));
    // Aim at the empty wall above the interactive project models.
    await page.mouse.move(viewport.width * 0.9, viewport.height * 0.18);
    await page.mouse.wheel(0, viewport.height * 0.3);
    await expect.poll(() => ink('#about-text-1'), { timeout: 15_000 }).toBeGreaterThan(40);
    await expect(second).toHaveCSS('opacity', '0');
    expect(await ink('#about-text-2')).toBe(0);
    await page.mouse.wheel(0, viewport.height * 0.35);
    await expect.poll(() => ink('#about-text-2'), { timeout: 15_000 }).toBeGreaterThan(111);
    await expect(first).toHaveCSS('opacity', '1');
    await expect(second).toHaveCSS('opacity', '1');

    await page.mouse.wheel(0, -viewport.height * 0.3);
    await expect.poll(() => ink('#about-text-2'), { timeout: 15_000 }).toBeLessThan(112);

  });
}

test('reduced motion reveals both paragraphs without the staged movement', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mobile uses its own document layout.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('#main-logo')).toHaveAttribute('style', /scale\(/);
  await page.getByRole('button', { name: 'Our Story' }).click();
  await expect.poll(() => page.locator('#about-text-2').evaluate(element =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue('--about-ink'))), { timeout: 20_000 }).toBeGreaterThan(111);
  await expect(page.locator('#about-text-1')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await expect(page.locator('#about-text-2')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('Our Story navigation lands with the full introduction visible', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mobile uses its own document layout.');
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await expect(page.locator('#main-logo')).toHaveAttribute('style', /scale\(/);
  await page.getByRole('button', { name: 'Our Story' }).click();
  await expect.poll(() => page.locator('#about-text-2').evaluate(element =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue('--about-ink'))), { timeout: 20_000 }).toBeGreaterThan(111);
});
