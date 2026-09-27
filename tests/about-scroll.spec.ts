import { test, expect } from '@playwright/test';
import { installFixtures, siteData } from './support/fixtures';

test.beforeEach(async ({ page }) => { await installFixtures(page); });

for (const viewport of [{ width: 1280, height: 720 }, { width: 768, height: 1024 }]) {
  test(`desktop introduction follows wheel scrolling at ${viewport.width}px`, async ({ page, isMobile }, testInfo) => {
    test.skip(isMobile, 'Mobile uses the normal document scroll.');
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('#hero-desc')).toContainText(siteData.settings.heroDescription);
    await expect(page.locator('#main-logo')).toHaveAttribute('style', /scale\(/);

    const about = page.locator('#about-section');
    const initialTop = (await about.boundingBox())!.y;
    await page.mouse.move(viewport.width * 0.9, viewport.height * 0.55);
    await page.mouse.wheel(0, viewport.height * 0.3);
    await expect.poll(async () => (await about.boundingBox())!.y).toBeLessThan(initialTop - viewport.height * 0.12);

    const middleTop = (await about.boundingBox())!.y;
    await page.mouse.wheel(0, viewport.height * 0.35);
    await expect.poll(async () => (await about.boundingBox())!.y).toBeLessThan(middleTop - viewport.height * 0.12);
    await expect(page.locator('#about-text-2')).toHaveCSS('clip-path', 'inset(0px 0% 0px 0px)');
    await expect(about).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: testInfo.outputPath('about-after-scroll.png') });

    const lowerTop = (await about.boundingBox())!.y;
    await page.mouse.wheel(0, -viewport.height * 0.3);
    await expect.poll(async () => (await about.boundingBox())!.y).toBeGreaterThan(lowerTop + viewport.height * 0.12);

    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page).toHaveURL(/\/projects$/);
  });
}
