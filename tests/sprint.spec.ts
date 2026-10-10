import { test, expect } from '@playwright/test';
test('onboarding saves profile, preferences and session across reload', async ({ page }) => {
  await page.goto('/#/connexion'); await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('E-mail de démonstration').fill('alice@example.test'); await page.getByRole('button', { name: 'Créer mon compte local' }).click();
  await page.getByLabel('Prénom', { exact: true }).fill('Alice'); await page.getByLabel('Date de naissance privée').fill('1998-05-12');
  await page.getByLabel('Présentation', { exact: true }).fill('Un profil de test.'); await page.getByLabel('Intention', { exact: true }).selectOption('Faire connaissance');
  await page.getByRole('button', { name: 'Ajouter une photo fictive' }).click(); await page.getByRole('button', { name: 'Valider mon onboarding' }).click();
  await expect(page.getByRole('heading', { name: 'Alice', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Questionnaire d’attirance et préférences' }).click(); await page.getByRole('button', { name: 'Homme', exact: true }).click();
  await page.getByLabel('Âge minimum').fill('25'); await page.getByRole('button', { name: 'Enregistrer mes préférences' }).click();
  await page.reload(); await expect(page.getByLabel('Âge minimum')).toHaveValue('25'); await expect(page.getByRole('button', { name: 'Homme', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('navigation').getByRole('link', { name: 'Profil', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Alice', exact: true })).toBeVisible();
  await expect(page.getByLabel('Activer le radar de démonstration')).not.toBeChecked();
  await page.getByRole('button', { name: 'Personnaliser mon profil' }).click(); await page.getByLabel('Prénom', { exact: true }).fill('Ali'); await page.getByRole('button', { name: 'Enregistrer mon profil' }).click(); await page.reload(); await expect(page.getByRole('heading', { name: 'Ali', exact: true })).toBeVisible();
});
test('heart reading, reciprocal match, message persistence and blocking', async ({ page }) => {
  await page.goto('/#/coeurs'); const card = page.locator('.received-card').filter({ has: page.getByRole('heading', { name: 'Lucas, 27 ans' }) });
  await card.getByRole('button', { name: 'Marquer comme lu' }).click(); await card.getByRole('button', { name: 'Envoyer un cœur en retour' }).click();
  await card.getByRole('link', { name: 'Ouvrir la conversation' }).click(); await page.getByLabel('Votre message').fill('Bonjour Lucas ♡'); await page.getByRole('button', { name: 'Envoyer', exact: true }).click(); await page.reload(); await expect(page.getByText('Bonjour Lucas ♡')).toBeVisible();
  await page.getByText('Profil et sécurité', { exact: true }).click(); await page.getByLabel('Motif du signalement').fill('Signalement de test'); await page.getByRole('button', { name: 'Signaler localement' }).click(); await expect(page.getByRole('status')).toContainText('Aucun service de modération connecté');
  await page.getByRole('button', { name: 'Bloquer ce profil' }).click(); await expect(page.getByRole('heading', { name: 'Conversation indisponible' })).toBeVisible(); await page.reload(); await expect(page.getByRole('heading', { name: 'Conversation indisponible' })).toBeVisible();
});
test('verification failure retry success and provisional trust pages', async ({ page }) => {
  await page.goto('/#/verification'); await page.getByRole('button', { name: 'Commencer' }).click(); await page.getByRole('button', { name: 'Refuser', exact: true }).click(); await page.getByRole('button', { name: 'Recommencer' }).click(); await page.getByRole('button', { name: 'Autoriser pour la simulation' }).click(); await page.getByRole('button', { name: 'Capturer le portrait fictif' }).click(); await page.getByRole('button', { name: 'Simuler une réussite' }).click(); await expect(page.getByRole('heading', { name: 'Vérification réussie · démo' })).toBeVisible();
  await page.goto('/#/confiance/confidentialite'); await expect(page.getByText('Texte provisoire de conception — non juridique, non définitif.')).toBeVisible();
  await page.goto('/#/laboratoire'); await expect(page.getByRole('heading', { level: 1 })).toContainText('Ce chemin');
});
test('messaging and form fit small smartphone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 }); await page.goto('/#/messages/aurore:sacha');
  await page.getByLabel('Votre message').fill('Un message'); await page.getByRole('button', { name: 'Envoyer', exact: true }).click(); await expect(page.getByText('Un message', { exact: true })).toBeVisible();
  expect(await page.locator('.phone-content').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.goto('/#/profil'); await page.getByRole('button', { name: 'Personnaliser mon profil' }).click(); expect(await page.locator('.phone-content').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
});
