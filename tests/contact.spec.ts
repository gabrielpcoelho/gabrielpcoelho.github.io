import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const destinations = [
  'https://www.linkedin.com/in/gabriel-p-coelho/',
  'https://github.com/gabrielpcoelho',
  'https://orcid.org/0009-0004-6029-5557',
  'mailto:gabrielpereiracoelho18@gmail.com',
];
const brands = ['LinkedIn', 'GitHub', 'ORCID', 'E-mail'];

test('approved destinations, order, native navigation and local icons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gabriel Pereira Coelho');
  const links = page.getByRole('navigation').getByRole('link');
  await expect(links).toHaveCount(destinations.length);
  for (let i = 0; i < destinations.length; i++) {
    await expect(links.nth(i)).toHaveAttribute('href', destinations[i]);
    await expect(links.nth(i)).toContainText(brands[i]);
    const icon = links.nth(i).locator('img');
    expect(await icon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
  }
  await expect(links.last()).toHaveAccessibleName(/Enviar e-mail/);
  await page.route(destinations[1], route => route.fulfill({ contentType: 'text/html', body: '<h1>Destination reached</h1>' }));
  await links.nth(1).click();
  await expect(page).toHaveURL(destinations[1]);
  await expect(page.getByRole('heading')).toHaveText('Destination reached');
});

test('English selection translates interface and every fresh load resets to Portuguese', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-US' });
  await context.addInitScript(() => { localStorage.setItem('language', 'en'); sessionStorage.setItem('language', 'en'); });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByText('Pesquisador em IA Generativa · Mestrando em Computação', { exact: true })).toBeVisible();
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByText('Generative AI Researcher · MSc Student in Computer Science')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Page language' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Contact profiles' })).toBeVisible();
  for (const text of ['Professional connections', 'Code and projects', 'Research identity']) {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole('link').first()).toHaveAccessibleName(/Visit profile/);
  await expect(page.getByRole('link').last()).toHaveAccessibleName(/Send email/);
  await expect(page.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  expect(await page.locator('meta[name="description"]').getAttribute('content')).toContain('Generative AI Researcher');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('button', { name: 'Português' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'English' }).click();
  const newPage = await context.newPage();
  await newPage.goto('/');
  await expect(newPage.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await context.close();
});

test('missing and corrupt portrait show GC; supplied local portrait displays and translates alt', async ({ page }) => {
  await page.route('**/images/profile.jpg', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/');
  await expect(page.getByRole('img', { name: /iniciais GC/ })).toBeVisible();
  await expect(page.locator('img.portrait')).toHaveCount(0);
  await page.unroute('**/images/profile.jpg');
  await page.route('**/images/profile.jpg', route => route.fulfill({ contentType: 'image/jpeg', body: 'not an image' }));
  await page.reload();
  await expect(page.getByRole('img', { name: /iniciais GC/ })).toBeVisible();
  await page.unroute('**/images/profile.jpg');
  await page.route('**/images/profile.jpg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="teal"/></svg>' }));
  await page.reload();
  const portrait = page.getByRole('img', { name: 'Foto de Gabriel Pereira Coelho' });
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveCSS('object-fit', 'cover');
  await expect(page.getByText('GC', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('img', { name: 'Portrait of Gabriel Pereira Coelho' })).toBeVisible();
});

for (const width of [320, 375, 768, 1440]) {
  test(`responsive targets and overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const language of ['Português', 'English']) {
      await page.getByRole('button', { name: language }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
      for (const target of await page.locator('button, nav a').all()) {
        const box = await target.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    }
    await page.screenshot({ path: `test-results/contact-${width}.png`, fullPage: true });
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  });
}

test('keyboard focus, reduced motion, and accessibility in both languages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Português' })).toBeFocused();
  for (let i = 0; i < destinations.length + 1; i++) {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    expect(await focused.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  }
  await expect(page.getByRole('link').last()).toBeFocused();
  for (const language of ['Português', 'English']) {
    await page.getByRole('button', { name: language }).click();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  }
  expect(await page.locator('nav a').first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});
