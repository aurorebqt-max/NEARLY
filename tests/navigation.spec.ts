import { test, expect } from '@playwright/test';
test('welcome, navigation, reload and history work without invented encounters', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('presque');
  await expect(page.getByRole('main')).toBeFocused();
  expect(await page.getByRole('button', { name: 'Aller au contenu' }).evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await page.screenshot({ path: testInfo.outputPath('welcome.png'), fullPage: true });
  await page.getByRole('link', { name: 'Découvrir Nearly' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Place aux possibles.');
  await expect(page.getByText('Radar désactivé')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  for (const label of ['Rencontres', 'Cœurs', 'Profil']) {
    const link = page.getByRole('navigation').getByRole('link', { name: label, exact: true });
    await link.click();
    await expect(link).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: 'Revenir à l’accueil' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('être vous');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Un cœur');
  expect(errors).toEqual([]);
});
test('small viewport, reduced motion and unknown route', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.nearly-heart')).toHaveCSS('animation-name', 'none');
  const skip = page.getByRole('button', { name: 'Aller au contenu' });
  expect(await skip.evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await skip.focus();
  await expect(skip).toBeInViewport();
  await skip.click();
  await expect(page.getByRole('main')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Découvrir Nearly' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto('/#/inconnue');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ce chemin');
});
