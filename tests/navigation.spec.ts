import { test, expect } from '@playwright/test';
test('welcome, navigation, reload and history work without invented encounters', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('presque');
  await page.getByRole('link', { name: 'Découvrir Nearly' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Place aux possibles.');
  await expect(page.getByText('Radar désactivé')).toBeVisible();
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
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Découvrir Nearly' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto('/#/inconnue');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ce chemin');
});
