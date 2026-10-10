import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
test('real account, private photo, preferences and session survive reload and sign-in', async ({ page }) => {
  const status = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  expect(status.API_URL).toMatch(/^http:\/\/(127\.0\.0\.1|localhost):54321$/);
  const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY || status.SECRET_KEY, { auth: { persistSession: false } });
  const email = `nearly-browser-${crypto.randomUUID()}@example.test`, password = crypto.randomUUID() + 'Aa9!';
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  const id = data.user.id;
  try {
    await page.goto('/#/connexion');
    await page.getByLabel('E-mail', { exact: true }).fill(email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await page.getByLabel('Prénom', { exact: true }).fill('Alice backend');
    await page.getByLabel('Date de naissance privée').fill('1995-04-01');
    await page.getByLabel('Présentation', { exact: true }).fill('Profil persistant Supabase');
    await page.getByRole('combobox', { name: 'Intention', exact: true }).selectOption('Faire connaissance');
    // Real browser-generated PNG exercises decoding/re-encoding and Storage upload.
    const png = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 16; c.getContext('2d')!.fillRect(0, 0, 16, 16); return c.toDataURL('image/png').split(',')[1]; });
    await page.getByLabel('Ajouter une photo', { exact: true }).setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
    await expect(page.getByText('Photo enregistrée.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Valider mon onboarding' }).click();
    await expect(page.getByRole('heading', { name: 'Alice backend', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Questionnaire d’attirance et préférences' }).click();
    await page.getByLabel('Âge minimum').fill('25');
    await page.getByRole('button', { name: 'Enregistrer mes préférences' }).click();
    await expect(page.getByText('Préférences enregistrées.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Âge minimum')).toHaveValue('25');
    await page.getByRole('navigation').getByRole('link', { name: 'Profil', exact: true }).click();
    await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
    await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible();
    await page.getByLabel('E-mail', { exact: true }).fill(email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Alice backend', exact: true })).toBeVisible();
    const { data: profiles, error: readError } = await admin.from('profiles').select('first_name').eq('id', id);
    expect(readError).toBeNull(); expect(profiles?.[0].first_name).toBe('Alice backend');
    await page.getByRole('button', { name: 'Revenir à la démo isolée' }).click();
    await expect(page.getByText('DÉMO FICTIVE', { exact: true })).toBeVisible();
  } finally {
    await page.close();
    const { data: files } = await admin.storage.from('profile-photos').list(id);
    if (files?.length) await admin.storage.from('profile-photos').remove(files.map(f => `${id}/${f.name}`));
    await admin.auth.admin.deleteUser(id);
  }
});
