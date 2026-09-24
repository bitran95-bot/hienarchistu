import { test, expect } from '@playwright/test';
import { installFixtures, siteData, sanityQuery } from './support/fixtures';

test.beforeEach(async ({ page }) => { await installFixtures(page); });

test('home renders the appropriate experience for the device', async ({ page, isMobile }) => {
  const backgroundTextureRequests: string[] = [];
  page.on('request', request => {
    if (/\/textures\/(?:beige_wall|plywood)/.test(request.url())) {
      backgroundTextureRequests.push(request.url());
    }
  });
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
    await expect.poll(() => backgroundTextureRequests.some(url => url.includes('plywood_diff_2k.jpg'))).toBe(true);
    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page).toHaveURL(/\/projects$/);
  }
  expect(backgroundTextureRequests.some(url => url.includes('beige_wall'))).toBe(false);
});

test('desktop project viewer starts with a rotatable model, then shows project photos', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop uses the editorial split layout.');
  const withModel = {
    ...siteData,
    projects: [{ ...siteData.projects[0], modelFileUrl: '/magazine.glb?v=3', gallery: [siteData.projects[0].image] }],
  };
  await page.route(sanityQuery, route => route.fulfill({ json: { result: withModel } }));
  await page.goto('/projects');
  await page.getByRole('button', { name: 'View details: Courtyard House' }).click();
  const viewer = page.getByRole('dialog', { name: 'Courtyard House' });
  await expect(viewer.getByRole('group', { name: '3D model of Courtyard House' })).toBeVisible();
  await expect(viewer.locator('canvas')).toBeVisible();
  await viewer.getByRole('button', { name: 'Next image' }).click();
  await expect(viewer.getByRole('group', { name: '3D model of Courtyard House' })).toHaveCount(0);
  await expect(viewer.getByRole('img', { name: 'Courtyard House 2' })).toBeVisible();
});

test('desktop home hash opens a Vietnamese project name after reload', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The mobile home does not render the 3D bookshelf.');
  const localized = {
    ...siteData,
    projects: [{ ...siteData.projects[0], name: 'Nhà Trên Đồi' }],
  };
  await page.route(sanityQuery, route => route.fulfill({ json: { result: localized } }));
  await page.goto('/#nha-tren-doi');
  await expect(page.getByRole('dialog', { name: 'Nhà Trên Đồi' })).toBeVisible();
});

test('project viewer over the 3D scene accepts Next and wheel scrolling', async ({ page, isMobile }) => {
  test.setTimeout(60_000); // Software-rendered WebGL can delay input on CI runners.
  test.skip(isMobile, 'The mobile home does not render the 3D bookshelf.');
  const withImages = {
    ...siteData,
    projects: [{
      ...siteData.projects[0],
      gallery: [{ _type: 'image', asset: { _ref: 'image-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-1x1-png' } }],
      content: 'A quiet courtyard for family life. '.repeat(150),
    }],
  };
  await page.route(sanityQuery, route => route.fulfill({ json: { result: withImages } }));
  await page.goto('/#courtyard-house');
  const viewer = page.getByRole('dialog', { name: 'Courtyard House' });
  await expect(viewer).toBeVisible({ timeout: 20_000 });
  await viewer.getByRole('button', { name: 'Next image' }).click();
  await expect(viewer.getByRole('img', { name: 'Courtyard House 2' })).toBeVisible();
  const information = viewer.locator('section').first();
  expect(await information.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  await expect.poll(async () => {
    await information.hover();
    await page.mouse.wheel(0, 500);
    return information.evaluate(element => element.scrollTop);
  }, { timeout: 15_000 }).toBeGreaterThan(0);
});

test('mobile project detail can reveal and rotate its 3D model', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Desktop uses the editorial split layout.');
  const withModel = {
    ...siteData,
    projects: [{ ...siteData.projects[0], modelFileUrl: '/magazine.glb?v=3' }],
  };
  await page.route(sanityQuery, route => route.fulfill({ json: { result: withModel } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'View details: Courtyard House' }).click();
  const viewer = page.getByRole('dialog', { name: 'Courtyard House' });
  await viewer.getByRole('button', { name: 'View 3D model' }).click();
  await expect(viewer.getByRole('group', { name: '3D model of Courtyard House' })).toBeVisible();
  await expect(viewer.locator('canvas')).toBeVisible();
  await viewer.getByRole('button', { name: 'View photos' }).click();
  await expect(viewer.locator('canvas')).toHaveCount(0);
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

test('a project link opens the shared project viewer and survives a reload', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/projects');
  await page.getByRole('button', { name: 'View details: Courtyard House' }).click();
  await expect(page).toHaveURL(/\/projects\/courtyard-house$/);
  await expect(page.getByRole('dialog', { name: 'Courtyard House' })).toBeVisible();
  await page.getByRole('button', { name: 'Copy project link' }).click();
  await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://hienarchistu.vercel.app/projects/courtyard-house');
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', 'https://hienarchistu.vercel.app/projects/courtyard-house');
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole('dialog', { name: 'Courtyard House' })).toHaveCount(0);
  await page.goto('/projects/courtyard-house');
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Courtyard House' })).toBeVisible();
  await page.getByRole('dialog', { name: 'Courtyard House' }).getByRole('button', { name: 'Close' }).click();
  await expect(page).toHaveURL(/\/projects$/);
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
  await page.getByRole('button', { name: 'Chuyển sang Tiếng Việt' }).click();
  await expect(page.getByRole('button', { name: 'Xem dự án' })).toBeVisible();
});

test('mobile home leaves 3D assets unloaded on a cold visit', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'The desktop homepage needs the 3D scene.');
  const sceneRequests: string[] = [];
  page.on('request', request => {
    if (/\/textures\/|\.glb(?:\?|$)|DesktopCanvas-[^/]+\.js/.test(request.url())) {
      sceneRequests.push(request.url());
    }
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Courtyard House' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(sceneRequests).toEqual([]);
});

test('tablet-width home keeps the desktop portfolio reachable', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Check the tablet breakpoint from a desktop browser context.');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0, { timeout: 20_000 });
  await page.getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole('heading', { name: 'Our Projects' })).toBeVisible();
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

test('share metadata stays unique across navigation', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Use the visible desktop navigation for this route check.');
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: 'Our Projects' })).toBeVisible();
  await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', 'https://hienarchistu.vercel.app/projects');
  await expect(page.locator('head meta[property="og:url"]')).toHaveCount(1);
  await page.getByRole('link', { name: 'Services', exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', 'https://hienarchistu.vercel.app/services');
  await expect(page.locator('head meta[property="og:url"]')).toHaveCount(1);
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
