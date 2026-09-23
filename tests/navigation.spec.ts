import { test, expect } from '@playwright/test';

test('presentation is preserved and smartphone navigation works', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('presque');
  await page.getByRole('link', { name: 'Découvrir Nearly' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Un cœur peut tout changer.');
  await expect(page.getByText('DÉMO FICTIVE')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('2 cœurs non lus');
  await page.screenshot({ path: testInfo.outputPath('home.png') });
  for (const [label, title] of [['Rencontres', 'Rencontres'], ['Cœurs', 'Vos cœurs'], ['Profil', 'Votre profil']]) {
    const link = page.getByRole('navigation').getByRole('link', { name: label, exact: true });
    await link.click();
    await expect(link).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    expect(await page.locator('.phone-content').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const before = await page.getByRole('navigation').boundingBox();
    await page.locator('.phone-content').evaluate(el => el.scrollTo(0, el.scrollHeight));
    expect(await page.getByRole('navigation').boundingBox()).toEqual(before);
    await page.locator('.phone-content').evaluate(el => el.scrollTo(0, 0));
    await expect.poll(async () => page.locator('.phone-content').evaluate(el => el.scrollTop)).toBe(0);
    await page.locator('.phone-frame').screenshot({ path: testInfo.outputPath(`${label}.png`) });
  }
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Votre profil');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos cœurs');
  await page.getByRole('navigation').getByRole('link', { name: 'Accueil', exact: true }).click();
  await page.getByRole('link', { name: 'Revoir la présentation de Nearly' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Place aux possibles.');
  expect(errors).toEqual([]);
});

test('fictional hearts stay unread and animation only starts on increase', async ({ page }) => {
  await page.goto('/#/accueil');
  await expect(page.locator('.unread-heart')).toHaveAttribute('data-received', 'false');
  await expect(page.locator('.nearly-heart')).toHaveCSS('color', 'rgb(214, 91, 145)');
  await page.getByRole('button', { name: 'Simuler un cœur reçu' }).click();
  await expect(page.getByRole('status')).toContainText('3 cœurs non lus');
  await expect(page.locator('.unread-heart')).toHaveAttribute('data-received', 'true');
  await expect(page.locator('.nearly-heart')).toHaveCSS('animation-name', 'heart-arrival');
  await expect(page.locator('.nearly-heart')).toHaveCSS('color', 'rgb(214, 91, 145)');
  await page.getByRole('navigation').getByRole('link', { name: 'Cœurs', exact: true }).click();
  for (const name of ['Lucas', 'Noah', 'Sacha']) await expect(page.getByRole('heading', { name: new RegExp(name) })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Envoyer un cœur en retour' }).first()).toBeDisabled();
  await page.getByRole('navigation').getByRole('link', { name: 'Accueil', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('3 cœurs non lus');
  await expect(page.locator('.unread-heart')).toHaveAttribute('data-received', 'false');
  await expect(page.getByRole('button', { name: 'Cœur fictif ajouté' })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('status')).toContainText('2 cœurs non lus');
});

test('suggestions are anonymous until a fictional profile is opened', async ({ page }) => {
  await page.goto('/#/rencontres');
  await expect(page.getByText('Une rencontre potentielle est disponible 24 heures.')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Noah/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Découvrir le profil fictif 1' }).click();
  await expect(page.getByRole('heading', { name: 'Noah, 29 ans' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Envoyer un cœur', exact: false })).toBeDisabled();
});

test('320px, reduced motion, keyboard and unknown route', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/accueil');
  const skip = page.getByRole('button', { name: 'Aller au contenu' });
  await skip.focus();
  await expect(skip).toBeInViewport();
  await skip.click();
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('button', { name: 'Simuler un cœur reçu' }).click();
  await expect(page.locator('.nearly-heart')).toHaveCSS('animation-name', 'none');
  for (const label of ['Accueil', 'Rencontres', 'Cœurs', 'Profil']) {
    await page.getByRole('navigation').getByRole('link', { name: label, exact: true }).click();
    expect(await page.locator('.phone-content').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await expect(page.getByRole('navigation')).toBeInViewport();
  }
  await page.goto('/#/inconnue');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ce chemin');
});

test('tablet and desktop keep a centered portrait phone', async ({ page }) => {
  for (const viewport of [{ width: 820, height: 1180 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/#/accueil');
    const frame = await page.locator('.phone-frame').boundingBox();
    expect(frame).not.toBeNull();
    expect(frame!.width).toBeLessThanOrEqual(410);
    expect(frame!.height).toBeGreaterThan(frame!.width);
    expect(Math.abs(frame!.x + frame!.width / 2 - viewport.width / 2)).toBeLessThan(2);
    await expect(page.getByRole('navigation')).toBeInViewport();
  }
});
