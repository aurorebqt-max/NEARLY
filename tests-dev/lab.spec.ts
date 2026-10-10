import { test, expect } from '@playwright/test';
import { initialState } from '../src/data/fixtures';
test('complete crossing to conversation through development lab', async ({ page }) => {
  const seed = initialState(); seed.hearts = []; seed.suggestions = []; seed.conversations = [];
  await page.addInitScript(data => { if (!localStorage.getItem('nearly.demo.v1')) localStorage.setItem('nearly.demo.v1', JSON.stringify(data)); }, seed);
  await page.goto('/#/laboratoire'); await page.getByRole('button', { name: 'Autoriser les radars des deux profils' }).click(); await page.getByRole('button', { name: 'Simuler un croisement' }).click();
  await page.getByRole('button', { name: 'Observer comme Lucas' }).click(); await page.getByRole('link', { name: 'Ouvrir Rencontres', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Aurore, 28 ans' })).toHaveCount(0);
  await page.getByRole('button', { name: /Découvrir le profil fictif/ }).click(); await expect(page.getByRole('heading', { name: 'Aurore, 28 ans' })).toBeVisible(); await page.getByRole('button', { name: 'Envoyer un cœur', exact: true }).click();
  await page.goto('/#/laboratoire'); await page.getByRole('button', { name: 'Observer comme Aurore' }).click(); await page.getByRole('link', { name: 'Ouvrir Cœurs', exact: true }).click();
  await page.getByRole('button', { name: 'Marquer comme lu' }).click(); await page.getByRole('button', { name: 'Envoyer un cœur en retour' }).click(); await page.getByRole('link', { name: 'Ouvrir la conversation' }).click();
  await page.getByLabel('Votre message').fill('À bientôt !'); await page.getByRole('button', { name: 'Envoyer', exact: true }).click(); await page.reload(); await expect(page.getByText('À bientôt !')).toBeVisible();
});
