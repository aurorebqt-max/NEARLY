import { test, expect } from '@playwright/test';
import { initialState } from '../src/data/fixtures';
import { defaultPreferences } from '../src/data/config';
import { evaluateCompatibility, ageAt } from '../src/domain/compatibility';
import { accessible, block, cross, sendHeart, sendMessage, setVisibility } from '../src/services/social';
import { login, register } from '../src/services/auth';
import { validateProfile } from '../src/services/profile';
import { validatePreferences } from '../src/services/preferences';

test('directional compatibility respects essential criteria and weighted traits', () => {
  const s = initialState(); const candidate = s.profiles[1]; const p = defaultPreferences();
  expect(evaluateCompatibility(p, candidate).matches).toBe(false);
  p.genders = ['Homme']; expect(evaluateCompatibility(p, candidate).matches).toBe(true);
  p.ageRange = [60, 90]; expect(evaluateCompatibility(p, candidate).matches).toBe(false);
  p.ageRange = [18, 99]; p.physical = { traits: { hair: 'Blonds' }, weight: 3 }; p.personality = { values: ['Curieux'], weight: 1 };
  expect(evaluateCompatibility(p, candidate).matches).toBe(false);
  p.physical.weight = 0; expect(evaluateCompatibility(p, candidate).matches).toBe(true);
  candidate.birthDate = '2015-01-01'; expect(evaluateCompatibility(p, candidate).matches).toBe(false);
  expect(ageAt('2008-10-11', new Date('2026-10-10'))).toBe(17);
});
test('crossing delivers to candidate, independent reverse, no implicit hearts and deduplicates', () => {
  const s = initialState(); s.suggestions = []; s.hearts = []; s.conversations = [];
  s.preferences.lucas.genders = null;
  cross(s, 'aurore', 'lucas'); expect(s.suggestions).toHaveLength(0);
  setVisibility(s, 'aurore', true, false); setVisibility(s, 'lucas', true, false);
  cross(s, 'aurore', 'lucas'); cross(s, 'aurore', 'lucas');
  expect(s.suggestions).toHaveLength(1); expect(s.suggestions[0]).toMatchObject({ from: 'aurore', to: 'lucas' }); expect(s.hearts).toHaveLength(0);
  sendHeart(s, 'lucas', 'aurore'); sendHeart(s, 'lucas', 'aurore'); expect(s.hearts).toHaveLength(1); expect(s.conversations).toHaveLength(0);
  sendHeart(s, 'aurore', 'lucas'); sendHeart(s, 'aurore', 'lucas'); expect(s.conversations).toHaveLength(1);
  expect(s.hearts.filter(h => h.to === 'aurore' && !h.read)).toHaveLength(1);
});
test('pause preserves discovery, invisible permanently revokes, expiry and block enforce access', () => {
  const s = initialState();
  setVisibility(s, 'noah', false, false); expect(accessible(s, 'noah', 'aurore')).toBe(true);
  setVisibility(s, 'noah', false, true); setVisibility(s, 'noah', true, false); expect(accessible(s, 'noah', 'aurore')).toBe(false);
  s.suggestions.forEach(x => { x.expires = 0; }); expect(accessible(s, 'sacha', 'aurore')).toBe(false);
  const hearts = s.hearts.length; block(s, 'aurore', 'noah'); sendHeart(s, 'aurore', 'noah'); expect(s.hearts).toHaveLength(hearts);
  block(s, 'aurore', 'sacha'); sendMessage(s, 'aurore:sacha', 'interdit'); expect(s.conversations[0].messages).toHaveLength(1);
});
test('conversation requires match membership and new messages are unread for recipient', () => {
  const s = initialState(); sendMessage(s, 'missing', 'no');
  s.active = 'lucas'; sendMessage(s, 'aurore:sacha', 'no'); expect(s.conversations[0].messages).toHaveLength(1);
  s.active = 'aurore'; sendMessage(s, 'aurore:sacha', '  Bonjour  '); expect(s.conversations[0].messages.at(-1)).toMatchObject({ text: 'Bonjour', read: false, from: 'aurore' });
});
test('local account validation and default consent', () => {
  const s = initialState(); register(s, 'test@example.test'); const id = s.active; const p = s.profiles.at(-1)!;
  expect(p.radar).toBe(false); expect(p.onboarded).toBe(false); expect(validateProfile(p)).not.toBe('');
  expect(() => register(s, 'test@example.test')).toThrow(); s.active = 'aurore'; login(s, 'TEST@example.test'); expect(s.active).toBe(id);
  expect(validatePreferences({ ...defaultPreferences(), ageRange: [40, 18] })).not.toBe('');
});
