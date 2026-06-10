import { test, expect } from '@playwright/test';

test('has title and primary elements', async ({ page }) => {
  await page.goto('/');

  // Expect the title to contain HIÊN
  await expect(page).toHaveTitle(/Hiên/);

  // Expect the 3D canvas to be rendered (it mounts into a div with id root)
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  // Scroll to Projects to see if navigation events fire
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('scroll-to-projects'));
  });

  // Verify that the navigation buttons are rendered in the DOM
  const nav = page.locator('nav').first();
  await expect(nav).toBeAttached();
});

test('projects page loads successfully', async ({ page }) => {
  await page.goto('/projects');
  
  // Projects page should have the grid
  await expect(page.locator('h1')).toContainText('Dự Án');
});
